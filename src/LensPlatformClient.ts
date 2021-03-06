import { OpenIdConnect } from "./OpenIdConnect";
import { UserService } from "./UserService";
import { SpaceService } from "./SpaceService";
import { TeamService } from "./TeamService";
import { PermissionsService } from "./PermissionsService";
import { InvitationService } from "./InvitationService";
import { PlanService } from "./PlanService";
import { BillingPageTokenService } from "./BillingPageTokenService";
import axios, { type AxiosRequestConfig, type AxiosProxyConfig } from "axios";
import pino from "pino";
import decode from "jwt-decode";
import { UserRolesService } from "./UserRolesService";
import http from "http";
import https from "https";

// Axios defaults to xhr adapter if XMLHttpRequest is available.
// LensPlatformClient supports using the http adapter if httpAdapter
// option is set to true
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const axiosHttpAdapter = require("axios/lib/adapters/http");

export interface LensPlatformClientOptions {
  accessToken?: string;
  getAccessToken?: (url?: string) => Promise<string>;
  keyCloakAddress: string;
  keycloakRealm: string;
  apiEndpointAddress: string;
  defaultHeaders?: RequestHeaders;
  // If true, Node.JS http adapter is used by axios for HTTP(S) requests
  httpAdapter?: boolean;
  logLevel?: "error" | "silent" | "debug";
  /**
   * Proxy configs to be passed to axios.
   */
  proxyConfigs?: AxiosProxyConfig;
  /**
   * HTTP agent to be used by axios.
   */
  httpAgent?: http.Agent;
  /**
   * HTTPS agent to be used by axios.
   */
  httpsAgent?: https.Agent;
}

type RequestHeaders = Record<string, string>;

interface DecodedAccessToken {
  acr: string;
  "allowed-origins": string[];
  aud: string;
  auth_time: number;
  azp: "string";
  email?: string;
  email_verified?: boolean;
  exp: number;
  given_name?: string;
  iat: number;
  iss: string;
  jti: string;
  name?: string;
  nonce: string;
  preferred_username?: string;
  realm_access: { roles: string[] };
  resource_access: { roles: string[] };
  scope: string;
  session_state: string;
  sub: string;
  typ: string;
}

type RequestLibrary = typeof axios;
type KeyOfRequestLibrary = keyof RequestLibrary;
type RequestOptions = AxiosRequestConfig;
const requestLibraryMethods: KeyOfRequestLibrary[] = ["get", "post", "put", "patch", "head", "delete"];

/**
 * Function to determine if func is a function of the request library for making a request
 */
const isRequestLibraryFunction = (
  func: any, key: KeyOfRequestLibrary,
): func is (RequestLibrary)["get"] |
(RequestLibrary)["post"] |
(RequestLibrary)["put"] |
(RequestLibrary)["patch"] |
(RequestLibrary)["head"] |
(RequestLibrary)["delete"] =>
  typeof func === "function" && requestLibraryMethods.includes(key);

class LensPlatformClient {
  accessToken: LensPlatformClientOptions["accessToken"];
  getAccessToken: LensPlatformClientOptions["getAccessToken"];
  keyCloakAddress: LensPlatformClientOptions["keyCloakAddress"];
  keycloakRealm: LensPlatformClientOptions["keycloakRealm"];
  apiEndpointAddress: LensPlatformClientOptions["apiEndpointAddress"];
  httpAdapter: LensPlatformClientOptions["httpAdapter"];
  logLevel: LensPlatformClientOptions["logLevel"];
  proxyConfigs: LensPlatformClientOptions["proxyConfigs"];
  httpAgent: LensPlatformClientOptions["httpAgent"];
  httpsAgent: LensPlatformClientOptions["httpsAgent"];
  logger: pino.Logger;
  user: UserService;
  space: SpaceService;
  roles: UserRolesService;
  team: TeamService;
  plan: PlanService;
  billingPageToken: BillingPageTokenService;
  permission: PermissionsService;
  invitation: InvitationService;
  openIDConnect: OpenIdConnect;
  defaultHeaders: RequestHeaders | undefined;

  constructor(options: LensPlatformClientOptions) {
    if (!options) {
      throw new Error(`Options can not be ${options}`);
    }

    const { accessToken, getAccessToken, httpAdapter, proxyConfigs, httpAgent, httpsAgent } = options;

    if (!accessToken && !getAccessToken) {
      throw new Error(`Both accessToken ${accessToken} or getAccessToken are ${getAccessToken}`);
    }

    this.logLevel = options.logLevel ?? "silent";
    this.logger = pino({ level: this.logLevel });

    this.accessToken = accessToken;
    this.httpAdapter = httpAdapter;
    this.proxyConfigs = proxyConfigs;
    this.httpAgent = httpAgent;
    this.httpsAgent = httpsAgent;
    this.getAccessToken = getAccessToken;
    this.keyCloakAddress = options.keyCloakAddress;
    this.keycloakRealm = options.keycloakRealm;
    this.apiEndpointAddress = options.apiEndpointAddress;
    this.defaultHeaders = options.defaultHeaders ?? {};

    this.user = new UserService(this);
    this.space = new SpaceService(this);
    this.roles = new UserRolesService(this);
    this.team = new TeamService(this);
    this.plan = new PlanService(this);
    this.permission = new PermissionsService(this);
    this.invitation = new InvitationService(this);
    this.billingPageToken = new BillingPageTokenService(this);
    this.openIDConnect = new OpenIdConnect(this);
  }

  async getToken(url?: string) {
    const token = this.getAccessToken && typeof this.getAccessToken === "function" ? await this.getAccessToken(url) : this.accessToken;

    return token;
  }

  async getDecodedAccessToken(): Promise<DecodedAccessToken | undefined> {
    const token = await this.getToken();

    if (token) {
      return decode(token);
    }

    return undefined;
  }

  get authHeader(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.accessToken}`,
    };
  }

  /**
   * A proxied version of request library that
   *
   * 1) Prints request/response in console (for developer to debug issues)
   * 2) Auto add `Authorization: Bearer [token]`
   *
   */
  get fetch() {
    const getToken = this.getToken.bind(this);
    const { defaultHeaders, httpAdapter, logger, proxyConfigs, httpAgent, httpsAgent } = this;
    const proxy = new Proxy(axios, {
      get(target: RequestLibrary, key: KeyOfRequestLibrary) {
        const prop = target[key];

        if (isRequestLibraryFunction(prop, key)) {
          return async (...arg: [string, RequestOptions, ...any]) => {
            try {
              const url = arg[0];

              // "get", "head", "delete" has options in the second parameter
              // "patch", "post", "put" has the options in the third parameter
              const hasBody = !["get", "head", "delete"].includes(key);

              const options = hasBody ? arg[2] : arg[1];
              const requestBody = hasBody ? arg[1] : null;
              const headers = options?.headers as RequestHeaders;
              let restOptions;

              if (headers) {
                const clone = { ...options };
                delete clone.headers;
                restOptions = clone;
              } else {
                restOptions = options;
              }

              // Print HTTP request info in developer console
              logger.debug(`${key?.toUpperCase()} ${url}`);

              const token = await getToken(url);

              const requestHeaders: RequestHeaders = {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...headers,
                ...defaultHeaders,
              };

              const requestOptions: RequestOptions = {
                headers: requestHeaders,
                ...(httpAdapter ? { adapter: axiosHttpAdapter } : {}),
                ...(proxyConfigs ? { proxy: proxyConfigs } : {}),
                ...(httpAgent ? { httpAgent } : {}),
                ...(httpsAgent ? { httpsAgent } : {}),
                // Merge options
                ...restOptions,
              };

              logger.debug(`request arguments ${JSON.stringify(requestOptions)}`);
              const response = await (hasBody ? prop(url, requestBody, requestOptions) : prop(url, requestOptions));

              // Body as JavaScript plain object
              const body: unknown = response.data;

              // Print HTTP response info in developer console
              logger.debug(`${key?.toUpperCase()} ${(response)?.status} ${(response)?.statusText} ${url} `);
              logger.debug(`response body: ${body}`);
              return body;
            } catch (error: unknown) {
              // @ts-expect-error
              logger.error(`error message: ${error?.message}`);
              // @ts-expect-error
              logger.error(`error response body: ${error?.response?.body}`);
              // eslint-disable-next-line @typescript-eslint/no-throw-literal
              throw error;
            }
          };
        }

        return prop;
      },
    });

    return proxy;
  }
}

export type { LensPlatformClient as LensPlatformClientType };
export default LensPlatformClient;

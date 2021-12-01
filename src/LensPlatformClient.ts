import { OpenIdConnect } from "./OpenIdConnect";
import { UserService } from "./UserService";
import { SpaceService } from "./SpaceService";
import { TeamService } from "./TeamService";
import { PermissionsService } from "./PermissionsService";
import { InvitationService } from "./InvitationService";
import { PlanService } from "./PlanService";
import { BillingPageTokenService } from "./BillingPageTokenService";
import axios, { AxiosRequestConfig } from "axios";
import pino from "pino";
import decode from "jwt-decode";
import type { HTTPErrCodeExceptionMap } from "./exceptions/utils";
import { handleException } from "./exceptions/utils";
import retry from "async-retry";
import { timeout } from "./helpers/timeout";

// Axios defaults to xhr adapter if XMLHttpRequest is available.
// LensPlatformClient supports using the http adapter if httpAdapter
// option is set to true
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const axiosHttpAdapter = require("axios/lib/adapters/http");

export interface LensPlatformClientOptions {
  accessToken?: string;
  getAccessToken?: () => Promise<string>;
  keyCloakAddress: string;
  keycloakRealm: string;
  apiEndpointAddress: string;
  defaultHeaders?: RequestHeaders;
  /** If true, Node.JS http adapter is used by axios for HTTP(S) requests */
  httpAdapter?: boolean;
  logLevel?: "error" | "silent" | "debug";
  /** If true, autoRetry on GET && NetworkError, default is true */
  autoRetry?: boolean;
  /** Retry interval in milliseconds, default is 1000ms */
  retryIntervalMs?: number;
  /** Retry attempts, default is 3 */
  retryMaxAttempts?: number;
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

export const defaultRetries = 3;
export const defaultRetryIntervalMS = 1000;

class LensPlatformClient {
  accessToken: LensPlatformClientOptions["accessToken"];
  getAccessToken: LensPlatformClientOptions["getAccessToken"];
  keyCloakAddress: LensPlatformClientOptions["keyCloakAddress"];
  keycloakRealm: LensPlatformClientOptions["keycloakRealm"];
  apiEndpointAddress: LensPlatformClientOptions["apiEndpointAddress"];
  httpAdapter: LensPlatformClientOptions["httpAdapter"];
  logLevel: LensPlatformClientOptions["logLevel"];
  logger: pino.Logger;
  user: UserService;
  space: SpaceService;
  team: TeamService;
  plan: PlanService;
  billingPageToken: BillingPageTokenService;
  permission: PermissionsService;
  invitation: InvitationService;
  openIDConnect: OpenIdConnect;
  defaultHeaders: RequestHeaders | undefined;
  autoRetry = true;
  retryIntervalMs = defaultRetryIntervalMS;
  retryMaxAttempts = defaultRetries;

  constructor(options: LensPlatformClientOptions) {
    if (!options) {
      throw new Error(`Options can not be ${options}`);
    }

    const {
      accessToken,
      getAccessToken,
      httpAdapter,
      autoRetry,
      retryIntervalMs,
      retryMaxAttempts,
    } = options;

    if (!accessToken && !getAccessToken) {
      throw new Error(`Both accessToken ${accessToken} or getAccessToken are ${getAccessToken}`);
    }

    this.logLevel = options.logLevel ?? "silent";
    this.logger = pino({ level: this.logLevel });

    this.accessToken = accessToken;
    this.httpAdapter = httpAdapter;
    if (typeof autoRetry === "boolean") {
      this.autoRetry = autoRetry;
    }

    if (typeof retryIntervalMs === "number") {
      this.retryIntervalMs = retryIntervalMs;
    }

    if (typeof retryMaxAttempts === "number") {
      this.retryMaxAttempts = retryMaxAttempts;
    }

    this.getAccessToken = getAccessToken;
    this.keyCloakAddress = options.keyCloakAddress;
    this.keycloakRealm = options.keycloakRealm;
    this.apiEndpointAddress = options.apiEndpointAddress;
    this.defaultHeaders = options.defaultHeaders ?? {};

    this.user = new UserService(this);
    this.space = new SpaceService(this);
    this.team = new TeamService(this);
    this.plan = new PlanService(this);
    this.permission = new PermissionsService(this);
    this.invitation = new InvitationService(this);
    this.billingPageToken = new BillingPageTokenService(this);
    this.openIDConnect = new OpenIdConnect(this);
  }

  async getToken() {
    const token = this.getAccessToken && typeof this.getAccessToken === "function" ? await this.getAccessToken() : this.accessToken;

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
   * Get throwExpected function
   */
  get throwExpected() {
    /**
     * Executes a given function, catching all exceptions. When an exception is caught
     * it is converted to strongly-typed `LensPlatformExtension` and thrown again.
     * @param fn - a function
     * @param exceptionsMap - map of HTTP error codes onto expected exception creators
     * @param retryInterval - time between retries
     * @param retries - How many times to retry
     * @returns the result of `fn`
     * @throws expected exceptions or `LensPlatformException` with code 400 if it caught something unexpected
     * @example
     * ```
     * const json = throwExpected(
     *  () => fetch.get(url),
     *    {
     *      404: e => e.url.includes("/user") ?
     *        new NotFoundException(`User ${username} not found`) :
     *        new NotFoundException(`Something else not found`),
     *      500: () => new TokenNotFoundException()
     *    }
     * );
     * ```
     */
    const throwExpected = async <T = any>(
      fn: () => Promise<T>,
      exceptionsMap: HTTPErrCodeExceptionMap = {},
    ) => {
      try {
        // First try
        const result = await fn();

        return result;
      } catch (error: unknown) {
        // Retry if the error is a Network error and GET
        if (
          axios.isAxiosError(error)
          // If it's an axios error but there is no response => a network error
          // See https://github.com/axios/axios#handling-errors
          && !error.response
          // ONLY retry for GET requests
          && error.config?.method === "get"
        ) {
          if (this.autoRetry) {
            await timeout(this.retryIntervalMs);
            try {
              const retriedResult = await retry<T>(
                async () =>
                // Second try
                  fn()
                , {
                  minTimeout: this.retryIntervalMs,
                  retries: this.retryMaxAttempts - 1 - 1, // Two `-1` because we already did two tries
                },

              );
              return retriedResult;
            } catch (error: unknown) {
              await handleException(error, exceptionsMap);
              return undefined;
            }
          }
        }

        await handleException(error, exceptionsMap);
      }
    };

    return throwExpected;
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
    const { defaultHeaders } = this;
    const { httpAdapter } = this;
    const { logger } = this;
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

              const token = await getToken();

              const requestHeaders: RequestHeaders = {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...headers,
                ...defaultHeaders,
              };

              const requestOptions = {
                headers: requestHeaders,
                ...(httpAdapter ? { adapter: axiosHttpAdapter } : {}),
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

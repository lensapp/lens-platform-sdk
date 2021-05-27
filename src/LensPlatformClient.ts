import { OpenIdConnect } from "./OpenIdConnect";
import { UserService } from "./UserService";
import { SpaceService } from "./SpaceService";
import { TeamService } from "./TeamService";
import { PermissionsService } from "./PermissionsService";
import { InvitationService } from "./InvitationService";
import { PlanService } from "./PlanService";

import decode from "jwt-decode";
import got from "got";
import _console from "./helpers/_console";
import type { Options, Got, Response, CancelableRequest } from "got";

export interface LensPlatformClientOptions {
  accessToken?: string;
  getAccessToken?: () => string;
  keyCloakAddress: string;
  keycloakRealm: string;
  apiEndpointAddress: string;
  defaultHeaders?: RequestHeaders;
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

class LensPlatformClient {
  accessToken: LensPlatformClientOptions["accessToken"];
  getAccessToken: LensPlatformClientOptions["getAccessToken"];
  keyCloakAddress: LensPlatformClientOptions["keyCloakAddress"];
  keycloakRealm: LensPlatformClientOptions["keycloakRealm"];
  apiEndpointAddress: LensPlatformClientOptions["apiEndpointAddress"];

  user: UserService;
  space: SpaceService;
  team: TeamService;
  plan: PlanService;
  permission: PermissionsService;
  invitation: InvitationService;
  openIDConnect: OpenIdConnect;
  defaultHeaders: RequestHeaders|undefined;

  constructor(options: LensPlatformClientOptions) {
    if (!options) {
      throw new Error(`Options can not be ${options}`);
    }

    const { accessToken, getAccessToken } = options;
    if (!accessToken && !getAccessToken) {
      throw new Error(`Both accessToken ${accessToken} or getAccessToken are ${getAccessToken}`);
    }

    this.accessToken = accessToken;
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
    this.openIDConnect = new OpenIdConnect(this);
  }

  get decodedAccessToken(): DecodedAccessToken | undefined {
    const { accessToken, getAccessToken } = this;
    const token = getAccessToken && typeof getAccessToken === "function" ? getAccessToken() : accessToken;
    if (token) {
      return decode(token);
    }

    return undefined;
  }

  /**
   * Retrieves an ID of a current user for whom
   * the authentication token was issued
   * @returns string
   * @throws Error("Could not process access token to retrieve `userId`")
   */
  get currentUserId(): string {
    if (!this.decodedAccessToken) {
      throw new Error("Could not process access token to retrieve `userId`");
    }

    return this.decodedAccessToken.sub;
  }

  get authHeader(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.accessToken}`
    };
  }

  /**
   * A proxied version of `got` that
   *
   * 1) Prints request/response in console (for developer to debug issues)
   * 2) Auto add `Authorization: Bearer [token]`
   *
   */
  get got() {
    const { accessToken, getAccessToken } = this;
    const token = getAccessToken && typeof getAccessToken === "function" ? getAccessToken() : accessToken;
    const defaultHeaders = this.defaultHeaders;
    const proxy = new Proxy(got, {
      get(target: Got, key: string) {
        // @ts-ignore
        const prop = target[key]; // Method = get/post/put etc

        if (typeof prop === "function") {
          return async (...arg: [string, Options, ...any]) => {
            try {
              const url = arg[0];
              let options = arg[1];
              const headers = arg[1]?.headers;
              let restOptions;
              if (headers) {
                const clone = Object.assign({}, options);
                delete clone.headers;
                restOptions = clone;
              } else {
                restOptions = options;
              }

              // Print HTTP request info in developer console
              _console.log(`${key?.toUpperCase()} ${url}`);

              const requestHeaders: RequestHeaders = {
                Authorization: `Bearer ${token}`,
                ...headers,
                ...defaultHeaders
              };

              const _arg = [
                url,
                {
                  headers: requestHeaders,
                  // Merge options
                  ...restOptions
                }
              ];

              _console.log(`request arguments ${JSON.stringify(_arg)}`);

              const responsePromise: CancelableRequest<Response<string>> = prop(..._arg);
              const [response, json] = await Promise.all([responsePromise, responsePromise?.json()]);

              // Print HTTP response info in developer console
              _console.log(`${key?.toUpperCase()} ${response?.statusCode} ${response?.statusMessage} ${url}`);
              _console.log(`response body: ${response?.body}`);

              return json;
            } catch (error: unknown) {
              // @ts-expect-error
              _console.error(`error message: ${error?.message}`);
              // @ts-expect-error
              _console.error(`error response body: ${error?.response?.body}`);
              throw error;
            }
          };
        }

        return prop;
      }
    });

    return proxy;
  }
}

export type { LensPlatformClient as LensPlatformClientType };
export default LensPlatformClient;

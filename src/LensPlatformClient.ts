import { OpenIdConnect } from "./OpenIdConnect";
import { UserService } from "./User";
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
  exceptionHandler: (exception: unknown) => void;
}

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
  exceptionHandler: LensPlatformClientOptions["exceptionHandler"];

  user: UserService;
  openIDConnect: OpenIdConnect;

  constructor(options: LensPlatformClientOptions) {
    const { accessToken, getAccessToken } = options;
    if (!accessToken && !getAccessToken) {
      throw new Error(`No accessToken ${accessToken} or getAccessToken ${getAccessToken}`);
    }

    this.accessToken = accessToken;
    this.getAccessToken = getAccessToken;
    this.keyCloakAddress = options.keyCloakAddress;
    this.keycloakRealm = options.keycloakRealm;
    this.apiEndpointAddress = options.apiEndpointAddress;
    this.exceptionHandler = options.exceptionHandler;

    this.user = new UserService(this);
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

  get authHeader(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.accessToken}`
    };
  }

  /**
   * A proxied version of `got` that
   *
   * 1) Prints request/response in console (for developer to debug issues)
   * 2) Notifies end-user via Component.Notifications if there is HTTP error (=> non-200 codes)
   *
   */
  get got() {
    const { accessToken, getAccessToken, exceptionHandler } = this;
    const token = getAccessToken && typeof getAccessToken === "function" ? getAccessToken() : accessToken;
    const proxy = new Proxy(got, {
      get(target: Got, key: string) {
        // @ts-ignore
        const prop = target[key]; // Method = get/post/put etc

        if (typeof prop === "function") {
          return async (...arg: [string, Options, ...any]) => {
            const [url, options, ...rest] = arg;

            try {
              // Print HTTP request info in developer console
              _console.log(`${key?.toUpperCase()} ${url}`);

              const _arg = [
                url,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    // Merge headers
                    ...options?.headers
                  },
                  // Merge options
                  ...options
                },
                ...rest
              ];
              _console.log(`request arguments ${JSON.stringify(_arg)}`);

              const responsePromise: CancelableRequest<Response<string>> = prop(..._arg);
              const [response, json] = await Promise.all([responsePromise, responsePromise.json()]);

              // Print HTTP response info in developer console
              _console.log(`${key?.toUpperCase()} ${response.statusCode} ${response.statusMessage} ${url}`);
              _console.log(`response body: ${response.body}`);

              return json;
            } catch (error: unknown) {
              // @ts-expect-error
              _console.error(`error message: ${error?.message}`);
              // @ts-expect-error
              _console.error(`error response body: ${error?.response?.body}`);
              exceptionHandler(error);
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
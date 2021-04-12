export interface OpenIdConnectUserInfo {
  name: string;
  sub: string;
  email_verified: boolean;
  preferred_username?: string;
  given_name?: string;
  email: string;
}

export interface LensPlatformClientOptions {
  accessToken: string;
  keyCloakAddress: string;
  keycloakRealm: string;
  apiEndpointAddress: string;
  exceptionHandler: (exception: any) => void;
}

export interface DecodedAccessToken {
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

export interface User {
  id: string;
  email: string;
  username: string;
}

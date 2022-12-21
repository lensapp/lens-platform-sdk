import { Base } from "./Base";

/**
 *
 * The class for all OpenID Connect Core resources.
 *
 * @remarks
 * Connect with keycloak's OpenIDConnect endpoints
 * @see {@link https://github.com/keycloak/keycloak-documentation/blob/master/securing_apps/topics/oidc/oidc-generic.adoc#other-openid-connect-libraries} for the list of all endpoints
 *
 * @alpha
 */
class OpenIdConnect extends Base {
  /**
   * Returns the User Info object described in the OIDC specification
   *
   * see {@link https://openid.net/specs/openid-connect-core-1_0.html#UserInfo}
   */
  async getUserInfo(): Promise<OpenIdConnectUserInfo> {
    const { keyCloakAddress, keycloakRealm, fetch } = this.lensPlatformClient;
    const json = await fetch.get(
      `${keyCloakAddress}/auth/realms/${keycloakRealm}/protocol/openid-connect/userinfo`,
    );

    return json as unknown as OpenIdConnectUserInfo;
  }
}

export interface OpenIdConnectUserInfo {
  name: string;
  sub: string;
  email_verified: boolean;
  preferred_username?: string;
  given_name?: string;
  email: string;
}
export { OpenIdConnect };

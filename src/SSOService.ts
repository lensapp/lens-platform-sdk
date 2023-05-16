import { Base } from "./Base";
import { NotFoundException, throwExpected } from "./exceptions";
import { Business, BusinessSSOWithIDPDetails } from "./BusinessService";

export interface SSO {
  identityProviderID: string;
}

export interface OIDCRemoteConfiguration {
  authorizationUrl: string;
  tokenUrl: string;
  jwksUrl: string;
  userInfoUrl: string;
  issuer: string;
  logoutUrl: string;
}

class SSOService extends Base {
  /**
   * Get SSO details
   *
   */
  async getSSOByBusinessHandle(handle: Business["handle"]): Promise<OIDCRemoteConfiguration> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/sso?handle=${handle}`;
    const json = await throwExpected(async () => fetch.get(url), {
      404: () => new NotFoundException("SSO not found"),
    });

    return json as unknown as OIDCRemoteConfiguration;
  }

  /**
   * Get OIDC SSO configuration
   *
   */
  async getSSSOIDCConfiguration(oidcUrl: string): Promise<SSO> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/configuration?url=${oidcUrl}`;
    const json = await throwExpected(async () => fetch.get(url), {
      422: () => new NotFoundException("OIDC configuration is not available or invalid"),
    });

    return json as unknown as BusinessSSOWithIDPDetails;
  }
}

export { SSOService };

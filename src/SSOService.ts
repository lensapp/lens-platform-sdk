import { Base } from "./Base";
import {
  ForbiddenException,
  NotFoundException,
  throwExpected,
  UnprocessableEntityException,
} from "./exceptions";
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

export interface SSOProviderConnection {
  link: string;
}

class SSOService extends Base {
  /**
   * Get SSO details
   *
   */
  async getSSOByBusinessHandle(handle: Business["handle"]): Promise<SSO> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/sso?handle=${handle}`;
    const json = await throwExpected(async () => fetch.get(url), {
      404: () => new NotFoundException("SSO not found"),
    });

    return json as unknown as BusinessSSOWithIDPDetails;
  }

  /**
   * Get OIDC SSO configuration
   *
   */
  async getRemoteOIODCConfiguration(remoteOidcConfigUrl: string): Promise<OIDCRemoteConfiguration> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/sso/configuration?url=${remoteOidcConfigUrl}`;
    const json = await throwExpected(async () => fetch.get(url), {
      404: () => new NotFoundException("SSO not found"),
    });

    return json as unknown as OIDCRemoteConfiguration;
  }

  /**
   * Get SSO provider connection link
   *
   */
  async getSSOProviderConnectionLink(
    providerAlias: string,
    clientId: string,
  ): Promise<SSOProviderConnection> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/sso/account-link?provider=${providerAlias}&clientId=${clientId}`;
    const json = await throwExpected(async () => fetch.get(url), {
      404: () => new NotFoundException("SSO provider found"),
      403: (error) => new ForbiddenException(error?.body.message),
      401: (error) => new ForbiddenException(error?.body.message),
      422: () =>
        new UnprocessableEntityException(`Failed to retrieve link for provider ${providerAlias}`),
    });

    return json as unknown as SSOProviderConnection;
  }
}

export { SSOService };

import { Base } from "./Base";
import { ForbiddenException, NotFoundException, throwExpected } from "./exceptions";
import { Business, BusinessSSOWithIDPDetails } from "./BusinessService";

export interface SSO {
  identityProviderID: string;
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
   * Get SSO provider connection link
   *
   */
  async getSSOProviderConnectionLink(
    providerAlias: string,
    clientId: string,
  ): Promise<SSOProviderConnection> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/account-link?provider=${providerAlias}&clientId=${clientId}`;
    const json = await throwExpected(async () => fetch.get(url), {
      404: () => new NotFoundException("SSO provider found"),
      403: (error) => new ForbiddenException(error?.body.message),
      401: (error) => new ForbiddenException(error?.body.message),
      422: () => new NotFoundException(`Failed to retrieve link for provider ${providerAlias}`),
    });

    return json as unknown as SSOProviderConnection;
  }
}

export { SSOService };

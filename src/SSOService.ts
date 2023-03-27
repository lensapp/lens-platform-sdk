import { Base } from "./Base";
import { NotFoundException, throwExpected } from "./exceptions";
import { Business, BusinessSSOWithIDPDetails } from "./BusinessService";

export interface SSO {
  id: string;
  identityProviderID: string;
}

class SSOService extends Base {
  /**
   * Get SSO details
   *
   */
  async getSSOByBusinessUrlPrefix(businessUrl: Business["businessUrl"]): Promise<SSO> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/sso?businessUrl=${businessUrl}`;
    const json = await throwExpected(async () => fetch.get(url), {
      404: () => new NotFoundException("SSO not found"),
    });

    return json as unknown as BusinessSSOWithIDPDetails;
  }
}

export { SSOService };

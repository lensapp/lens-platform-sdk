import { Base } from "./Base";
import { NotFoundException, throwExpected } from "./exceptions";
import { Business, BusinessSSOWithIDPDetails } from "./BusinessService";

export interface SSO {
  identityProviderID: string;
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
}

export { SSOService };

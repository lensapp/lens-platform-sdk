import { Base } from "./Base";
import { NotFoundException, throwExpected } from "./exceptions";
import { BusinessSSOWithIDPDetails } from "./BusinessService";

export interface SSO {
  identityProviderID: string;
  loginUrlPrefix: string;
}

class SSOService extends Base {
  /**
   * Get SSO details
   *
   */
  async getSSOByLoginUrlPrefix(loginUrlPrefix: SSO["loginUrlPrefix"]): Promise<SSO> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/sso?loginUrlPrefix=${loginUrlPrefix}`;
    const json = await throwExpected(async () => fetch.get(url), {
      404: () => new NotFoundException("SSO not found"),
    });

    return json as unknown as BusinessSSOWithIDPDetails;
  }
}

export { SSOService };

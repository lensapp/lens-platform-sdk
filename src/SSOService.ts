import { Base } from "./Base";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  throwExpected,
  UnauthorizedException,
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
   * Get SSO details by business handle
   */
  async getSSOByBusinessHandle(handle: Business["handle"]): Promise<SSO> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/sso?handle=${handle}`;
    const json = await throwExpected(async () => fetch.get(url), {
      404: (error) => new NotFoundException(error?.body.message ?? "SSO not found"),
      400: (error) => new BadRequestException(error?.body.message ?? "Handle is required"),
    });

    return json as unknown as BusinessSSOWithIDPDetails;
  }

  /**
   * Get SSO details by domain
   */
  async getSSOByDomain(domain: string): Promise<SSO> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/sso?domain=${domain}`;
    const json = await throwExpected(async () => fetch.get(url), {
      404: (error) => new NotFoundException(error?.body.message ?? "SSO not found"),
      400: (error) => new BadRequestException(error?.body.message ?? "Domain is required"),
    });

    return json as unknown as BusinessSSOWithIDPDetails;
  }

  /**
   * Get OIDC SSO configuration
   */
  async getRemoteOIODCConfiguration(remoteOidcConfigUrl: string): Promise<OIDCRemoteConfiguration> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/sso/configuration?url=${remoteOidcConfigUrl}`;
    const json = await throwExpected(async () => fetch.get(url), {
      422: (error) => new UnprocessableEntityException(error?.body.message),
      404: (error) => new NotFoundException(error?.body.message ?? "SSO not found"),
    });

    return json as unknown as OIDCRemoteConfiguration;
  }

  /**
   * Get SSO provider connection link
   */
  async getSSOProviderConnectionLink(
    providerAlias: string,
    clientId: string,
  ): Promise<SSOProviderConnection> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/sso/account-link?provider=${providerAlias}&clientId=${clientId}`;
    const json = await throwExpected(async () => fetch.get(url), {
      404: (error) => new NotFoundException(error?.body.message ?? "SSO provider found"),
      403: (error) => new ForbiddenException(error?.body.message),
      401: (error) => new UnauthorizedException(error?.body.message),
      422: (error) =>
        new UnprocessableEntityException(
          error?.body.message ?? `Failed to retrieve link for provider ${providerAlias}`,
        ),
    });

    return json as unknown as SSOProviderConnection;
  }
}

export { SSOService };

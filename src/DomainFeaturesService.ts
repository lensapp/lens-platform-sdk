import { Base } from "./Base";
import { UnauthorizedException, throwExpected } from "./exceptions";

export interface DomainFeatures {
  domainMatchingEnabled: boolean;
}

class DomainFeaturesService extends Base {
  async get({ domain }: { domain: string }): Promise<DomainFeatures> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/domain/features?domain=${encodeURIComponent(domain)}`;

    const json = await throwExpected(async () => fetch.get(url), {
      401: (error) => new UnauthorizedException(error?.body.message),
    });

    return json as unknown as DomainFeatures;
  }
}

export { DomainFeaturesService };

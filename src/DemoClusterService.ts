import { Base } from "./Base";
import { throwExpected } from "./exceptions";

type ConfigResponse = string;

/**
 *
 * The class for consuming all `DemoCluster` resources.
 *
 */
class DemoClusterService extends Base {
  async getConfig(): Promise<ConfigResponse> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/demo-cluster/config`;
    const response = await throwExpected(async () => fetch.get(url), {
      unauthenticated: true,
    } as any);

    return response as unknown as ConfigResponse;
  }
}

export { DemoClusterService };

import { Base } from "./Base";
import { throwExpected } from "./exceptions";

type Release = {
  version: string;
  title: string;
  aliases: string[];
};

type VersionsResponse = Release[];

/**
 *
 * The class for consuming all `LensDesktopKube` resources.
 *
 */
class LensDesktopKubeService extends Base {
  async getK0sVersions(): Promise<VersionsResponse> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/lens-desktop-kube/k0s-versions.json`;
    const json = await throwExpected(async () => fetch.get(url), {});

    return json as unknown as VersionsResponse;
  }
}

export { LensDesktopKubeService };

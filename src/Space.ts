import { Base } from "./Base";
import type { User } from "./User";
import type { Team } from "./Team";
import type { K8sCluster } from "./K8sCluster";
import type { Invitation } from "./Invitation";
import type { BillingPlan } from "./BillingPlan";

/**
 *
 * @remarks
 * This interface should be generated using OpenAPI generator in the future.
 *
 * @alpha
 */
export interface Space {
  id?: string;
  name: string;
  description: string;
  createdById?: string;
  ownerId?: string;
  users?: User[];
  teams?: Team[];
  invitations?: Invitation[];
}

/**
 *
 * The class for consuming all `space` resources.
 *
 * @remarks
 * This class should be generated using OpenAPI generator in the future.
 *
 * @alpha
 */
class SpaceService extends Base {
  /**
   * Get one space by space name
   */
  async getOne({ name, queryString }: { name: Space["name"]; queryString?: string }): Promise<Space> {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${name}${queryString ? `/?${queryString}` : ""}}`;

    const json = await got.get(url);

    return (json as unknown) as Space;
  }

  /**
   * Get spaces
   */
  async getMany(queryString?: string): Promise<Space[]> {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces${queryString ? `/?${queryString}` : ""}`;
    const json = await got.get(url);

    return (json as unknown) as Space[];
  }

  /**
   * Create one space
   */
  async createOne(space: Space): Promise<Space> {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces`;

    const json = await got.post(url, {
      json: space
    });

    return (json as unknown) as Space;
  }

  /**
   * Update one space
   */
  async updateOne(space: Space): Promise<Space> {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${space.name}`;

    const json = await got.patch(url, {
      json: space
    });

    return (json as unknown) as Space;
  }

  /**
   * Delete one space by space name
   */
  async deleteOne({ name }: { name: Space["name"] }): Promise<void> {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${name}`;

    await got.delete(url);
  }

  /**
   * Get bored-secret by space name and cluster id
   */
  async getBoredSecret({
    name,
    clusterId
  }: {
    name: Space["name"];
    clusterId: K8sCluster["id"];
  }): Promise<{ token: string }> {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${name}/k8sclusters/${clusterId}/bored-secret`;

    const json = await got.get(url);

    return (json as unknown) as { token: string };
  }

  /**
   * Get cluster token by space name and cluster id
   */
  async getClusterToken({
    name,
    clusterId
  }: {
    name: Space["name"];
    clusterId: K8sCluster["id"];
  }): Promise<{ token: string }> {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${name}/k8sclusters/${clusterId}/token`;

    const json = await got.get(url);

    return (json as unknown) as { token: string };
  }

  /**
   * Get all clusters in one space by space name
   */
  async getClusters({ name }: { name: Space["name"] }): Promise<K8sCluster[]> {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${name}/k8sclusters`;

    const json = await got.get(url);

    return (json as unknown) as K8sCluster[];
  }

  /**
   * Get one cluster by cluster id in one space by space name
   */
  async getOneCluster({ clusterId, name }: { clusterId: K8sCluster["id"]; name: Space["name"] }): Promise<K8sCluster> {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${name}/k8sclusters/${clusterId}`;

    const json = await got.get(url);

    return (json as unknown) as K8sCluster;
  }

  /**
   * Create a cluster in one space by space name
   */
  async createOneCluster({ cluster, name }: { cluster: K8sCluster; name: Space["name"] }): Promise<K8sCluster> {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${name}/k8sclusters`;

    const json = await got.post(url, { json: cluster });

    return (json as unknown) as K8sCluster;
  }

  /**
   * Delete a cluster by cluster id in one space by space name
   */
  async deleteOneCluster({ clusterId, name }: { clusterId: K8sCluster["id"]; name: Space["name"] }): Promise<void> {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${name}/k8sclusters/${clusterId}`;

    await got.delete(url);
  }

  /**
   * Get all teams in one space by space name
   */
  async getTeams({ name }: { name: Space["name"] }): Promise<Team[]> {
    const space = await this.getOne({ name });

    let teams: Team[] = [];
    if (space.teams) {
      teams = await Promise.all(
        space.teams?.map(
          async team => this.lensPlatformClient.team.getOne({ id: team.id })
        )
      );
    }

    return teams;
  }

  /**
   * Remove one user by username from a space by space name
   */
  async removeOneUser({ username, name }: { username: User["username"]; name: Space["name"] }): Promise<void> {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${name}/users/${username}`;

    await got.delete(url);
  }

  /**
   * Get one billing plan of space by space name
   */
  async getBillingPlan({ name }: { name: Space["name"] }) {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${name}/plan`;

    const json = await got.get(url);

    return (json as unknown) as BillingPlan;
  }
}

export { SpaceService };

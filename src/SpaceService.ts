import { Base } from "./Base";
import { User } from "./UserService";
import type { Team } from "./TeamService";
import type { K8sCluster } from "./K8sCluster";
import type { Invitation } from "./InvitationService";
import type { BillingPlan } from "./BillingPlan";
import type { InvitationDomain } from "./InvitationDomain";
import {
  throwExpected,
  SpaceNotFoundException,
  SpaceNameReservedException,
  ForbiddenException,
  TokenNotFoundException,
  SpaceHasTooManyClustersException,
  BadRequestException,
  CantRemoveOwnerFromSpaceException,
  UserNameNotFoundException,
  NotFoundException
} from "./exceptions";

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
  description?: string;
  displayName?: string;
  website?: string;
  createdById?: string;
  createdAt?: string;
  updatedAt?: string;
  users?: User[];
  teams?: Team[];
  invitations?: Invitation[];
  invitationDomains?: InvitationDomain[];
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
  async getOne({ name, queryString }: { name: string; queryString?: string }): Promise<Space> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${name}${queryString ? `/?${queryString}` : ""}`;

    const json = await throwExpected(
      async () => fetch.get(url),
      {
        404: () => new SpaceNotFoundException(name),
        403: () => new ForbiddenException()
      }
    );

    return (json as unknown) as Space;
  }

  /**
   * Get spaces
   */
  async getMany(queryString?: string): Promise<Space[]> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces${queryString ? `/?${queryString}` : ""}`;

    const json = await throwExpected(
      async () => fetch.get(url)
    );

    return (json as unknown) as Space[];
  }

  /**
   * Create one space
   */
  async createOne(space: Space): Promise<Space> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces`;

    const json = await throwExpected(
      async () => fetch.post(url, space),
      { 422: () => new SpaceNameReservedException(space.name) }
    );

    return (json as unknown) as Space;
  }

  /**
   * Update one space
   */
  async updateOne(spaceName: string, space: Space): Promise<Space> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${spaceName}`;

    const json = await throwExpected(
      async () => fetch.patch(url, space),
      {
        500: () => new TokenNotFoundException(),
        403: () => new ForbiddenException(),
        422: () => new SpaceNameReservedException(space.name)
      }
    );

    return (json as unknown) as Space;
  }

  /**
   * Delete one space by space name
   */
  async deleteOne({ name }: { name: string }): Promise<void> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${name}`;

    await throwExpected(
      async () => fetch.delete(url),
      {
        500: () => new TokenNotFoundException(),
        403: () => new ForbiddenException(),
        404: () => new SpaceNotFoundException(name)
      }
    );
  }

  /**
   * Get bored-secret by space name and cluster id
   */
  async getBoredSecret({
    name,
    clusterId
  }: { name: string; clusterId: string }): Promise<{ token: string }> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${name}/k8sclusters/${clusterId}/bored-secret`;

    const json = await throwExpected(
      async () => fetch.get(url),
      {
        // TODO: differentiate between space cluster and secret not being found
        404: () => new SpaceNotFoundException(name),
        400: () => new BadRequestException("Invalid cluster")
      }
    );

    return (json as unknown) as { token: string };
  }

  /**
   * Get cluster token by space name and cluster id
   */
  async getClusterToken({
    name,
    clusterId
  }: { name: string; clusterId: string }): Promise<{ token: string }> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${name}/k8sclusters/${clusterId}/token`;

    const json = await throwExpected(
      async () => fetch.get(url),
      {
        // TODO: differentiate between space, cluster, user and token not being found
        404: () => new SpaceNotFoundException(name),
        400: () => new BadRequestException()
      }
    );

    return (json as unknown) as { token: string };
  }

  /**
   * Get all clusters in one space by space name
   */
  async getClusters({ name }: { name: string }): Promise<K8sCluster[]> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${name}/k8sclusters`;

    const json = await throwExpected(
      async () => fetch.get(url),
      { 404: () => new SpaceNotFoundException(name) }
    );

    return (json as unknown) as K8sCluster[];
  }

  /**
   * Get all invitation domains in one space by space name
   */
  async getInvitationDomains({ name }: { name: string }): Promise<InvitationDomain[]> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${name}/security/invitation-domains`;

    const json = await throwExpected(
      async () => fetch.get(url),
      {
        403: () => new ForbiddenException(),
        404: () => new SpaceNotFoundException(name)
      }
    );

    return (json as unknown) as InvitationDomain[];
  }

  /**
   * Add one invitation domain in a Space by space name
   */
  async addInvitationDomain({ name, domain }: { name: Space["name"]; domain: InvitationDomain["domain"] }): Promise<InvitationDomain> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${name}/security/invitation-domains`;

    const json = await throwExpected(
      async () => fetch.post(url, {
        domain
      }),
      {
        400: () => new BadRequestException(),
        403: () => new ForbiddenException(),
        404: () => new SpaceNotFoundException(name)
      }
    );

    return (json as unknown) as InvitationDomain;
  }

  /**
   * Delete one invitation domain in a Space by space name and invitation domain id
   */
  async deleteInvitationDomain({ name, invitationDomainId }: { name: Space["name"]; invitationDomainId: InvitationDomain["id"] }): Promise<void> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${name}/security/invitation-domains/${invitationDomainId}`;

    await throwExpected(
      async () => fetch.delete(url),
      {
        403: () => new ForbiddenException(),
        // Space or InvitationDomain missing
        404: () => new NotFoundException()
      }
    );
  }

  /**
   * Get one cluster by cluster id in one space by space name
   */
  async getOneCluster({ clusterId, name }: { clusterId: string; name: string }): Promise<K8sCluster> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${name}/k8sclusters/${clusterId}`;

    const json = await throwExpected(
      async () => fetch.get(url),
      // TODO: differentiate between space and cluster not being found
      {
        404: () => new SpaceNotFoundException(name),
        403: () => new ForbiddenException()
      }
    );

    return (json as unknown) as K8sCluster;
  }

  /**
   * Create a cluster in one space by space name
   */
  async createOneCluster({ cluster, name }: { cluster: K8sCluster; name: string }): Promise<K8sCluster> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${name}/k8sclusters`;

    const json = await throwExpected(
      async () => fetch.post(url, cluster),
      {
        404: () => new SpaceNotFoundException(name),
        422: () => new SpaceHasTooManyClustersException(name),
        400: () => new BadRequestException("Property 'kind' of cluster object is invalid")
      }
    );

    return (json as unknown) as K8sCluster;
  }

  /**
   * Update a cluster
   */
  async updateOneCluster({ cluster }: { cluster: K8sCluster }): Promise<K8sCluster> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${cluster.space?.name}/k8sclusters/${cluster.id}`;

    const json = await throwExpected(
      async () => fetch.put(url, cluster),
      {
        // TODO: differentiate between space and cluster not being found
        404: () => new SpaceNotFoundException(cluster.space?.name ?? "undefined"),
        400: () => new BadRequestException("Property 'kind' of cluster object is invalid")
      }
    );

    return (json as unknown) as K8sCluster;
  }

  /**
   * Delete a cluster by cluster id in one space by space name
   */
  async deleteOneCluster({ clusterId, name }: { clusterId: string; name: string }): Promise<void> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${name}/k8sclusters/${clusterId}`;

    await throwExpected(
      async () => fetch.delete(url),
      {
        // TODO: differentiate between space and cluster not being found,
        // improve error handling here overall
        404: () => new SpaceNotFoundException(name)
      }
    );
  }

  /**
   * Remove one user by username from a space by space name
   * @throws SpaceNotFoundException, UserNameNotFoundException, ForbiddenException, CantRemoveOwnerFromSpaceException
   */
  async removeOneUser({ username, name }: { username: string; name: string }): Promise<void> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${name}/users/${username}`;

    await throwExpected(
      async () => fetch.delete(url),
      {
        404: e => e?.body.message.includes(name) ?
          new SpaceNotFoundException(name) :
          new UserNameNotFoundException(username),
        403: () => new ForbiddenException(),
        422: () => new CantRemoveOwnerFromSpaceException(username)
      }
    );
  }

  /**
   * Get billing plan of space by space name
   */
  async getBillingPlan({ name }: { name: string }) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${name}/plan`;

    const json = await throwExpected(
      async () => fetch.get(url)
    );

    return (json as unknown) as BillingPlan;
  }

  /**
   * Downgrades the billing plan of space by space name
   */
  async downgradeBillingPlan({ name }: { name: string }) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${name}/plan`;

    const json = await fetch.delete(url);

    return (json as unknown) as BillingPlan;
  }
}

export { SpaceService };

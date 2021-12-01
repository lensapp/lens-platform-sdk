import { Base } from "./Base";
import { User } from "./UserService";
import type { Team, TeamEntity } from "./TeamService";
import type { K8sCluster } from "./K8sCluster";
import type { CatalogAPI, CatalogAPIEntity } from "./CatalogAPI";
import type { Invitation, InvitationEntity } from "./InvitationService";
import type { BillingPlan } from "./BillingPlan";
import type { InvitationDomain, InvitationDomainEntity } from "./InvitationDomain";
import {
  throwExpected,
  SpaceNotFoundException,
  SpaceNameReservedException,
  TokenNotFoundException,
  SpaceHasTooManyClustersException,
  CantRemoveOwnerFromSpaceException,
  UserNameNotFoundException,
  NotFoundException,
  ClusterNotFoundException,
} from "./exceptions";
import type { MapToEntity } from "./types/types";
import type { Except } from "type-fest";

export const spaceKinds = ["Personal", "Team"] as const;
export type SpaceKind = typeof spaceKinds[number];

export const spaceFeatures = ["DevCluster"] as const;
export type SpaceFeature = typeof spaceFeatures[number];

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
  kind?: SpaceKind;
  features?: SpaceFeature[];
  users?: User[];
  teams?: Team[];
  invitations?: Invitation[];
  invitationDomains?: InvitationDomain[];
  catalogApi?: CatalogAPI;
}

export type SpaceEntity = Except<MapToEntity<Space>, "teams" | "invitations" | "invitationDomains" | "catalogApi"> & {
  teams?: TeamEntity[];
  invitations?: InvitationEntity[];
  invitationDomains?: InvitationDomainEntity[];
  catalogApi?: CatalogAPIEntity;
};

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
      },
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
      async () => fetch.get(url),
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
      {
        422: () => new SpaceNameReservedException(space.name),
      },
    );

    return (json as unknown) as Space;
  }

  /**
   * Create CatalogAPI for the Space if it's missing
   */
  async createCatalogApi(spaceName: string): Promise<CatalogAPI> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${spaceName}/catalog-api`;

    const json = await throwExpected(
      async () => fetch.post(url),
      {
        404: () => new SpaceNotFoundException(spaceName),
      },
    );

    return (json as unknown) as CatalogAPI;
  }

  /**
   * Add feature to users' Personal Spaces.
   * @param feature - Feature to add
   * @param users - Array of usernames or email addresses
   */
  async addSpaceFeature(feature: SpaceFeature, users: string[]): Promise<Record<string, unknown>> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/features`;

    const json = await throwExpected(
      async () => fetch.post(url, { feature, users }),
      {
        404: () => new NotFoundException(),
      },
    );

    return (json as unknown) as Record<string, unknown>;
  }

  /**
   * Remove feature from users' Personal Spaces.
   * @param feature - Feature remove add
   * @param users - Array of usernames or email addresses
   */
  async removeSpaceFeature(feature: SpaceFeature, users: string[]): Promise<Record<string, unknown>> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/features/remove`;

    const json = await throwExpected(
      async () => fetch.delete(url, { data: { feature, users } }),
      {
        404: () => new NotFoundException(),
      },
    );

    return (json as unknown) as Record<string, unknown>;
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
        422: () => new SpaceNameReservedException(space.name),
      },
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
        404: () => new SpaceNotFoundException(name),
      },
    );
  }

  /**
   * Get bored-secret by space name and cluster id
   */
  async getBoredSecret({
    name,
    clusterId,
  }: { name: string; clusterId: string }): Promise<{ token: string }> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${name}/k8sclusters/${clusterId}/bored-secret`;

    const json = await throwExpected(
      async () => fetch.get(url),
      {
        // TODO: differentiate between space cluster and secret not being found
        404: () => new SpaceNotFoundException(name),
      },
    );

    return (json as unknown) as { token: string };
  }

  /**
   * Get cluster token by space name and cluster id
   */
  async getClusterToken({
    name,
    clusterId,
  }: { name: string; clusterId: string }): Promise<{ token: string }> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${name}/k8sclusters/${clusterId}/token`;

    const json = await throwExpected(
      async () => fetch.get(url),
      {
        // TODO: differentiate between space, cluster, user and token not being found
        404: error => {
          const message = error?.body.message;
          if (typeof message === "string" && message.includes("Space ")) {
            return new SpaceNotFoundException(name);
          }

          return new ClusterNotFoundException(clusterId);
        },
      },
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
      { 404: () => new SpaceNotFoundException(name) },
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
        404: () => new SpaceNotFoundException(name),
      },
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
        domain,
      }),
      {
        404: () => new SpaceNotFoundException(name),
      },
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
        // Space or InvitationDomain missing
        404: () => new NotFoundException(),
      },
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
      {
        404: error => {
          const message = error?.body.message;
          if (typeof message === "string" && message.includes("Space ")) {
            return new SpaceNotFoundException(name);
          }

          return new ClusterNotFoundException(clusterId);
        },
      },
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
      },
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
      async () => fetch.patch(url, cluster),
      {
        // TODO: differentiate between space and cluster not being found
        404: () => new SpaceNotFoundException(cluster.space?.name ?? "undefined"),
      },
    );

    return (json as unknown) as K8sCluster;
  }

  /**
   * Replace a cluster
   */
  async replaceOneCluster({ cluster }: { cluster: K8sCluster }): Promise<K8sCluster> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${cluster.space?.name}/k8sclusters/${cluster.id}`;

    const json = await throwExpected(
      async () => fetch.put(url, cluster),
      {
        // TODO: differentiate between space and cluster not being found
        404: () => new SpaceNotFoundException(cluster.space?.name ?? "undefined"),
      },
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
        404: () => new SpaceNotFoundException(name),
      },
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
        404: error => {
          const message = error?.body?.message;
          if (typeof message === "string" && message.includes(name)) {
            return new SpaceNotFoundException(name);
          }

          return new UserNameNotFoundException(username);
        },
        422: () => new CantRemoveOwnerFromSpaceException(username),
      },
    );
  }

  /**
   * Get billing plan of space by space name
   */
  async getBillingPlan({ name }: { name: string }) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${name}/plan`;

    const json = await throwExpected(
      async () => fetch.get(url),
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

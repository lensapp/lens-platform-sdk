import { Base } from "./Base";
import type { Space, SpaceEntity } from "./SpaceService";
import type { User } from "./UserService";
import type { MapToEntity } from "./types/types";
import type { Except } from "type-fest";

/**
 *
 * @remarks
 * This interface should be generated using OpenAPI generator in the future.
 *
 * @alpha
 */
export interface Team {
  id?: string;
  name: string;
  description: string;
  kind?: string;
  createdById?: string;
  users?: User[];
  spaceId: string;
  space?: Space;
  createdAt?: string;
  updatedAt?: string;
}

export type TeamEntity = Except<MapToEntity<Team>, "space"> & {
  space?: SpaceEntity;
};

/**
 *
 * The class for consuming all `team` resources.
 *
 * @remarks
 * This class should be generated using OpenAPI generator in the future.
 *
 * @alpha
 */
class TeamService extends Base {
  /**
   * Get one team by team id
   */
  async getOne({ id }: { id: string }): Promise<Team> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/teams/${id}`;

    const json = await fetch.get(url);

    return (json as unknown) as Team;
  }

  /**
   * Get all teams
   */
  async getMany(): Promise<Team[]> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/teams`;

    const json = await fetch.get(url);

    return (json as unknown) as Team[];
  }

  /**
   * Create one team
   */
  async createOne({ team }: { team: Team }) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/teams`;

    const json = await fetch.post(url, team);

    return (json as unknown) as Team;
  }

  /**
   * Delete one team by team id
   */
  async deleteOne({ id }: { id: string }): Promise<void> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/teams/${id}`;

    await fetch.delete(url);
  }

  /**
   * Add a user by username to a team by team id
   */
  async addUser({ username, id }: { username: string; id: string }): Promise<Team> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/teams/${id}/users`;

    const json = await fetch.post(url, { username });

    return (json as unknown) as Team;
  }

  /**
   * Remove a user by username from a team by team id
   */
  async removeUser({ username, id }: { username: string; id: string }): Promise<Team> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/teams/${id}/users/${username}`;

    const json = await fetch.delete(url);

    return (json as unknown) as Team;
  }
}

export { TeamService };

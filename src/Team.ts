import { Base } from "./Base";
import type { Space } from "./Space";
import type { User } from "./User";

/**
 *
 * @remarks
 * This interface should be generated using OpenAPI generator in the future.
 *
 * @alpha
 */
export interface Team {
  id: string;
  name: string;
  description: string;
  kind?: string;
  createdById?: string;
  users?: User[];
  spaceId: string;
  space?: Space;
}

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
  async getOne({ id }: { id: Team["id"] }): Promise<Team> {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/teams/${id}`;

    const json = await got.get(url);

    return (json as unknown) as Team;
  }

  /**
   * Get all teams
   */
  async getMany(): Promise<Team[]> {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/teams`;

    const json = await got.get(url);

    return (json as unknown) as Team[];
  }

  /**
   * Create one team
   */
  async createOne({ team }: { team: Team }) {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/teams`;

    const json = await got.post(url, { json: team });

    return (json as unknown) as Team;
  }

  /**
   * Delete one team by team id
   */
  async deleteOne({ id }: { id: Team["id"] }): Promise<void> {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/teams/${id}`;

    await got.delete(url);
  }

  /**
   * Add a user by username to a team by team id
   */
  async addUser({ username, id }: { username: User["username"]; id: Team["id"] }): Promise<Team> {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/teams/${id}/users`;

    const json = await got.post(url, { json: { username } });

    return (json as unknown) as Team;
  }

  /**
   * Remove a user by username from a team by team id
   */
  async removeUser({ username, id }: { username: User["username"]; id: Team["id"] }): Promise<Team> {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/teams/${id}/users/${username}`;

    const json = await got.delete(url);

    return (json as unknown) as Team;
  }
}

export { TeamService };

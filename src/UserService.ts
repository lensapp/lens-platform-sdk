import { Base } from "./Base";
import { throwExpected, NotFoundException } from "./exceptions";

/**
 *
 * @remarks
 * This interface should be generated using OpenAPI generator in the future.
 *
 * @alpha
 */
export interface User {
  id?: string;
  email?: string;
  username?: string;
  fullname?: string;
  userAttributes?: Array<{
    id: string;
    userId: string;
    value: string;
    name: "company" | "tshirt" | "fullname";
  }>;
}

export interface UserAttributes {
  fullname?: string;
  company?: string;
  tshirt?: string;
}

/**
 *
 * The class for consuming all `user` resources.
 *
 * currently we have:
 * - `.getOne` maps to `GET /users/{username}`
 *
 * @remarks
 * This class should be generated using OpenAPI in the future.
 *
 * @alpha
 */
class UserService extends Base {
  async getOne({ username }: { username: string }, queryString?: string): Promise<User> {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}${queryString ? `?${queryString}` : ""}`;
    const json = await throwExpected(
      () => got.get(url),
      { 404: () => new NotFoundException(`User ${username} not found`) }
    );

    return (json as unknown) as User;
  }

  async getMany(queryString?: string): Promise<User[]> {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users${queryString ? `?${queryString}` : ""}`;
    const json = await got.get(url);

    return (json as unknown) as User[];
  }

  /**
   * Update user
   */
  async updateOne(username: string, user: User & { attributes?: UserAttributes } & { password?: string }): Promise<User> {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}`;
    const json = await got.patch(url, { json: user });

    return (json as unknown) as User;
  }

  async getSelf(): Promise<User> {
    const { decodedAccessToken } = this.lensPlatformClient;
    if (decodedAccessToken?.preferred_username) {
      const json = await this.getOne({ username: decodedAccessToken?.preferred_username });
      return (json as unknown) as User;
    }

    throw new Error(`jwt.preferred_username is ${decodedAccessToken?.preferred_username}`);
  }
}

export { UserService };

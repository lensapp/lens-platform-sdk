import { Base } from "./Base";

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
  firstName?: string;
  lastName?: string;
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
  async getOne({ username }: { username: User["id"] }): Promise<User> {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}`;
    const json = await got.get(url);

    return (json as unknown) as User;
  }

  async patchOne(user: User): Promise<User> {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${user.username}`;
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

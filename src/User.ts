import { Base } from "./Base";

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
  async getOne(): Promise<User> {
    const { decodedAccessToken, apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${decodedAccessToken?.preferred_username}`;
    const json = await got.get(url);

    return (json as unknown) as User;
  }
}

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

export { UserService };

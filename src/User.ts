import { Base } from "./Base";

interface User {
  id: string;
  email: string;
  username: string;
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
  async getOne(): Promise<User> {
    const {
      decodedAccessToken: { preferred_username },
      apiEndpointAddress,
      got
    } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${preferred_username}`;
    const json = await got.get(url);

    return (json as unknown) as User;
  }
}

export { UserService };
export type { User };

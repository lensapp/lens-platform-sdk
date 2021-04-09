import { Base } from './Base';

interface IUser {
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
class User extends Base {
  async getOne(): Promise<IUser> {
    const {
      decodedAcceeToken: { preferred_username },
      apiEndpointAddress,
      got
    } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${preferred_username}`;
    const json = await got.get(url);

    return (json as unknown) as IUser;
  }
}

export { User };
export type { IUser };

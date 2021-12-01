import { Base } from "./Base";
import {
  throwExpected,
  NotFoundException,
  ForbiddenException,
  UsernameAlreadyExistsException,
  UnprocessableEntityException,
  UserNameNotFoundException,
  LensSDKException,
  TokenNotFoundException,
} from "./exceptions";

/**
 *
 * @remarks
 * This interface should be generated using OpenAPI generator in the future.
 *
 * @alpha
 */
export interface User {
  id?: string;
  username?: string;
  fullname?: string;
  userAttributes?: Array<{
    id: string;
    userId: string;
    value: string;
    name: string;
  }>;
}

type UserWithEmail = User & { email: string };

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
  async getOne({ username }: { username: string }, queryString?: string): Promise<UserWithEmail> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}${queryString ? `?${queryString}` : ""}`;
    const json = await throwExpected(
      async () => fetch.get(url),
      { 404: () => new NotFoundException(`User ${username} not found`) },
    );

    return (json as unknown) as UserWithEmail;
  }

  async getMany(queryString?: string): Promise<User[]> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users${queryString ? `?${queryString}` : ""}`;
    const json = await throwExpected(
      async () => fetch.get(url),
    );

    return (json as unknown) as User[];
  }

  /**
   * Update user
   */
  async updateOne(username: string, user: User & { attributes?: UserAttributes } & { password?: string } & { email?: string }): Promise<User> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}`;
    const json = await throwExpected(
      async () => fetch.patch(url, user),
      {
        404: () => new NotFoundException(`User ${username} not found`),
        403: () => new ForbiddenException(`Modification of user ${username} is forbidden`),
        409: () => new UsernameAlreadyExistsException(),
      },
    );

    return (json as unknown) as User;
  }

  async getSelf(): Promise<UserWithEmail> {
    const decodedAccessToken = await this.lensPlatformClient.getDecodedAccessToken();

    if (decodedAccessToken?.preferred_username) {
      const json = await this.getOne({ username: decodedAccessToken?.preferred_username });

      return (json as unknown) as UserWithEmail;
    }

    throw new Error(`jwt.preferred_username is ${decodedAccessToken?.preferred_username}`);
  }

  async deleteOne(username: string): Promise<void> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}`;

    await throwExpected(
      async () => fetch.delete(url),
      {
        500: error => {
          const message = error?.body.message;

          if (typeof message === "string") {
            if (message.includes("Token")) {
              return new TokenNotFoundException();
            }

            if (message.includes("User")) {
              return new UserNameNotFoundException(username);
            }
          }

          return new LensSDKException(
            500,
            `Unexpected exception [Lens Platform SDK]: ${error?.body.message}`,
            error,
          );
        },
        404: () => new UserNameNotFoundException(username),
        422: error => new UnprocessableEntityException(error?.body.message),
      },
    );
  }
}

export { UserService };

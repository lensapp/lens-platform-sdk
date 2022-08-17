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
  SubscriptionAlreadyExistsException, BadRequestException,
} from "./exceptions";
import { License } from "./types/types";

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

export type UserWithEmail = User & { email: string };

type BillingPageToken = {
  hostedLoginToken: string;
};

export interface UserAttributes {
  fullname?: string;
  company?: string;
  tshirt?: string;
}

export type SubscriptionState = "active" | "canceled" | "expired" | "failed" | "future" | "paused";

export type SubscriptionInfo = {
  id?: string | null;
  planName?: string | null;
  planCode?: string | null;
  /**
   * Current payment period start date string
   */
  currentPeriodStartedAt?: string | null;
  /**
   * Current payment period end date string
   */
  currentPeriodEndsAt?: string | null;
  /**
   * Trial start date string
   */
  trialStartedAt?: string | null;
  /**
   * Trial end date string
   */
  trialEndsAt?: string | null;

  /**
   * Name of the company of the Recurly account
   */
  companyName?: string | null;

  /**
   * Account code of the subscription's Recurly account
   */
  accountCode?: string | null;

  /**
   * True if the subscription belongs to a business Recurly account
   */
  isBusinessAccount: boolean;

  /**
   * State of the subscription
   */
  state: SubscriptionState;
};

export type Address = {
  /**
   * Phone number
   */
  phone: string | null;
  /**
   * Street 1
   */
  street1: string | null;
  /**
   * Street 2
   */
  street2: string | null;
  /**
   * City
   */
  city: string | null;
  /**
   * State or province.
   */
  region: string | null;
  /**
   * Zip or postal code.
   */
  postalCode: string | null;
  /**
   * Country, 2-letter ISO 3166-1 alpha-2 code.
   */
  country: string | null;

};

export type BillingInfo = {
  lastName: string | null;
  firstName: string | null;
  company: string | null;
  address: Address | null;
  paymentMethod: {
    cardType: string | null;
    firstSix: string | null;
    lastTwo: string | null;
    expMonth: Number | null;
    expYear: Number | null;
  };
};

/**
 *
 * The class for consuming all `user` resources.
 *
 * currently we have:
 * - `.getOne` maps to `GET /users/{username}`
 * - `.getBillingPageToken` maps to `GET /users/{username}/billing-page-token`
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
        500(error) {
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

  async getUserSubscriptions(username: string): Promise<SubscriptionInfo[]> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}/subscriptions`;
    const json = await throwExpected(
      async () => fetch.get(url),
      {
        404: error => new NotFoundException(error?.body.message),
        403: () => new ForbiddenException(`Access to user ${username} is forbidden`),
      },
    );

    return (json as unknown) as SubscriptionInfo[];
  }

  async getUserSubscription(username: string, subscriptionId: string): Promise<SubscriptionInfo> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}/subscriptions/${subscriptionId}`;
    const json = await throwExpected(
      async () => fetch.get(url),
      {
        404: error => new NotFoundException(error?.body.message),
        403: () => new ForbiddenException(`Access to user ${username} is forbidden`),
      },
    );

    return (json as unknown) as SubscriptionInfo;
  }

  async activateSubscription({ username, license }: { username: string; license: License }): Promise<License> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}/subscriptions`;
    const json = await throwExpected(
      async () => fetch.post(url, license),
      {
        404(error) {
          const message = error?.body.message;

          if (typeof message === "string") {
            if (message.includes("User")) {
              return new UserNameNotFoundException(username);
            }
          }

          return new NotFoundException(`Recurly subscription ${license.subscriptionId} not found`);
        },
        409: error => new SubscriptionAlreadyExistsException(error?.body.message ?? `Subscription for user ${username} already exists`),
        400: error => new BadRequestException(error?.body.message),
        403: () => new ForbiddenException(`Modification of user licenses for ${username} is forbidden`),
        422: error => new UnprocessableEntityException(error?.body.message),
      },
    );

    return (json as unknown) as License;
  }

  async deactivateSubscription({ username, license }: { username: string; license: Pick<License, "subscriptionId"> }): Promise<void> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}/subscriptions/${license.subscriptionId}`;
    await throwExpected(
      async () => fetch.delete(url),
      {
        404(error) {
          const message = error?.body.message;

          if (typeof message === "string") {
            if (message.includes("User")) {
              return new UserNameNotFoundException(username);
            }
          }

          return new NotFoundException(`Recurly subscription ${license.subscriptionId} not found`);
        },
        403: () => new ForbiddenException(`Modification of user licenses for ${username} is forbidden`),
        400: () => new BadRequestException(),
        422: error => new UnprocessableEntityException(error?.body.message),
      },
    );
  }

  async getBillingPageToken(username: string): Promise<BillingPageToken> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}/billing-page-token`;
    const json = await throwExpected(
      async () => fetch.get(url),
      {
        404: () => new NotFoundException(`User ${username} not found`),
        403: () => new ForbiddenException(`Getting the billing page token for ${username} is forbidden`),
        422: error => new UnprocessableEntityException(error?.body.message),
      },
    );

    return (json as unknown) as BillingPageToken;
  }

  async getBillingPageTokenBySubscriptionId(username: string, subscriptionId: string): Promise<BillingPageToken> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}/subscriptions/${subscriptionId}/billing-page-token`;
    const json = await throwExpected(
      async () => fetch.get(url),
      {
        404: () => new NotFoundException(`User ${username} not found`),
        403: () => new ForbiddenException(`Getting the billing page token for ${username} is forbidden`),
        422: error => new UnprocessableEntityException(error?.body.message),
      },
    );

    return (json as unknown) as BillingPageToken;
  }

  async getUserBillingInformation(username: string): Promise<BillingInfo> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}/billing`;
    const json = await throwExpected(
      async () => fetch.get(url),
      {
        404: () => new NotFoundException(`User ${username} not found`),
        403: () => new ForbiddenException(`Getting the billing information for ${username} is forbidden`),
      },
    );

    return (json as unknown) as BillingInfo;
  }
}

export { UserService };

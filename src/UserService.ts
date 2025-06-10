import decode from "jwt-decode";
import { Base } from "./Base";
import type {
  Business,
  SubscriptionCustomField,
  UsedSeat,
  UserBusinessRole,
} from "./BusinessService";
import {
  throwExpected,
  NotFoundException,
  ForbiddenException,
  UsernameAlreadyExistsException,
  UnprocessableEntityException,
  UserNameNotFoundException,
  LensSDKException,
  TokenNotFoundException,
  SubscriptionAlreadyExistsException,
  BadRequestException,
  UnauthorizedException,
  TooManyRequestException,
} from "./exceptions";
import { BillingPageToken, License } from "./types/types";

export type UserAttribute = {
  id: string;
  userId: string;
  value: string;
  name: string;
};

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
  firstName?: string;
  lastName?: string;
  companyEmailDomain?: string;
  userAttributes?: Array<UserAttribute>;
}

export type UserWithEmail = User & { email: string };

export interface UserAttributes {
  fullname?: string;
  company?: string;
  tshirt?: string;
}

export interface UserCommunications {
  marketing?: boolean;
  onboarding?: boolean;
}

export type SubscriptionState = "active" | "canceled" | "expired" | "failed" | "future" | "paused";

export type UserBusinessWithSSOInfo = { role: UserBusinessRole } & Pick<
  Business,
  "name" | "handle"
> & { sso: { id: string; identityProviderID: string } | null };

export type OfflineActivationCode = {
  activationCode: string;
};

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
   * Total number of seats in this subscription. (Recurly subscription["quantity"])
   */
  seats: number;

  /**
   * The subscription that have been assigned to a user (`user_subscriptions` relation)
   */
  usedSeats: UsedSeat[];

  /**
   * Custom fields stored for the subscription
   */
  customFields?: SubscriptionCustomField[];

  /**
   * Name of the company of the Recurly account
   */
  companyName?: string | null;

  /**
   * Account code of the subscription's Recurly account
   */
  accountCode?: string | null;

  autoRenew: boolean;
  collectionMethod: "manual" | "automatic";

  /**
   * Subscription seat used for offline
   */
  offline: boolean;

  /**
   * True if the subscription belongs to a business Recurly account
   */
  isBusinessAccount: boolean;

  /**
   * State of the subscription
   */
  state: SubscriptionState;

  /**
   * Price of subscription
   */
  unitAmount?: number | null;
};

export type SubscriptionSeat = {
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
   * Total number of seats in this subscription. (Recurly subscription["quantity"])
   */
  seats: number;

  /**
   * The subscription that have been assigned to a user (`user_subscriptions` relation)
   */
  usedSeats: UsedSeat[];

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
   * State of the Recurly subscription
   */
  recurlySubscriptionState: SubscriptionState;

  /**
   * Subscription activation date string
   */
  activatedAt: string;

  /**
   * Subscription deactivation date string
   */
  deactivatedAt: string | null;

  /**
   * Subscription creation date string
   */
  createdAt: string;

  /**
   * Subscription update date string
   */
  updatedAt: string;

  /**
   * Subscription expiration date string
   */
  expiredAt: string | null;

  /**
   * Recurly subscription UUID format ID
   */
  subscriptionId: string;

  /**
   * Recurly subscription short format ID
   */
  shortSubscriptionId: string;

  /**
   * Is the seat active
   */
  active: boolean;

  /**
   * Subscription used offline
   */
  offline: boolean;
};

export type Address = {
  /**
   * Phone number
   */
  phone: string | null;
  /**
   * Street address 1
   */
  address: string | null;
  /**
   * Street address 2
   */
  address2: string | null;
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
  type: string | null;
  vatNumber: string | null;
  email: string | null;
  paymentMethod?: {
    cardType: string | null;
    firstSix: string | null;
    lastTwo: string | null;
    lastFour: string | null;
    expMonth: Number | null;
    expYear: Number | null;
  };
};

type BillingInfoUpdateWithoutToken = BillingInfo & {
  token?: null;
};
type BillingInfoUpdateWithToken = BillingInfo & {
  type: "credit_card";
  token: string;
  paymentMethod: NonNullable<BillingInfo["paymentMethod"]>;
};
export type BillingInfoUpdate = BillingInfoUpdateWithoutToken | BillingInfoUpdateWithToken;

export interface ActivationCodeData {
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

export type UploadAvatarResponse = {
  uri: string;
};

export interface Invoice {
  date: Date | null;
  number: string | null;
  planCode: string | null;
  total: number | null;
  subtotal: number | null;
  state: string | null;
  currency: string | null;
  billingInfo: BillingInfo | null;
  /**
   * string if the invoice is from a child account of a LBID
   */
  fromChildBusinessId?: Business["id"];
}

export interface LinkedUserAccount {
  identityProviderAlias: string | undefined;
  identityProviderDisplayName: string | undefined;
  username: string | undefined;
}

export interface UserOTPPreferences {
  enabled: boolean;
}

export interface UserAuthMethod {
  /**
   * The method of authentication the user is using, `null` if the user doesn't have an account
   */
  method: "sso" | "password" | "google" | "github" | null;
  emailAddress: string;
  identityProviderID?: string;
  /**
   * Generated unique username for registration
   */
  username: null | string;
}

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
  async getUsername() {
    const token = await this.lensPlatformClient.getDecodedAccessToken();

    if (!token?.preferred_username) {
      throw new LensSDKException(null, "no access token or no preferred_username");
    }

    return token.preferred_username;
  }

  async getOne({ username }: { username: string }, queryString?: string): Promise<UserWithEmail> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}${queryString ? `?${queryString}` : ""}`;
    const json = await throwExpected(async () => fetch.get(url), {
      404: () => new NotFoundException(`User ${username} not found`),
    });

    return json as unknown as UserWithEmail;
  }

  async getMany(queryString?: string): Promise<User[]> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users${queryString ? `?${queryString}` : ""}`;
    const json = await throwExpected(async () => fetch.get(url));

    return json as unknown as User[];
  }

  /**
   * Update user
   */
  async updateOne(
    username: string,
    user: User & { attributes?: UserAttributes } & { password?: string } & { email?: string },
  ): Promise<User> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}`;
    const json = await throwExpected(async () => fetch.patch(url, user), {
      404: () => new NotFoundException(`User ${username} not found`),
      403: () => new ForbiddenException(`Modification of user ${username} is forbidden`),
      409: () => new UsernameAlreadyExistsException(),
    });

    return json as unknown as User;
  }

  /**
   * Reset user password
   */
  async resetPassword(username: string, password: string): Promise<void> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}/reset-password`;

    await throwExpected(
      async () =>
        fetch.put(url, {
          password,
        }),
      {
        404: () => new NotFoundException(`User ${username} not found`),
      },
    );
  }

  async getSelf(): Promise<UserWithEmail> {
    const decodedAccessToken = await this.lensPlatformClient.getDecodedAccessToken();

    if (decodedAccessToken?.preferred_username) {
      const json = await this.getOne({ username: decodedAccessToken?.preferred_username });

      return json as unknown as UserWithEmail;
    }

    throw new Error(`jwt.preferred_username is ${decodedAccessToken?.preferred_username}`);
  }

  async deleteOne(username: string): Promise<void> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}`;

    await throwExpected(async () => fetch.delete(url), {
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
      422: (error) => new UnprocessableEntityException(error?.body.message),
    });
  }

  async getUserSubscriptions(username: string): Promise<SubscriptionInfo[]> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}/subscriptions`;
    const json = await throwExpected(async () => fetch.get(url), {
      404: (error) => new NotFoundException(error?.body.message),
      403: () => new ForbiddenException(`Access to user ${username} is forbidden`),
    });

    return json as unknown as SubscriptionInfo[];
  }

  async getUserSubscriptionsSeats(username: string): Promise<SubscriptionSeat[]> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}/subscription-seats`;
    const json = await throwExpected(async () => fetch.get(url), {
      404: (error) => new NotFoundException(error?.body.message),
      403: () => new ForbiddenException(`Access to user ${username} is forbidden`),
    });

    return json as unknown as SubscriptionSeat[];
  }

  async activateSubscription({
    username,
    license,
  }: {
    username: string;
    license: License;
  }): Promise<License> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}/subscriptions`;
    const json = await throwExpected(async () => fetch.post(url, license), {
      404(error) {
        const message = error?.body.message;

        if (typeof message === "string") {
          if (message.includes("User")) {
            return new UserNameNotFoundException(username);
          }
        }

        return new NotFoundException(`Recurly subscription ${license.subscriptionId} not found`);
      },
      409: (error) =>
        new SubscriptionAlreadyExistsException(
          error?.body.message ?? `Subscription for user ${username} already exists`,
        ),
      400: (error) => new BadRequestException(error?.body.message),
      403: () =>
        new ForbiddenException(`Modification of user licenses for ${username} is forbidden`),
      422: (error) => new UnprocessableEntityException(error?.body.message),
    });

    return json as unknown as License;
  }

  async activateSubscriptionSeat({
    username,
    license,
  }: {
    username: string;
    license: License;
  }): Promise<License> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}/subscription-seats`;
    const json = await throwExpected(async () => fetch.post(url, license), {
      404(error) {
        const message = error?.body.message;

        if (typeof message === "string") {
          if (message.includes("User")) {
            return new UserNameNotFoundException(username);
          }
        }

        return new NotFoundException(`Recurly subscription ${license.subscriptionId} not found`);
      },
      409: (error) =>
        new SubscriptionAlreadyExistsException(
          error?.body.message ?? `Subscription seat for user ${username} already exists`,
        ),
      400: (error) => new BadRequestException(error?.body.message),
      403: () =>
        new ForbiddenException(`Modification of user licenses for ${username} is forbidden`),
      422: (error) => new UnprocessableEntityException(error?.body.message),
    });

    return json as unknown as License;
  }

  async getSubscriptionSeatOfflineActivationCode({
    username,
    subscriptionSeatId,
    activationCodeData,
  }: {
    username: string;
    subscriptionSeatId: string;
    activationCodeData: ActivationCodeData;
  }): Promise<OfflineActivationCode | null> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}/subscription-seats/${subscriptionSeatId}/activation-code`;
    const json = await throwExpected(async () => fetch.post(url, activationCodeData), {
      404(error) {
        const message = error?.body.message;

        if (typeof message === "string") {
          if (message.includes("User")) {
            return new UserNameNotFoundException(username);
          }
        }

        return new NotFoundException(`Subscription seat ${subscriptionSeatId} not found`);
      },
      400: (error) => new BadRequestException(error?.body.message),
      403: () =>
        new ForbiddenException(`Modification of user licenses for ${username} is forbidden`),
      422: (error) => new UnprocessableEntityException(error?.body.message),
    });

    return json as unknown as OfflineActivationCode;
  }

  async deactivateSubscriptionSeat({
    username,
    license,
  }: {
    username: string;
    license: Pick<License, "subscriptionId">;
  }): Promise<void> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}/subscription-seats/${license.subscriptionId}`;

    await throwExpected(async () => fetch.patch(url), {
      404(error) {
        const message = error?.body.message;

        if (typeof message === "string") {
          if (message.includes("User")) {
            return new UserNameNotFoundException(username);
          }
        }

        return new NotFoundException(`Recurly subscription ${license.subscriptionId} not found`);
      },
      403: () =>
        new ForbiddenException(`Modification of user licenses for ${username} is forbidden`),
      400: () => new BadRequestException(),
      422: (error) => new UnprocessableEntityException(error?.body.message),
    });
  }

  async getBillingPageToken(username: string): Promise<BillingPageToken> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}/billing-page-token`;
    const json = await throwExpected(async () => fetch.get(url), {
      404: () => new NotFoundException(`User ${username} not found`),
      403: () =>
        new ForbiddenException(`Getting the billing page token for ${username} is forbidden`),
      422: (error) => new UnprocessableEntityException(error?.body.message),
    });

    return json as unknown as BillingPageToken;
  }

  async getBillingPageTokenBySubscriptionId(
    username: string,
    subscriptionId: string,
  ): Promise<BillingPageToken> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}/subscriptions/${subscriptionId}/billing-page-token`;
    const json = await throwExpected(async () => fetch.get(url), {
      404: () => new NotFoundException(`User ${username} not found`),
      403: () =>
        new ForbiddenException(`Getting the billing page token for ${username} is forbidden`),
      422: (error) => new UnprocessableEntityException(error?.body.message),
    });

    return json as unknown as BillingPageToken;
  }

  async getUserBillingInformation(username: string): Promise<BillingInfo> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}/billing`;
    const json = await throwExpected(async () => fetch.get(url), {
      404: () => new NotFoundException(`User ${username} not found`),
      403: () =>
        new ForbiddenException(`Getting the billing information for ${username} is forbidden`),
    });

    return json as unknown as BillingInfo;
  }

  async getUserInvoices(username: string): Promise<Invoice[]> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}/invoices`;
    const json = await throwExpected(async () => fetch.get(url), {
      404: () => new NotFoundException(`User ${username} not found`),
      403: () => new ForbiddenException(`Getting the invoices for ${username} is forbidden`),
    });

    return json as unknown as Invoice[];
  }

  /**
   * Get all emails (primary+secondary) of the user
   */
  async getEmails() {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const username = await this.getUsername();
    const url = `${apiEndpointAddress}/users/${username}/emails`;
    const json = await throwExpected(async () => fetch.get(url), {
      401: (error) => new UnauthorizedException(error?.body?.message),
      404: (error) => new NotFoundException(error?.body?.message),
    });

    return json as unknown as Record<string, "verified" | "unverified" | "primary">;
  }

  /**
   * Get user linked accounts
   */
  async getUserLinkedAccounts() {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const username = await this.getUsername();
    const url = `${apiEndpointAddress}/users/${username}/accounts`;
    const json = await throwExpected(async () => fetch.get(url), {
      401: (error) => new UnauthorizedException(error?.body?.message),
      403: (error) => new UnauthorizedException(error?.body?.message),
      404: (error) => new NotFoundException(error?.body?.message),
    });

    return json as unknown as LinkedUserAccount[];
  }

  /**
   * Get user one time password preferences
   */
  async getUserOTPPreferences() {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const username = await this.getUsername();
    const url = `${apiEndpointAddress}/users/${username}/otp`;
    const json = await throwExpected(async () => fetch.get(url), {
      401: (error) => new UnauthorizedException(error?.body?.message),
      403: (error) => new UnauthorizedException(error?.body?.message),
      404: (error) => new NotFoundException(error?.body?.message),
    });

    return json as unknown as UserOTPPreferences;
  }

  /**
   * Update user one time password preferences
   */
  async updateUserOTPPreferences(preferences: UserOTPPreferences) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const username = await this.getUsername();
    const url = `${apiEndpointAddress}/users/${username}/otp`;
    const json = await throwExpected(async () => fetch.patch(url, preferences), {
      401: (error) => new UnauthorizedException(error?.body?.message),
      403: (error) => new UnauthorizedException(error?.body?.message),
      404: (error) => new NotFoundException(error?.body?.message),
    });

    return json as unknown as UserOTPPreferences;
  }

  /**
   * Get user businesses
   */
  async getUserBusinesses() {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const username = await this.getUsername();
    const url = `${apiEndpointAddress}/users/${username}/businesses`;
    const json = await throwExpected(async () => fetch.get(url), {
      401: (error) => new UnauthorizedException(error?.body?.message),
      403: (error) => new UnauthorizedException(error?.body?.message),
      404: (error) => new NotFoundException(error?.body?.message),
    });

    return json as unknown as UserBusinessWithSSOInfo[];
  }

  /**
   * Get user communication preferences
   */
  async getUserCommunicationsPreferences() {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const username = await this.getUsername();
    const url = `${apiEndpointAddress}/users/${username}/communications`;
    const json = await throwExpected(async () => fetch.get(url), {
      401: (error) => new UnauthorizedException(error?.body?.message),
      403: (error) => new UnauthorizedException(error?.body?.message),
      404: (error) => new NotFoundException(error?.body?.message),
    });

    return json as unknown as UserCommunications;
  }

  /**
   * Update user communication preferences
   */
  async updateUserCommunicationsPreferences(communicationPreferences: UserCommunications) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const username = await this.getUsername();
    const url = `${apiEndpointAddress}/users/${username}/communications`;
    const json = await throwExpected(async () => fetch.patch(url, communicationPreferences), {
      401: (error) => new UnauthorizedException(error?.body?.message),
      403: (error) => new UnauthorizedException(error?.body?.message),
      404: (error) => new NotFoundException(error?.body?.message),
    });

    return json as unknown as UserCommunications;
  }

  /**
   * Delete user linked account
   */
  async deleteUserLinkedAccount(identityProviderAlias: string) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const username = await this.getUsername();
    const url = `${apiEndpointAddress}/users/${username}/accounts/${identityProviderAlias}`;
    const json = await throwExpected(async () => fetch.delete(url), {
      401: (error) => new UnauthorizedException(error?.body?.message),
      403: (error) => new UnauthorizedException(error?.body?.message),
      404: (error) => new NotFoundException(error?.body?.message),
    });

    return json as unknown as void;
  }

  /**
   * Add new secondary email(s) to user's account, newly added email will be unverified
   * and can be promoted to primary later verification.
   */
  async createEmails(emails: string[]) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const username = await this.getUsername();
    const url = `${apiEndpointAddress}/users/${username}/emails`;
    const json = await throwExpected(async () => fetch.post(url, emails), {
      400: (error) => new BadRequestException(error?.body?.message),
      401: (error) => new UnauthorizedException(error?.body?.message),
      422: (error) => new UnprocessableEntityException(error?.body?.message),
    });

    return json as unknown as string[];
  }

  /**
   * Fetch the avatar image as base64-encoded string
   * @param username
   */
  async getAvatar(username: string) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}/avatar`;
    const buffer = await throwExpected(
      async () =>
        fetch.get(url, {
          responseType: "arraybuffer",
        }) as Promise<Buffer>,
      {
        404: (error) => new NotFoundException(error?.body?.message),
      },
    );

    return buffer.toString("base64");
  }

  /**
   * Upload user avatar
   * @param avatar: HTML form file input value
   */
  async uploadAvatar(avatar: File): Promise<UploadAvatarResponse> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const username = await this.getUsername();
    const url = `${apiEndpointAddress}/users/${username}/avatar`;
    const formData = new FormData();

    formData.append("avatar", avatar);
    formData.append("fileName", avatar.name);

    const json = await throwExpected(async () => fetch.post(url, formData), {
      400: (error) => new BadRequestException(error?.body?.message),
      413: () =>
        new BadRequestException("Image size is too big. Image size should be less than 3MB."),
      401: (error) => new UnauthorizedException(error?.body?.message),
      403: (error) => new ForbiddenException(error?.body?.message),
      404: (error) => new NotFoundException(error?.body?.message),
    });

    return json as unknown as UploadAvatarResponse;
  }

  /**
   * Delete secondary email(s) from user account
   */
  async deleteEmails(emails: string[]) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const username = await this.getUsername();
    const url = `${apiEndpointAddress}/users/${username}/emails`;

    await throwExpected(async () => fetch.delete(url, { data: emails }), {
      400: (error) => new BadRequestException(error?.body?.message),
      401: (error) => new UnauthorizedException(error?.body?.message),
      422: (error) => new UnprocessableEntityException(error?.body?.message),
    });
  }

  /**
   * Send a verification email to a user's unverified secondary email address
   */
  async sendVerificationEmail(email: string) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const username = await this.getUsername();
    const url = `${apiEndpointAddress}/users/${username}/emails/send-verification`;

    await throwExpected(async () => fetch.put(url, { email }), {
      400: (error) => new BadRequestException(error?.body?.message),
      401: (error) => new UnauthorizedException(error?.body?.message),
      429: (error) => new TooManyRequestException(error?.body?.message),
    });
  }

  /**
   * Verify a user's secondary email using the token
   */
  async verifySecondaryEmail(token: string) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const decoded = decode<{ username: string; email: string }>(token);

    if (!decoded.username) {
      throw new LensSDKException(null, "Invalid token");
    }

    const url = `${apiEndpointAddress}/users/${decoded.username}/emails/verification`;

    await throwExpected(async () => fetch.post(url, { token }), {
      400: (error) => new BadRequestException(error?.body?.message),
      401: (error) => new UnauthorizedException(error?.body?.message),
      422: (error) => new UnprocessableEntityException(error?.body?.message),
    });
  }

  /**
   * Set a verified email as user's primary email
   */
  async setPrimaryEmail(email: string) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const username = await this.getUsername();
    const url = `${apiEndpointAddress}/users/${username}/emails`;

    await throwExpected(async () => fetch.patch(url, { email }), {
      400: (error) => new BadRequestException(error?.body?.message),
      401: (error) => new UnauthorizedException(error?.body?.message),
      422: (error) => new UnprocessableEntityException(error?.body?.message),
    });
  }

  async confirmPersonalLicenseEligibility(username: string) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/users/${username}/confirm-personal-eligibility`;

    await throwExpected(async () => fetch.post(url, { username }), {
      400: (error) => new BadRequestException(error?.body?.message),
      401: (error) => new UnauthorizedException(error?.body?.message),
      404: () => new NotFoundException(`User ${username} not found`),
    });
  }

  getUserFullName(user: User): string {
    const { firstName, lastName, fullname, username } = user;

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }

    if (firstName) {
      return firstName;
    }

    if (fullname) {
      return fullname;
    }

    return username ?? "";
  }

  async getAuthMethod(email: string, invitationId?: string) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = invitationId
      ? `${apiEndpointAddress}/users/${email}/auth-method?invitationId=${invitationId}`
      : `${apiEndpointAddress}/users/${email}/auth-method`;
    const json = await throwExpected(async () => fetch.get(url), {
      404: (error) => new NotFoundException(error?.body?.message),
    });

    return json as unknown as UserAuthMethod;
  }
}

export { UserService };

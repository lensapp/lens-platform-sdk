import { Base } from "./Base";
import {
  throwExpected,
  ForbiddenException,
  UnprocessableEntityException,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from "./exceptions";
import { BillingPageToken } from "./types/types";
import { SubscriptionState } from "./UserService";

/**
 * "Lens Business ID"
 */
export type Business = {
  /**
   * The business id (in uuid format)
   */
  id: string;
  /**
   * The business name.
   */
  name: string;
  /**
   * The business address.
   */
  address: string;
  /**
   * The business additional address (a.k.a. "address line 2").
   */
  additionalAddress: string | null;
  /**
   * The business country.
   */
  country: string;
  /**
   * The business state / province.
   */
  state: string | null;
  /**
   * The business city.
   */
  city: string;
  /**
   * The business zip/postal code.
   */
  zip: string;
  /**
   * The business phone number.
   */
  phoneNumber: string;
  /**
   * The date the business was created.
   */
  createdAt: string;
  /**
   * The date the business was updated.
   */
  updatedAt: string;
  /**
   * The users that are in the business.
   */
  businessUsers: BusinessUser[];
  /**
   * External is true when a business is created by external provider.
   */
  external: boolean;
  /**
   * The website URL of the business
   */
  websiteUrl: string;
  /**
   * The department name of the business
   */
  department: string;
};

/**
 * The subscription that have been assigned to a user (`user_subscriptions` relation)
 */
export type UsedSeat = {
  /**
   * The id of user_subscriptions entity
   */
  id: string;
  /**
   * The id of subscription entity
   */
  subscriptionId: string;
  /**
   * The created data of user_subscriptions entity in ISO format, e.g. 2022-06-28T08:13:06.000Z
   */
  createdAt: string;
  /**
   * The updated data of user_subscriptions entity in ISO format, e.g. 2022-06-28T08:13:06.000Z
   */
  updatedAt: string;
  /**
   * The activation data of user_subscriptions entity in ISO format, e.g. 2022-06-28T08:13:06.000Z
   */
  activatedAt: string;
  /**
   * The de-activation data of user_subscriptions entity in ISO format, e.g. 2022-06-28T08:13:06.000Z
   */
  deactivatedAt: string | null;
  /**
   * Subscription seat used offline
   */
  offline: boolean;
  /**
   * The expiration data of user_subscriptions entity in ISO format, e.g. 2022-06-28T08:13:06.000Z
   */
  expiredAt: string | null;
  /**
   * The user that is assigned to this subscription
   */
  user: {
    /**
     * The id of the user
     */
    id: string;
    /**
     * The username of the user
     */
    username: string;
    /**
     * The first name of the user
     */
    firstName: string;
    /**
     * The last name of the user
     */
    lastName: string;
    /**
     * The full name of the user
     */
    fullname: string;
    /**
     * User's email address
     */
    email: string;
  };
};

export type BusinessSubscription = {
  /**
   * Subscription ID
   */
  id: string;
  /**
   * Subscribed plan name (Recurly `subscription["plan"]["name"]`, e.g. "Pro")
   */
  planName: string;
  /**
   * Subscribed plan code (Recurly `subscription["plan"]["code"]`, e.g. "pro-monthly")
   */
  planCode: string;
  /**
   * Is trial subscription
   */
  isTrial: boolean;
  /**
   * Current billing period started at (Recurly subscription["currentPeriodStartedAt"] in ISO format. e.g. 2022-06-28T08:13:06.000Z)
   */
  currentPeriodStartedAt: string | null;
  /**
   * Current billing period ends at (Recurly subscription["currentPeriodEndsAt"] in ISO format, e.g. 2022-06-28T08:13:06.000Z)
   */
  currentPeriodEndsAt: string | null;
  /**
   * Is a business account
   */
  businessAccount: boolean;
  /**
   * Total number of seats in this subscription, including unassigned and assigned. (Recurly subscription["quantity"])
   */
  seats: number;
  /**
   * The subscription that have been assigned to a user (`user_subscriptions` relation)
   */
  usedSeats: UsedSeat[];
  /**
   * State of the subscription
   */
  state: SubscriptionState;
};

export type BusinessUser = {
  /**
   * The id of the business user, `undefined` if user is invited but not yet have an account.
   */
  id?: string;
  /**
   * The username of the business user, `undefined` if user is invited but not yet have an account.
   */
  username?: string;
  /**
   * The email of the business user or the email of the invited user.
   */
  email: string;
  /**
   * The fullname of the business user, `undefined` if user is invited but not yet have an account.
   */
  fullname?: string;
  /**
   * The state of the user in the business.
   *   - `active` if the user is in the business.
   *   - `pendign` if the user is invited but not yet in the business.
   */
  state: BusinessInvitationState;
  /**
   * The role of the user in the business or the role of the invited user.
   */
  role: UserBusinessRole;
  /**
   * The createdTimestamp of the business user, `undefined` if user is invited but not yet have an account.
   */
  createdTimestamp?: string;
  /**
   * The firstName of the business user, `undefined` if user is invited but not yet have an account.
   */
  firstName?: string;
  /**
   * The lastName of the business user, `undefined` if user is invited but not yet have an account.
   */
  lastName?: string;
  /**
   * The date the user was invited to the business.
   * `undefined` if the user is not joined via invitation.
   */
  invitationCreatedAt?: string;

  /**
   * The users ID in business
   */
  businessUserId?: string;
};

export type UserBusinessRole = "Administrator" | "Member";
export type BusinessInvitationState = "pending" | "active";
export type BusinessUpdate = Omit<Business, "id" | "createdAt" | "updatedAt" | "businessUsers" | "external">;
export type BusinessInvitation = {
  /**
   * The business invitation ID
   */
  id: string;
  /**
   * The role of the invited user in the business
   */
  role: UserBusinessRole;
  /**
   * Email address of the invited user
   */
  email: string;
  /**
   * The subscription ID of the subscription that the invited user will be assigned to
   */
  subscriptionId?: string;
  /**
   * The state of the invitation
   */
  state: BusinessInvitationState;
  /**
   * The date the invitation was created.
   */
  createdAt: string;
  /**
   * The date the invitation was updated.
   */
  updatedAt: string;
  /**
   * The userId that creates the invitation.
   */
  createdById: string;
};

class BusinessService extends Base {
  /**
   * Lists business entities ("Lens Business ID") that the authenticated user has explicit permissions to access.
   */
  async getMany(): Promise<Business[]> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses`;
    const json = await throwExpected(
      async () => fetch.get(url),
      {
        403: error => new ForbiddenException(error?.body.message),
      },
    );

    return (json as unknown) as Business[];
  }

  /**
   * Get one business entity ("Lens Business ID") by id.
   */
  async getOne(id: Business["id"]): Promise<Business> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}`;
    const json = await throwExpected(
      async () => fetch.get(url),
      {
        404: error => new NotFoundException(error?.body.message),
        403: error => new ForbiddenException(error?.body.message),
      },
    );

    return (json as unknown) as Business;
  }

  /**
   * Create a new business ("Lens Business ID").
   */
  async createOne(business: Omit<Business, "id" | "createdAt" | "updatedAt" | "businessUsers" | "external"> & { id?: string }): Promise<Business> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses`;
    const json = await throwExpected(
      async () => fetch.post(url, business),
      {
        400: error => new BadRequestException(error?.body.message),
        422: error => new UnprocessableEntityException(error?.body.message),
        403: error => new ForbiddenException(error?.body.message),
      },
    );

    return (json as unknown) as Business;
  }

  /**
   * Update an existing business ("Lens Business ID").
   */
  async updateOne(id: string, business: BusinessUpdate): Promise<Business> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}`;
    const json = await throwExpected(
      async () => fetch.patch(url, business),
      {
        400: error => new BadRequestException(error?.body.message),
        422: error => new UnprocessableEntityException(error?.body.message),
        401: error => new UnprocessableEntityException(error?.body.message),
        403: error => new ForbiddenException(error?.body.message),
      },
    );

    return (json as unknown) as Business;
  }

  /**
   * Delete business entity ("Lens Business ID") by id.
   */
  async deleteOne(id: Business["id"]): Promise<void> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}`;
    await throwExpected(
      async () => fetch.delete(url),
      {
        403: error => new ForbiddenException(error?.body.message),
      },
    );
  }

  /**
   * Delete user from the business.
   */
  async deleteBusinessUser(businessId: Business["id"], businessUserId: string): Promise<void> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${businessId}/users/${businessUserId}`;
    await throwExpected(
      async () => fetch.delete(url),
      {
        403: error => new ForbiddenException(error?.body.message),
        404: error => new NotFoundException(error?.body.message),
      },
    );
  }

  /**
   * Change existing business user role
   */
  async changeBusinessUserRole(businessId: Business["id"], businessUserId: string, role: UserBusinessRole): Promise<BusinessUser> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${businessId}/users/${businessUserId}`;
    const json = await throwExpected(
      async () => fetch.patch(url, { role }),
      {
        400: error => new BadRequestException(error?.body.message),
        401: error => new UnprocessableEntityException(error?.body.message),
        403: error => new ForbiddenException(error?.body.message),
      },
    );

    return (json as unknown) as BusinessUser;
  }

  /**
   * Lists the subscriptions by id
   */
  async getSubscriptions(id: Business["id"]): Promise<BusinessSubscription[]> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}/subscriptions`;
    const json = await throwExpected(
      async () => fetch.get(url),
      {
        400: error => new BadRequestException(error?.body.message),
        404: error => new NotFoundException(error?.body.message),
        403: error => new ForbiddenException(error?.body.message),
      },
    );

    return (json as unknown) as BusinessSubscription[];
  }

  /**
   * Activate user business subscription seat
   */
  async activateBusinessUserSubscription({ businessId, businessSubscriptionId, businessInvitationId, username }: { businessId: string; businessSubscriptionId: string; businessInvitationId: string; username: string }): Promise<UsedSeat> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${businessId}/subscriptions`;
    const json = await throwExpected(
      async () => fetch.post(url, {
        invitationId: businessInvitationId,
        subscriptionId: businessSubscriptionId,
      }),
      {
        404: error => new NotFoundException(error?.body.message),
        400: error => new BadRequestException(error?.body.message),
        403: () => new ForbiddenException(`Modification of user licenses for ${username} is forbidden`),
        422: error => new UnprocessableEntityException(error?.body.message),
      },
    );

    return (json as unknown) as UsedSeat;
  }

  /**
   * Deactivate user business subscription seat
   * Request user has to be an owner of the subscription seat or Business Administrator
   */
  async deActivateBusinessUserSubscription({ businessId, businessSubscriptionId, username }: { businessId: string; businessSubscriptionId: string; username: string }): Promise<UsedSeat> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${businessId}/subscriptions/${businessSubscriptionId}`;
    const json = await throwExpected(
      async () => fetch.patch(url),
      {
        404: error => new NotFoundException(error?.body.message),
        400: error => new BadRequestException(error?.body.message),
        403: () => new ForbiddenException(`Modification of user licenses for ${username} is forbidden`),
        422: error => new UnprocessableEntityException(error?.body.message),
      },
    );

    return (json as unknown) as UsedSeat;
  }

  /**
   * Lists the users in the business by id
   */
  async getUsers(id: Business["id"]): Promise<BusinessUser[]> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}/users`;
    const json = await throwExpected(
      async () => fetch.get(url),
      {
        404: error => new NotFoundException(error?.body.message),
        403: error => new ForbiddenException(error?.body.message),
      },
    );

    return (json as unknown) as BusinessUser[];
  }

  /**
   * Get the list of business invitations by business id
   */
  async getInvitations(id: Business["id"]): Promise<BusinessInvitation[]> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}/invitations`;
    const json = await throwExpected(
      async () => fetch.get(url),
      {
        403: error => new ForbiddenException(error?.body.message),
      },
    );

    return (json as unknown) as BusinessInvitation[];
  }

  /**
   * Create a new invitation for a user to join a business, optionally assigning them to a subscription by given subscriptionId.
   *
   * @remarks inviter has to be the administrator of the business
   */
  async createInvitation(id: Business["id"], email: string, subscriptionId?: string, role = "Member"): Promise<{
    id: BusinessInvitation["id"];
    email: BusinessInvitation["email"];
    subscriptionId: BusinessInvitation["subscriptionId"];
    role: UserBusinessRole;
  }> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}/invitations`;
    const json = await throwExpected(
      async () => fetch.post(url, { email, subscriptionId, role }),
      {
        400: error => new BadRequestException(error?.body.message),
        409: error => new ConflictException(error?.body.message),
        422: error => new UnprocessableEntityException(error?.body.message),
        404: error => new NotFoundException(error?.body.message),
        403: error => new ForbiddenException(error?.body.message),
      },
    );

    return (json as unknown) as {
      id: BusinessInvitation["id"];
      email: BusinessInvitation["email"];
      subscriptionId: BusinessInvitation["subscriptionId"];
      role: BusinessInvitation["role"];
    };
  }

  /**
   * Accept an invitation to join a business.
   */
  async acceptInvitation(
    id: Business["id"],
    invitationId: BusinessInvitation["id"],
  ) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}/invitations/${invitationId}`;
    const json = await throwExpected(
      async () => fetch.patch(url, {
        state: "active",
      }),
      {
        400: error => new BadRequestException(error?.body.message),
        422: error => new UnprocessableEntityException(error?.body.message),
        404: error => new NotFoundException(error?.body.message),
        403: error => new ForbiddenException(error?.body.message),
      },
    );

    return (json as unknown) as BusinessInvitation;
  }

  /**
   * Delete business invitation
   */
  async deleteInvitation(
    id: Business["id"],
    invitationId: BusinessInvitation["id"],
  ) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}/invitations/${invitationId}`;
    const json = await throwExpected(
      async () => fetch.delete(url),
      {
        400: error => new BadRequestException(error?.body.message),
        404: error => new NotFoundException(error?.body.message),
        403: error => new ForbiddenException(error?.body.message),
      },
    );

    return (json as unknown) as BusinessInvitation;
  }

  /**
   * Get token for Recurly hosted pages
   *
   * @remarks user has to be the administrator of the business
   */
  async getBillingPageToken(id: Business["id"]): Promise<BillingPageToken> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}/billing-page-token`;
    const json = await throwExpected(
      async () => fetch.get(url),
      {
        404: error => new NotFoundException(error?.body.message),
        403: () => new ForbiddenException(`Getting the billing page token for businessId ${id} is forbidden`),
        422: error => new UnprocessableEntityException(error?.body.message),
      },
    );

    return (json as unknown) as BillingPageToken;
  }
}

export { BusinessService };

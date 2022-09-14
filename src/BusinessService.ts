import { Base } from "./Base";
import {
  throwExpected,
  ForbiddenException,
  UnprocessableEntityException,
  BadRequestException,
  NotFoundException,
} from "./exceptions";

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
  deactivatedAt: string;
  /**
   * The expiration data of user_subscriptions entity in ISO format, e.g. 2022-06-28T08:13:06.000Z
   */
  expiredAt: string;
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
};

export type BusinessUser = {
  /**
   * The id of the business user.
   */
  id: string;
  /**
   * The username of the business user.
   */
  username: string;
  /**
   * The email of the business user.
   */
  email: string;
  /**
   * The fullname of the business user.
   */
  fullname: string;
  /**
   * The state of the user in the business.
   *   - `active` if the user is in the business.
   *   - `pendign` if the user is invited but not yet in the business.
   */
  state: BusinessInvitationState;
  /**
   * The role of the user in the business.
   */
  role: UserBusinessRole;
  /**
   * The createdTimestamp of the business user.
   */
  createdTimestamp: string;
  /**
   * The firstName of the business user.
   */
  firstName: string;
  /**
   * The lastName of the business user.
   */
  lastName: string;
};

export type UserBusinessRole = "Administrator" | "Member";
export type BusinessInvitationState = "pending" | "active";

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
  async createOne(business: Omit<Business, "id" | "createdAt" | "updatedAt" | "businessUsers"> & { id?: string }): Promise<Business> {
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
   * Get delete business entity ("Lens Business ID") by id.
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
  async activateBusinessUserSubscription({ businessId, recurlySubscriptionId, businessInvitationId, username }: { businessId: string; recurlySubscriptionId: string; businessInvitationId: string; username: string }): Promise<UsedSeat> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/business/${businessId}/subscriptions`;
    const json = await throwExpected(
      async () => fetch.post(url, {
        invitationId: businessInvitationId,
        subscriptionId: recurlySubscriptionId,
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
    const url = `${apiEndpointAddress}/business/${businessId}/subscriptions/${businessSubscriptionId}`;
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
   * Create a new invitation for a user to join a business, optionally assigning them to a subscription by given subscriptionId.
   *
   * @remarks inviter has to be the administrator of the business
   */
  async createInvitation(id: Business["id"], email: string, subscriptionId?: string): Promise<{
    id: BusinessInvitation["id"];
    email: BusinessInvitation["email"];
    subscriptionId: BusinessInvitation["subscriptionId"];
  }> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}/invitations`;
    const json = await throwExpected(
      async () => fetch.post(url, { email, subscriptionId }),
      {
        400: error => new BadRequestException(error?.body.message),
        422: error => new UnprocessableEntityException(error?.body.message),
        404: error => new NotFoundException(error?.body.message),
        403: error => new ForbiddenException(error?.body.message),
      },
    );

    return (json as unknown) as {
      id: BusinessInvitation["id"];
      email: BusinessInvitation["email"];
      subscriptionId: BusinessInvitation["subscriptionId"];
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
      async () => fetch.patch(url),
      {
        400: error => new BadRequestException(error?.body.message),
        422: error => new UnprocessableEntityException(error?.body.message),
        404: error => new NotFoundException(error?.body.message),
        403: error => new ForbiddenException(error?.body.message),
      },
    );

    return (json as unknown) as BusinessInvitation;
  }
}

export { BusinessService };

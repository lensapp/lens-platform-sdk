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

export type BusinessSubscription = {
  /**
   * Subscription ID
   */
  id: string;
  /**
   * Subscription state/status  (Recurly `subscription["state"]`)
   */
  state: string;
  /**
   * Subscribed plan name (Recurly `subscription["plan"]["name"]`)
   */
  planName: string;
  /**
   * Subscribed plan code (Recurly `subscription["plan"]["code"]`)
   */
  planCode: string;
  /**
   * The date of next billing cycle (Recurly subscription["currentPeriodEndsAt"] in ISO format)
   */
  nextRenewalDate: string;
  /**
   * Total number of seats in this subscription, including unassigned and assigned. (Recurly subscription["quantity"])
   */
  seats: number;
  /**
   * The seats that have not been assigned to a user yet.
   * = `seat` field - (number of subscription id in user_subscriptions table)
   */
  availableSeats: number;
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

type BusinessUser = {
  /**
   * Id of the user
   */
  id: string;
  /**
   * Role of the user in the business
   */
  role: UserBusinessRole;
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
}

export { BusinessService };

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
  aviableSeats: number;
};

type BusinessUser = {
  /**
   * Id of the user
   */
  id: string;
  /**
   * Role of the user in the business
   */
  role: "Administrator" | "Member";
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
}

export { BusinessService };
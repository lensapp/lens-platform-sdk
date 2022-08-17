import { Base } from "./Base";
import {
  throwExpected,
  ForbiddenException,
  UnprocessableEntityException,
  BadRequestException,
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

type BusinessUser = {
  id: string;
  role: "Administrator" | "Member";
};

class BusinessService extends Base {
  /**
   * Get user's list of businesses (Lens Business IDs).
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
   * Create a business ("Lens Business ID").
   */
  async createOne(business: Business & { id?: string }): Promise<Business> {
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
}

export { BusinessService };

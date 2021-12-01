import { Base } from "./Base";
import { ForbiddenException, SpaceNotFoundException, InternalServerException } from "./exceptions";

export class BillingPageTokenService extends Base {
  /**
   * Fetches Recurly's billing page token
   * required to access billing information controls.
   * **IMPORTANT**: will fail with 500 when trying to fetch token for free spaces
   * due to a non-existent subscription information
   * @param spaceName - name of the space
   * @returns billing page token
   */
  async getOne(spaceName: string): Promise<string> {
    const { apiEndpointAddress, fetch, throwExpected } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${spaceName}/billing-page-token`;

    const token = await throwExpected(
      async () => fetch.get(url),
      {
        404: () => new SpaceNotFoundException(spaceName),
        403: () => new ForbiddenException("Token can only be acquired by space owners and admins"),
        500: response => new InternalServerException(response?.body?.message ?? "Could not retrieve token"),
      },
    );

    return (token as unknown) as string;
  }
}

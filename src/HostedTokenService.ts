import { Base } from "./Base";
import { ForbiddenException, SpaceNotFoundException, throwExpected, UnprocessableEntityException } from "./exceptions";

export class HostedTokenService extends Base {
  /**
   * Fetches a recurly's hosted page token
   * required to access billing information controls.
   * **IMPORTANT**: will fail with code `UnprocessableEntityException` when trying to fetch token for free spaces
   * due to a non-existent subscription information
   * @param spaceName - name of the space
   * @returns hosted page token
   */
  async getOne(spaceName: string): Promise<string> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/spaces/${spaceName}/hosted-token`;

    const token = await throwExpected(
      async () => fetch.get(url),
      {
        404: () => new SpaceNotFoundException(spaceName),
        403: () => new ForbiddenException("Token can only be acquired by space owners and admins"),
        422: response => new UnprocessableEntityException(response?.body?.message ?? "Could not retrieve token")
      }
    );

    return (token as unknown) as string;
  }
}

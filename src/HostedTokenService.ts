import { Base } from "./Base";
import { ForbiddenException, SpaceNotFoundException, throwExpected, UnprocessableEntityException } from "./exceptions";

export class HostedTokenService extends Base {
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

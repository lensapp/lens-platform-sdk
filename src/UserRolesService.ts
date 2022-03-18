import { Base } from "./Base";
import { throwExpected } from "./exceptions";
import { TeamEntityKind } from "./TeamService";

interface UserSpaceRole {
  role: TeamEntityKind;
}

class UserRolesService extends Base {
  async getUserSpaceRole(spaceName: string, userName: string) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;

    const url = `${apiEndpointAddress}/spaces/${spaceName}/users/${userName}/role`;

    const json = await throwExpected(
      async () => fetch.get(url),
    );

    return (json as unknown) as UserSpaceRole;
  }

  async changeUserSpaceRole(spaceName: string, userName: string, targetRole: TeamEntityKind) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;

    const url = `${apiEndpointAddress}/spaces/${spaceName}/users/${userName}/role`;

    const json = await throwExpected(
      async () => fetch.post(url, { role: targetRole }),
    );

    return (json as unknown) as UserSpaceRole;
  }
}

export { UserRolesService };

import { Base } from "./Base";
import { throwExpected } from "./exceptions";
import { TeamEntityKind } from "./TeamService";
import { Roles } from "./Permissions";

interface UserSpaceRole {
  role: Roles;
}

interface UserSpaceTeamEntity {
  role: TeamEntityKind;
}

const rolesToTeamEntityKindMap = {
  [Roles.Owner]: "Owner",
  [Roles.Admin]: "Admin",
  [Roles.Member]: "Normal",
  [Roles.None]: "Normal",
};

const teamEntityKindToRolesMap = {
  ["Owner" as TeamEntityKind]: Roles.Owner,
  ["Admin" as TeamEntityKind]: Roles.Admin,
  ["Normal" as TeamEntityKind]: Roles.Member,
};

class UserRolesService extends Base {
  async getUserSpaceRole(spaceName: string, userName: string) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;

    const url = `${apiEndpointAddress}/spaces/${spaceName}/users/${userName}/role`;

    const json = await throwExpected(
      async () => fetch.get(url),
    );

    const result = (json as unknown) as UserSpaceTeamEntity;

    // TeamEntityKind on client are Roles. Map TeamEntityKind ro Roles.
    return {
      role: teamEntityKindToRolesMap[result.role],
    };
  }

  async changeUserSpaceRole(spaceName: string, userName: string, targetRole: Roles): Promise<UserSpaceRole> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;

    const url = `${apiEndpointAddress}/spaces/${spaceName}/users/${userName}/role`;

    // Roles on the API side are TeamEntityKind. Map Roles to TeamEntityKind.
    const teamRole = rolesToTeamEntityKindMap[targetRole];

    const json = await throwExpected(
      async () => fetch.patch(url, { role: teamRole }),
    );

    const result = (json as unknown) as UserSpaceTeamEntity;

    // TeamEntityKind on client are Roles. Map TeamEntityKind ro Roles.
    return {
      role: teamEntityKindToRolesMap[result.role],
    };
  }
}

export { UserRolesService };

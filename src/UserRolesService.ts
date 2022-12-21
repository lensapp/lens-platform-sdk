import { Base } from "./Base";
import {
  InternalServerException,
  InvalidRoleException,
  NotFoundException,
  PlatformErrorResponse,
  RoleAlreadyAssignedException,
  SpaceNotFoundException,
  throwExpected,
  UnprocessableEntityException,
  UserNameNotFoundException,
} from "./exceptions";
import { TeamEntityKind } from "./TeamService";
import { Roles } from "./Permissions";

type Role = Roles.Owner | Roles.Admin | Roles.Member;

interface UserSpaceRole {
  role: Role;
}

interface UserSpaceTeamEntity {
  role: TeamEntityKind;
}

const rolesToTeamEntityKindMap = {
  [Roles.Owner]: "Owner",
  [Roles.Admin]: "Admin",
  [Roles.Member]: "Normal",
};

const teamEntityKindToRolesMap = {
  ["Owner" as TeamEntityKind]: Roles.Owner as Role,
  ["Admin" as TeamEntityKind]: Roles.Admin as Role,
  ["Normal" as TeamEntityKind]: Roles.Member as Role,
};

const getNotFoundException = (error: PlatformErrorResponse | undefined, userName: string) => {
  if (!error) {
    return new NotFoundException();
  }

  const message = error?.body.message;

  if (typeof message === "string" && message.includes("Space not found")) {
    return new SpaceNotFoundException();
  }

  return new UserNameNotFoundException(userName);
};

class UserRolesService extends Base {
  async getUserSpaceRole(spaceName: string, userName: string) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;

    const url = `${apiEndpointAddress}/spaces/${spaceName}/users/${userName}/role`;

    const json = await throwExpected(async () => fetch.get(url), {
      404: (error) => getNotFoundException(error, userName),
    });

    const result = json as unknown as UserSpaceTeamEntity;

    // TeamEntityKind on client are Roles. Map TeamEntityKind to Roles.
    return {
      role: teamEntityKindToRolesMap[result.role],
    };
  }

  async setUserRole(spaceName: string, userName: string, role: Role): Promise<UserSpaceRole> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;

    const url = `${apiEndpointAddress}/spaces/${spaceName}/users/${userName}/role`;

    // Roles on the API side are TeamEntityKind. Map Roles to TeamEntityKind.
    const teamRole = rolesToTeamEntityKindMap[role];

    const json = await throwExpected(async () => fetch.patch(url, { role: teamRole }), {
      404: (error) => getNotFoundException(error, userName),
      422(error) {
        const message = error?.body.message;

        if (typeof message === "string" && message.includes("Role should be")) {
          return new InvalidRoleException(role);
        }

        if (typeof message === "string" && message.includes("User is already assign")) {
          return new RoleAlreadyAssignedException(role, userName);
        }

        return new UnprocessableEntityException();
      },
      500: () => new InternalServerException(),
    });

    const result = json as unknown as UserSpaceTeamEntity;

    // TeamEntityKind on client are Roles. Map TeamEntityKind to Roles.
    return {
      role: teamEntityKindToRolesMap[result.role],
    };
  }
}

export { UserRolesService };

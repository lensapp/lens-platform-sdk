import { Base } from "./Base";
import {
  InternalServerException,
  SpaceNotFoundException,
  throwExpected,
  UnprocessableEntityException,
  UserNameNotFoundException,
} from "./exceptions";
import { TeamEntityKind } from "./TeamService";
import { Roles } from "./Permissions";
import {
  InvalidRoleException,
  NotAllowedToAccessRoleException,
  RoleAlreadyAssignedException,
} from "./exceptions/roles.exceprions";

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
      {
        404: error => {
          const message = error?.body.message;
          if (typeof message === "string" && message.includes("Space not found")) {
            return new SpaceNotFoundException();
          }

          return new UserNameNotFoundException(userName);
        },
      },
    );

    const result = (json as unknown) as UserSpaceTeamEntity;

    // TeamEntityKind on client are Roles. Map TeamEntityKind to Roles.
    return {
      role: teamEntityKindToRolesMap[result.role],
    };
  }

  async setUserRole(spaceName: string, userName: string, role: Roles): Promise<UserSpaceRole> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;

    const url = `${apiEndpointAddress}/spaces/${spaceName}/users/${userName}/role`;

    // Roles on the API side are TeamEntityKind. Map Roles to TeamEntityKind.
    const teamRole = rolesToTeamEntityKindMap[role];

    const json = await throwExpected(
      async () => fetch.patch(url, { role: teamRole }),
      {
        404: error => {
          const message = error?.body.message;
          if (typeof message === "string" && message.includes("Space not found")) {
            return new SpaceNotFoundException();
          }

          return new UserNameNotFoundException(userName);
        },
        422: error => {
          const message = error?.body.message;
          if (typeof message === "string" && message.includes("Role should be")) {
            return new InvalidRoleException(role);
          }

          if (typeof message === "string" && message.includes("User is already assign")) {
            return new RoleAlreadyAssignedException(role, userName);
          }

          return new UnprocessableEntityException();
        },
        403: () => new NotAllowedToAccessRoleException(role, userName),
        500: () => new InternalServerException(),
      },
    );

    const result = (json as unknown) as UserSpaceTeamEntity;

    // TeamEntityKind on client are Roles. Map TeamEntityKind to Roles.
    return {
      role: teamEntityKindToRolesMap[result.role],
    };
  }
}

export { UserRolesService };

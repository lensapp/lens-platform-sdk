import { Base } from "./Base";
import type { Space } from "./Space";
import type { Team } from "./Team";

export enum Roles {
  Admin = "Admin",
  Owner = "Owner",
  Member = "Member",
  None = "None"
}

export enum Actions {
  DeleteSpace,
  PatchSpace,
  CreateInvitation,
  PatchInvitation,
  CreateTeam,
  DeleteTeam,
  PatchTeam
}

export class PermissionsService extends Base {
  /**
   * Clarifies whether a given user can perform an action in a given space.
   * @param action `Actions` enum value
   * @param forSpace Space object that must contain `{ teams: Team[] }`
   * @param forUserId string userId, defaults to the id of current access token bearer 
   * @returns boolean
   * @throws "Could not get role for space with no teams" exception
   */
  canI(action: Actions, forSpace: Space, forUserId: string = this.lensPlatformClient.currentUserId) {
    let canI = false;

    switch (action) {
      case Actions.DeleteSpace:
        canI = this.getRole(forSpace, forUserId) === Roles.Owner;
        break;
      case Actions.CreateInvitation:
        canI = this.getRole(forSpace, forUserId) !== Roles.None;
        break;
      case Actions.PatchInvitation:
      case Actions.PatchTeam:
      case Actions.PatchSpace:
      case Actions.CreateTeam:
      case Actions.DeleteTeam:
      default:
        canI = [Roles.Owner, Roles.Admin].includes(this.getRole(forSpace, forUserId));
        break;
    }

    return canI;
  }

  /**
   * Gets a role the user with specified user Id has in specified `space`.
   * @param space Space object that must contain `{ teams: Team[] }`
   * @param forUserId string userId, defaults to the id of current access token bearer
   * @returns Role enum value
   * @throws "Could not get role for space with no teams" exception
   */
  getRole(space: Space, forUserId: string = this.lensPlatformClient.currentUserId) {
    if (!space.teams) {
      throw new Error("Could not get role for space with no teams");
    }

    if (this.getOwnerTeams(space).filter((team: Team) => this.isUserInTeam(team, forUserId)).length) {
      return Roles.Owner;
    }

    if (this.getAdminTeams(space).filter((team: Team) => this.isUserInTeam(team, forUserId)).length) {
      return Roles.Admin;
    }

    if (space.teams?.length && space.teams.filter(t => this.isUserInTeam(t, forUserId)).length > 0) {
      return Roles.Member;
    }

    return Roles.None;
  }

  protected getOwnerTeams = (space: Space) => {
    const teams = space.teams ?? [];

    return teams.filter(({ kind }) => kind === "Owner");
  };

  protected getAdminTeams = (space: Space) => {
    const teams = space.teams ?? [];

    return teams.filter(({ kind }) => kind === "Admin");
  };

  protected getNormalTeams = (space: Space) => {
    const teams = space.teams ?? [];

    return teams.filter(({ kind }) => kind === "Normal");
  };

  protected isUserInTeam = (team: Team, userId: string): boolean => {
    if (!team.users?.length) {
      return false;
    }

    return Boolean(team.users.find(u => u.id === userId));
  };
}

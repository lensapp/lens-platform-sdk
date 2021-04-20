import { Base } from "./Base";
import { Space } from "./Space";
import { Team, TeamService } from "./Team";
import { User } from "./User";

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
  canI(action: Actions, forSpace: Space, forUserId: string = this.lensPlatformClient.currentUserId) {
    let canI = false;

    switch (action) {
      case Actions.DeleteSpace:
        canI = this.getRole(forSpace, forUserId) === Roles.Owner;
        break;
      case Actions.CreateTeam:
      case Actions.DeleteTeam:
      case Actions.PatchTeam:
      case Actions.PatchInvitation:
      case Actions.CreateInvitation:
      case Actions.PatchSpace:
      default:
        canI = [Roles.Owner, Roles.Admin].includes(this.getRole(forSpace, forUserId));
        break;
    }

    return canI;
  }

  getRole(space: Space, forUserId: string = this.lensPlatformClient.currentUserId) {
    if (space.ownerId === forUserId) {
      return Roles.Owner;
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

    return teams.filter((t: Team) => t.kind === "Owner");
  };

  protected getAdminTeams = (space: Space) => {
    const teams = space.teams ?? [];

    return teams.filter((t: Team) => t.kind === "Admin");
  };

  protected getNormalTeams = (space: Space) => {
    const teams = space.teams ?? [];

    return teams.filter((t: Team) => t.kind === "Normal");
  };

  protected isUserInTeam = (team: Team, userId: string): boolean => {
    if (!team.users?.length) {
      return false;
    }

    return Boolean(team.users.find(u => u.id === userId));
  };
}

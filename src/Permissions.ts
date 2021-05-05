import type { Space } from "./SpaceService";
import type { Team } from "./TeamService";
import type { K8sCluster } from "./K8sCluster";

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
  RevokeInvitation,
  CreateTeam,
  DeleteTeam,
  PatchTeam
}

export enum K8sClusterActions {
  DeleteK8sCluster
}

export class Permissions {
  /**
   * Clarifies whether a given user can perform an action in a given space.
   * @param action - `Actions` enum value
   * @param forSpace - Space object that must contain `{ teams: Team[] }`
   * @param forUserId - string userId
   * @returns boolean
   * @throws "Could not get role for space with no teams" exception
   */
  canSpace(action: Actions, forSpace: Space, forUserId: string) {
    let canI = false;

    switch (action) {
      case Actions.DeleteSpace:
        canI = this.getRole(forSpace, forUserId) === Roles.Owner;
        break;
      case Actions.CreateInvitation:
        canI = this.getRole(forSpace, forUserId) !== Roles.None;
        break;
      case Actions.PatchInvitation:
      case Actions.RevokeInvitation:
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
   * Clarifies whether a given user can perform an action for a given K8sCluster.
   * @param action - `Actions` enum value
   * @param forSpace - Space object that must contain `{ teams: Team[] }`
   * @param forK8sCluster - K8sCluster
   * @param forUserId - string userId
   * @returns boolean
   * @throws "Could not get role for space with no teams" exception
   */
  canK8sCluster(action: K8sClusterActions, forSpace: Space, forK8sCluster: K8sCluster, forUserId: string) {
    let canI = false;

    switch (action) {
      // Admin, Owner or K8sCluster creator can delete it
      case K8sClusterActions.DeleteK8sCluster: {
        const isOwnerAdmin = [Roles.Owner, Roles.Admin].includes(this.getRole(forSpace, forUserId));
        canI = isOwnerAdmin || forK8sCluster.createdById === forUserId;
        break;
      }

      default:
        throw new Error(`Unknown action ${action}`);
    }

    return canI;
  }

  /**
   * DEPRECATED. WILL BE REMOVED.
   * Clarifies whether a given user can perform an action in a given space.
   * @param action - `Actions` enum value
   * @param forSpace - Space object that must contain `{ teams: Team[] }`
   * @param forUserId - string userId
   * @returns boolean
   * @throws "Could not get role for space with no teams" exception
   */
  canI(action: Actions, forSpace: Space, forUserId: string) {
    return this.canSpace(action, forSpace, forUserId);
  }

  /**
   * Gets a role the user with specified user Id has in specified `space`.
   * @param space - Space object that must contain `{ teams: Team[] }`
   * @param forUserId - string userId
   * @returns Role enum value
   * @throws "Could not get role for space with no teams" exception
   */
  getRole(space: Space, forUserId: string) {
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

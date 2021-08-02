import type { Space, SpaceEntity } from "./SpaceService";
import type { Team, TeamEntity } from "./TeamService";
import type { K8sCluster, K8sClusterEntity } from "./K8sCluster";

export enum Roles {
  Admin = "Admin",
  Owner = "Owner",
  Member = "Member",
  None = "None"
}

/**
 * Space Actions
 */
export enum Actions {
  DeleteSpace,
  PatchSpace,
  CreateInvitation,
  PatchInvitation,
  RevokeInvitation,
  AddInvitationDomain,
  DeleteInvitationDomain,
  CreateTeam,
  DeleteTeam,
  PatchTeam,
  ChangeSpacePlan
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
   * @param forRevokeInvitation - Additional information to determine if a user can revoke invitation
   * @returns boolean
   * @throws "Could not get role for space with no teams" exception
   */
  canSpace(
    action: Actions,
    forSpace: Space | SpaceEntity,
    forUserId: string,
    forRevokeInvitation?: {
      invitationId: string;
      invitationIdsCreatedByUserId: string[];
    }
  ) {
    let canI = false;

    switch (action) {
      case Actions.ChangeSpacePlan:
      case Actions.DeleteSpace:
        canI = this.getRole(forSpace, forUserId) === Roles.Owner;
        break;
      case Actions.PatchInvitation:
      case Actions.RevokeInvitation: {
        if ([Roles.Owner, Roles.Admin].includes(this.getRole(forSpace, forUserId))) {
          canI = true;
        }

        if (
          // If there is an invitationId to be revoked
          forRevokeInvitation?.invitationId &&
          // If this user has created more than one invitation
          forRevokeInvitation?.invitationIdsCreatedByUserId?.length > 0 &&
          // If invitation to revoke was created by userId
          forRevokeInvitation?.invitationIdsCreatedByUserId.find(
            invitationIdCreatedByUserId => invitationIdCreatedByUserId === forRevokeInvitation?.invitationId
          )
        ) {
          canI = true;
        }

        break;
      }

      case Actions.CreateInvitation:
      case Actions.PatchTeam:
      case Actions.PatchSpace:
      case Actions.CreateTeam:
      case Actions.DeleteTeam:
      case Actions.AddInvitationDomain:
      case Actions.DeleteInvitationDomain:
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
  canK8sCluster(action: K8sClusterActions, forSpace: Space | SpaceEntity, forK8sCluster: K8sCluster | K8sClusterEntity, forUserId: string) {
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
   * @deprecated Use .canSpace instead.
   */
  canI(action: Actions, forSpace: Space | SpaceEntity, forUserId: string) {
    return this.canSpace(action, forSpace, forUserId);
  }

  /**
   * Gets a role the user with specified user Id has in specified `space`.
   * @param space - Space object that must contain `{ teams: Team[] }`
   * @param forUserId - string userId
   * @returns Role enum value
   * @throws "Could not get role for space with no teams" exception
   */
  getRole(space: Space | SpaceEntity, forUserId: string) {
    if (!space.teams) {
      throw new Error("Could not get role for space with no teams");
    }

    if (this.getOwnerTeams(space).filter((team: Team) => this.isUserInTeam(team, forUserId)).length) {
      return Roles.Owner;
    }

    if (this.getAdminTeams(space).filter((team: Team) => this.isUserInTeam(team, forUserId)).length) {
      return Roles.Admin;
    }

    if (space.users?.map(user => user.id).includes(forUserId)) {
      return Roles.Member;
    }

    return Roles.None;
  }

  protected getOwnerTeams = (space: Space | SpaceEntity) => {
    const teams = space.teams ?? [];

    return (teams as Team[]).filter(({ kind }) => kind === "Owner");
  };

  protected getAdminTeams = (space: Space | SpaceEntity) => {
    const teams = space.teams ?? [];

    return (teams as Team[]).filter(({ kind }) => kind === "Admin");
  };

  protected getNormalTeams = (space: Space | SpaceEntity) => {
    const teams = space.teams ?? [];

    return (teams as Team[]).filter(({ kind }) => kind === "Normal");
  };

  protected isUserInTeam = (team: Team | TeamEntity, userId: string): boolean => {
    if (!team.users?.length) {
      return false;
    }

    return Boolean(team.users.find(u => u.id === userId));
  };
}

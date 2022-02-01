import type { Space, SpaceEntity } from "./SpaceService";
import type { Team, TeamEntity } from "./TeamService";
import { isDevCluster, K8sCluster, K8sClusterEntity } from "./K8sCluster";

export enum Roles {
  Admin = "Admin",
  Owner = "Owner",
  Member = "Member",
  None = "None",
}

/**
 * Space Actions
 */
export enum Actions {
  DeleteSpace,
  PatchSpace,
  RenameSpace,
  CreateInvitation,
  PatchInvitation,
  RevokeInvitation,
  AddInvitationDomain,
  DeleteInvitationDomain,
  CreateTeam,
  DeleteTeam,
  PatchTeam,
  GetBillingPageToken,
  ChangeSpacePlan,
}

export enum K8sClusterActions {
  // Check if user can access the K8sCluster assuming the Space is accessible
  AccessK8sCluster,

  PatchK8sCluster,
  DeleteK8sCluster,
}

export enum TeamActions {
  AddUser,
  RemoveUser,
}

type RevokeInvitation = {
  invitationId: string;
  invitationIdsCreatedByUserId: string[];
};

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
    forRevokeInvitation?: RevokeInvitation,
  ) {
    const role = this.getRole(forSpace, forUserId);
    const isAdminOrOwner = [Roles.Owner, Roles.Admin].includes(role);

    switch (action) {
      case Actions.ChangeSpacePlan:
        return role === Roles.Owner;

      case Actions.DeleteSpace:
        return forSpace.kind !== "Personal" && role === Roles.Owner;

      case Actions.PatchInvitation:
        return this.canPatchOrRevokeInvitation(forRevokeInvitation, role);

      case Actions.RevokeInvitation:
        return this.canPatchOrRevokeInvitation(forRevokeInvitation, role);

      case Actions.RenameSpace:
        return forSpace.kind !== "Personal" && isAdminOrOwner;

      case Actions.CreateInvitation:
        return isAdminOrOwner;

      case Actions.PatchTeam:
        return isAdminOrOwner;

      case Actions.PatchSpace:
        return isAdminOrOwner;

      case Actions.CreateTeam:
        return isAdminOrOwner;

      case Actions.DeleteTeam:
        return isAdminOrOwner;

      case Actions.AddInvitationDomain:
        return isAdminOrOwner;

      case Actions.GetBillingPageToken:
        return isAdminOrOwner;

      case Actions.DeleteInvitationDomain:
        return isAdminOrOwner;

      default:
        return false;
    }
  }

  /**
   * Clarifies whether a given user can execute the specified Team action
   * @param action - 'TeamActions' enum value
   * @param space - Space object that must contain `{ teams: Team[] }`
   * @param team - Team object
   * @param forUserId - User that is executing the action
   * @param targetUserId - User that is the target of the exection, e.g. user to be removed
   * @returns
   */
  // eslint-disable-next-line max-params
  canTeam(action: TeamActions, space: Space | SpaceEntity, team: Team | TeamEntity, forUserId: string, targetUserId?: string) {
    const role = this.getRole(space, forUserId);
    const isAdminOrOwner = [Roles.Owner, Roles.Admin].includes(role);
    switch (action) {
      case TeamActions.AddUser: {
        if (!this.canSpace(Actions.PatchTeam, space, forUserId)) {
          return false;
        }

        // Prevent adding any user to Owner team of a Personal Space
        if (team.kind === "Owner" && space.kind === "Personal") {
          return false;
        }

        if (team.kind === "Owner") {
          return role === Roles.Owner;
        }

        if (team.kind === "Admin") {
          return isAdminOrOwner;
        }

        if (team.kind === "Normal") {
          return isAdminOrOwner;
        }

        return false;
      }

      case TeamActions.RemoveUser: {
        if (!this.canSpace(Actions.PatchTeam, space, forUserId)) {
          return false;
        }

        // Prevent removing creator of Personal Space from the Owner team
        if (team.kind === "Owner" && space.kind === "Personal" && space.createdById === targetUserId) {
          return false;
        }

        if (team.kind === "Owner") {
          return role === Roles.Owner;
        }

        if (team.kind === "Admin") {
          return isAdminOrOwner;
        }

        if (team.kind === "Normal") {
          return isAdminOrOwner;
        }

        return false;
      }

      default: {
        return false;
      }
    }
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
    const isOwnerAdmin = [Roles.Owner, Roles.Admin].includes(this.getRole(forSpace, forUserId));

    switch (action) {
      // Check if user can access the K8sCluster assuming the Space is accessible
      // DevCluster K8sClusters can only be accessed by the creator or Admin/Owner
      case K8sClusterActions.AccessK8sCluster:
        canI = !isDevCluster(forK8sCluster) || isOwnerAdmin || forK8sCluster.createdById === forUserId;
        break;
      // Check if user can patch the K8sCluster assuming the Space is accessible
      // DevCluster K8sClusters can only be patched by the creator or Admin/Owner
      case K8sClusterActions.PatchK8sCluster:
        canI = !isDevCluster(forK8sCluster) || isOwnerAdmin || forK8sCluster.createdById === forUserId;
        break;
      // Admin, Owner or K8sCluster creator can delete it
      case K8sClusterActions.DeleteK8sCluster: {
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

  protected canPatchOrRevokeInvitation = (forRevokeInvitation: RevokeInvitation | undefined, role: Roles) => {
    const isAdminOrOwner = [Roles.Owner, Roles.Admin].includes(role);
    if (isAdminOrOwner) {
      return true;
    }

    if (
      // If there is an invitationId to be revoked
      forRevokeInvitation?.invitationId
      // If this user has created more than one invitation
      && forRevokeInvitation?.invitationIdsCreatedByUserId?.length > 0
      // If invitation to revoke was created by userId
      && forRevokeInvitation?.invitationIdsCreatedByUserId.find(
        invitationIdCreatedByUserId => invitationIdCreatedByUserId === forRevokeInvitation?.invitationId,
      )
    ) {
      return true;
    }

    return false;
  };
}

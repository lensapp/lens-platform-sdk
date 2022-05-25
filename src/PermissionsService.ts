import { TeamEntity } from "./TeamService";
import { Base } from "./Base";
import type { LensPlatformClientType } from "./index";
import type { Team } from "./TeamService";
import type { K8sCluster, K8sClusterEntity } from "./K8sCluster";
import { Actions, K8sClusterActions, Permissions, TeamActions } from "./Permissions";
import type { Space, SpaceEntity } from "./SpaceService";

export class PermissionsService extends Base {
  permissions: Permissions;

  constructor(lensPlatformClient: LensPlatformClientType) {
    super(lensPlatformClient);
    this.permissions = new Permissions();
  }

  /**
   * Clarifies whether a given user can perform an action in a given space.
   * @param action - `Actions` enum value
   * @param forSpace - Space object that must contain `{ teams: Team[] }`
   * @param forUserId - string userId, defaults to the id of current access token bearer
   * @param forRevokeInvitation - Additional information to determine if a user can revoke invitation
   * @returns boolean
   * @throws "Could not get role for space with no teams" exception
   */
  canSpace(action: Actions, forSpace: Space | SpaceEntity, forUserId: string, forRevokeInvitation?: {
    invitationId: string;
    invitationIdsCreatedByUserId: string[];
  }) {
    return this.permissions.canSpace(action, forSpace, forUserId, forRevokeInvitation);
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
  canTeam(action: TeamActions, space: Space | SpaceEntity, team: Team | TeamEntity, forUserId: string) {
    return this.permissions.canTeam(action, space, team, forUserId);
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
    return this.permissions.canK8sCluster(action, forSpace, forK8sCluster, forUserId);
  }

  /**
   * DEPRECATED. WILL BE REMOVED.
   * Clarifies whether a given user can perform an action in a given space.
   * @param action - `Actions` enum value
   * @param forSpace - Space object that must contain `{ teams: Team[] }`
   * @param forUserId - string userId, defaults to the id of current access token bearer
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
   * @param forUserId - string userId, defaults to the id of current access token bearer
   * @returns Role enum value
   * @throws "Could not get role for space with no teams" exception
   */
  getRole(space: Space | SpaceEntity, forUserId: string) {
    return this.permissions.getRole(space, forUserId);
  }
}

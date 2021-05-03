import { Base } from "./Base";
import type { LensPlatformClientType } from "./index";
import { Actions, Permissions } from "./Permissions";
import type { Space } from "./SpaceService";

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
   * @returns boolean
   * @throws "Could not get role for space with no teams" exception
   */
  canI(action: Actions, forSpace: Space, forUserId: string = this.lensPlatformClient.currentUserId) {
    return this.permissions.canI(action, forSpace, forUserId);
  }

  /**
   * Gets a role the user with specified user Id has in specified `space`.
   * @param space - Space object that must contain `{ teams: Team[] }`
   * @param forUserId - string userId, defaults to the id of current access token bearer
   * @returns Role enum value
   * @throws "Could not get role for space with no teams" exception
   */
  getRole(space: Space, forUserId: string = this.lensPlatformClient.currentUserId) {
    return this.permissions.getRole(space, forUserId);
  }
}

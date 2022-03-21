import { LensSDKException } from "./common.exceptions";
import { teamEntityKinds } from "../TeamService";

export class RoleAlreadyAssignedException extends LensSDKException {
  constructor(role: string, userName: string) {
    super(422, `User '${userName}' is already assigned to role ${role}`);
    Object.setPrototypeOf(this, RoleAlreadyAssignedException.prototype);
  }
}

export class InvalidRoleException extends LensSDKException {
  constructor(role: string) {
    super(422, `Role ${role} is invalid. Role should be ${teamEntityKinds.join(", ")}`);
    Object.setPrototypeOf(this, InvalidRoleException.prototype);
  }
}

export class NotAllowedToAccessRoleException extends LensSDKException {
  constructor(role: string, userName: string) {
    super(403, `You are not allowed to set ${role} to the user ${userName}`);
    Object.setPrototypeOf(this, NotAllowedToAccessRoleException.prototype);
  }
}

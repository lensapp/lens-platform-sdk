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

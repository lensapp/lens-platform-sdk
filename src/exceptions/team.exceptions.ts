import { UnprocessableEntityException, ForbiddenException } from "./common.exceptions";

export class CantRemoveLastTeamUser extends UnprocessableEntityException {
  constructor(msg = "Can't remove last user from team") {
    super(msg);
    Object.setPrototypeOf(this, CantRemoveLastTeamUser.prototype);
  }
}

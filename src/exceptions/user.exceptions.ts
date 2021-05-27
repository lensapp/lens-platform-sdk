import { NotFoundException, LensSDKException } from "./common.exceptions";

export class UserNameNotFoundException extends NotFoundException {
  constructor(userName: string) {
    super(`Could not find user @${userName}`);
    Object.setPrototypeOf(this, UserNameNotFoundException.prototype);
  }
}

export class UserIdNotFoundException extends NotFoundException {
  constructor(userId: string) {
    super(`Could not find user by id ${userId}`);
    Object.setPrototypeOf(this, UserIdNotFoundException.prototype);
  }
}

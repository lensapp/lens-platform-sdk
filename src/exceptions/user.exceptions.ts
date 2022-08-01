import { NotFoundException, ConflictException } from "./common.exceptions";

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

export class UsernameAlreadyExistsException extends ConflictException {
  constructor() {
    super();
    Object.setPrototypeOf(this, UsernameAlreadyExistsException.prototype);
  }
}

export class SubscriptionAlreadyExistsException extends ConflictException {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, SubscriptionAlreadyExistsException.prototype);
  }
}

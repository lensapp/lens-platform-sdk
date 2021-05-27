import { LensSDKException, UnprocessableEntityException } from "./common.exceptions";

export class PastExpiryException extends UnprocessableEntityException {
  constructor(msg = "Expiry time can't be in the past") {
    super(msg);
    Object.setPrototypeOf(this, PastExpiryException.prototype);
  }
}

export class UserAlreadyExistsException extends UnprocessableEntityException {
  constructor(userName?: string) {
    super(`User${userName ? " @" + userName : ""} already exists in space`);
    Object.setPrototypeOf(this, UserAlreadyExistsException.prototype);
  }
}

export class PendingInvitationException extends UnprocessableEntityException {
  constructor(userName?: string) {
    super(`User${userName ? " @" + userName : ""} already has a pending invitation to this space`);
    Object.setPrototypeOf(this, PendingInvitationException.prototype);
  }
}

export class EmailMissingException extends UnprocessableEntityException {
  constructor() {
    super("E-mail address is missing from invitation object");
    Object.setPrototypeOf(this, EmailMissingException.prototype);
  }
}

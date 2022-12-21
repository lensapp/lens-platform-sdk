import { UnprocessableEntityException, ForbiddenException } from "./common.exceptions";

export class PastExpiryException extends UnprocessableEntityException {
  constructor(msg = "Expiry time can't be in the past") {
    super(msg);
    Object.setPrototypeOf(this, PastExpiryException.prototype);
  }
}

export class UserAlreadyExistsException extends UnprocessableEntityException {
  constructor(userName?: string) {
    super(`User${userName ? ` ${userName}` : ""} already exists in space`);
    Object.setPrototypeOf(this, UserAlreadyExistsException.prototype);
  }
}

export class PendingInvitationException extends UnprocessableEntityException {
  constructor(userName?: string) {
    super(`User${userName ? ` ${userName}` : ""} already has a pending invitation to this space`);
    Object.setPrototypeOf(this, PendingInvitationException.prototype);
  }
}

export class EmailMissingException extends UnprocessableEntityException {
  constructor() {
    super("Email address is missing from invitation object");
    Object.setPrototypeOf(this, EmailMissingException.prototype);
  }
}

export class InvalidEmailDomainException extends ForbiddenException {
  // The message is e.g.:
  // "Sorry, your email address domain example.com is not authorized to join this Space.
  // Please contact your Space Administrator."
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidEmailDomainException.prototype);
  }
}

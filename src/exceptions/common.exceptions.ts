interface LensPlatformExceptionData {
  errorCode: number | string | null;
  message: string;
}
/**
 * Base class for exceptions
 */
export class LensSDKException extends Error implements LensPlatformExceptionData {
  constructor(
    public errorCode: number | string | null,
    public message: string,
    public rawException?: unknown,
  ) {
    super(message);
    Object.setPrototypeOf(this, LensSDKException.prototype);
    Error.captureStackTrace(this, LensSDKException);
  }
}

export class NotFoundException extends LensSDKException {
  constructor(message = "Entity not found", rawException?: unknown) {
    super(404, message, rawException);
    Object.setPrototypeOf(this, NotFoundException.prototype);
  }
}

export class UnauthorizedException extends LensSDKException {
  constructor(message = "Failed to verify authorization token", rawException?: unknown) {
    super(401, message, rawException);
    Object.setPrototypeOf(this, UnauthorizedException.prototype);
  }
}

export class ConflictException extends LensSDKException {
  constructor(message = "Conflict", rawException?: unknown) {
    super(409, message, rawException);
    Object.setPrototypeOf(this, UnauthorizedException.prototype);
  }
}

export class ForbiddenException extends LensSDKException {
  constructor(message = "Forbidden", rawException?: unknown) {
    super(403, message, rawException);
    Object.setPrototypeOf(this, ForbiddenException.prototype);
  }
}

export class TokenNotFoundException extends LensSDKException {
  constructor(message = "Token not found", rawException?: unknown) {
    super(500, message, rawException);
    Object.setPrototypeOf(this, TokenNotFoundException.prototype);
  }
}

export class BadRequestException extends LensSDKException {
  constructor(message = "Bad request", rawException?: unknown) {
    super(400, message, rawException);
    Object.setPrototypeOf(this, BadRequestException.prototype);
  }
}

export class UnprocessableEntityException extends LensSDKException {
  constructor(message = "Unprocessable entity", rawException?: unknown) {
    super(422, message, rawException);
    Object.setPrototypeOf(this, UnprocessableEntityException.prototype);
  }
}

export class InternalServerException extends LensSDKException {
  constructor(message = "Internal server error", rawException?: unknown) {
    super(500, message, rawException);
    Object.setPrototypeOf(this, InternalServerException.prototype);
  }
}

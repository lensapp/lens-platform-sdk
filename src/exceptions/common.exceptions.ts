import type { HTTPErrorCode } from "./HTTPErrrorCodes";

interface LensPlatformExceptionData {
  errorCode: HTTPErrorCode;
  message: string;
}
/**
 * Base class for exceptions
 */
export class LensSDKException extends Error implements LensPlatformExceptionData {
  constructor(
    public errorCode: HTTPErrorCode,
    public message: string,
    public rawException?: unknown
  ) {
    super(message);
    Object.setPrototypeOf(this, LensSDKException.prototype);
    Error.captureStackTrace(this, LensSDKException);
  }
}

export class NotFoundException extends LensSDKException {
  constructor(message = "Entity not found") {
    super(404, message);
    Object.setPrototypeOf(this, NotFoundException.prototype);
  }
}

export class ForbiddenException extends LensSDKException {
  constructor(message = "Fobidden") {
    super(403, message);
    Object.setPrototypeOf(this, ForbiddenException.prototype);
  }
}

export class TokenNotFoundException extends LensSDKException {
  constructor(message = "Token not found") {
    super(500, message);
    Object.setPrototypeOf(this, TokenNotFoundException.prototype);
  }
}

export class BadRequestException extends LensSDKException {
  constructor(message = "Bad request") {
    super(400, message);
    Object.setPrototypeOf(this, BadRequestException.prototype);
  }
}

export class UnprocessableEntityException extends LensSDKException {
  constructor(message = "Unprocessable entity") {
    super(422, message);
    Object.setPrototypeOf(this, UnprocessableEntityException);
  }
}

import type { HTTPErrorCode } from "./HTTPErrrorCodes";

interface LensPlatformExceptionData {
  errorCode: HTTPErrorCode;
  message: string;
}
/**
 * Base class for exceptions
 */
export class LensPlatformException extends Error implements LensPlatformExceptionData {
  constructor(
    public errorCode: HTTPErrorCode,
    public message: string,
    public rawException?: unknown
  ) {
    super(message);
    Object.setPrototypeOf(this, LensPlatformException.prototype);
  }
}

export class NotFoundException extends LensPlatformException {
  constructor(message = "Entity not found") {
    super(404, message);
  }
}


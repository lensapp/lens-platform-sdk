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
  }
}

export class NotFoundException extends LensSDKException {
  constructor(message = "Entity not found") {
    super(404, message);
  }
}


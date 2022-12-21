import {
  LensSDKException,
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
} from "./common.exceptions";
import axios, { AxiosError, AxiosResponse } from "axios";

const parseHTTPErrorCode = (exception: AxiosError) => {
  if (exception?.name && exception?.message && exception?.message?.length) {
    const execArr = /code\s([\d]{3})/g.exec(exception.message) ?? [];

    if (execArr?.length >= 2) {
      return parseInt(execArr[1], 10);
    }
  }

  return null;
};

export type PlatformErrorResponse = AxiosResponse & { body: any };

/**
 * Transforms an axios error response (with .data key) into a response with .body key
 * (for backwards compatibility)
 */
const toPlatformErrorResponse = async (response: AxiosError["response"]) => {
  if (response?.data) {
    return {
      ...response,
      body: response?.data,
    };
  }

  return undefined;
};

/**
 * Mapping of HTTP error codes onto expected exceptions
 * @example
 * ```
 * const map: HTTPErrCodeExceptionMap = {
 *  404: () => new SpaceNotFoundException("my-test-space"),
 *  405: () => new LensPlatformException(405, "Method 'PUT' not allowed")
 * };
 * ```
 */
export type HTTPErrCodeExceptionMap<T = LensSDKException> = Partial<
  Record<number, (e?: PlatformErrorResponse) => T>
>;

/**
 * Executes a given function, catching all exceptions. When an exception is caught
 * it is converted to strongly-typed `LensPlatformExtension` and thrown again.
 * @param fn - a function
 * @param exceptionsMap - map of HTTP error codes onto expected exception creators
 * @returns the ressult of `fn`
 * @throws extected exceptions or `LensPlatformException` with code 400 if it caught something unexpected
 * @example
 * ```
 * const json = throwExpected(
 *  () => fetch.get(url),
 *    {
 *      404: e => e.url.includes("/user") ?
 *        new NotFoundException(`User ${username} not found`) :
 *        new NotFoundException(`Something else not found`),
 *      500: () => new TokenNotFoundException()
 *    }
 * );
 * ```
 */
export const throwExpected = async <T = any>(
  fn: () => Promise<T>,
  exceptionsMap: HTTPErrCodeExceptionMap = {},
) => {
  try {
    const result = await fn();

    return result;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const httpStatusCode = error.response?.status ?? parseHTTPErrorCode(error);

      if (!httpStatusCode) {
        throw new LensSDKException(
          httpStatusCode,
          "Unexpected exception [Lens Platform SDK]",
          error,
        );
      }

      const mappedExceptionFn = exceptionsMap[httpStatusCode];

      const data: any = error.response?.data;
      const message = data?.message as string | undefined;

      if (mappedExceptionFn) {
        throw mappedExceptionFn(await toPlatformErrorResponse(error?.response));
      } else if (httpStatusCode === 400) {
        throw new BadRequestException(message, error);
      } else if (httpStatusCode === 401) {
        throw new UnauthorizedException(message, error);
      } else if (httpStatusCode === 403) {
        throw new ForbiddenException(message, error);
      }
    }

    // If axios.isAxiosError(error) returns falsy
    throw new LensSDKException(
      (error as any)?.response?.status,
      "Unexpected exception [Lens Platform SDK]",
      error,
    );
  }
};

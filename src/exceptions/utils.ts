import type { HTTPErrorCode } from "./HTTPErrrorCodes";
import { HTTPErrorCodes } from "./HTTPErrrorCodes";
import { LensSDKException, UnauthorizedException } from "./common.exceptions";

// Use 'Bad Request' as a fallback exception
const FALLBACK_HTTP_ERROR_CODE: HTTPErrorCode = 400;

const parseHTTPErrorCode = (exception: unknown): HTTPErrorCode | null => {
  const e = exception as any;

  if (e.name && e.message && e.message.length) {
    const execArr = /code\s([\d]{3})/g.exec(e.message) ?? [];

    if (execArr?.length >= 2) {
      return parseInt(execArr[1], 10) as any;
    }
  }

  return null;
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
export type HTTPErrCodeExceptionMap<T = LensSDKException> = Partial<Record<HTTPErrorCode, (e?: unknown) => T>>;

const DEFAULT_MAP: HTTPErrCodeExceptionMap = {
  401: e => new UnauthorizedException((e as any)?.message)
};

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
 *  () => got.get(url),
 *    {
 *      404: e => e.option.url.path === "/user" ?
 *        new NotFoundException(`User ${username} not found`) :
 *        new NotFoundException(`Something else not found`),
 *      500: () => new TokenNotFoundException()
 *    }
 * );
 * ```
 */
export const throwExpected = async <T = any>(fn: () => Promise<T>, exceptionsMap: HTTPErrCodeExceptionMap = {}): Promise<T> => {
  try {
    const result = await fn();

    return result;
  } catch (e: unknown) {
    const errCode = parseHTTPErrorCode(e) ?? FALLBACK_HTTP_ERROR_CODE;
    const mappedExceptionFn = exceptionsMap[errCode] ?? DEFAULT_MAP[errCode];

    if (mappedExceptionFn) {
      // Throw expected exception
      throw mappedExceptionFn(e);
    } else {
      // Throw strongly-typed unexpected exception
      throw new LensSDKException(errCode, "Unexpected exception [Lens Platform SDK]: " + HTTPErrorCodes[errCode], e);
    }
  }
};


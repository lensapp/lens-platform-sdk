import { LensSDKException, ForbiddenException, UnauthorizedException, BadRequestException } from "./common.exceptions";
import axios, { AxiosError, AxiosResponse } from "axios";
import retry from "async-retry";
import { timeout } from "../helpers/timeout";

const parseHTTPErrorCode = (exception: AxiosError) => {
  if (exception?.name && exception?.message && exception?.message?.length) {
    const execArr = /code\s([\d]{3})/g.exec(exception.message) ?? [];

    if (execArr?.length >= 2) {
      return parseInt(execArr[1], 10);
    }
  }

  return null;
};

type PlatformErrorResponse = AxiosResponse & { body: any };

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
export type HTTPErrCodeExceptionMap<T = LensSDKException> = Partial<Record<number, (e?: PlatformErrorResponse) => T>>;

export const handleException = async (
  error: unknown,
  exceptionsMap: HTTPErrCodeExceptionMap,
) => {
  if (axios.isAxiosError(error)) {
    const httpStatusCode = error.response?.status ?? parseHTTPErrorCode(error);

    if (!httpStatusCode) {
      throw new LensSDKException(httpStatusCode, "Unexpected exception [Lens Platform SDK]", error);
    }

    const mappedExceptionFn = exceptionsMap[httpStatusCode];

    if (mappedExceptionFn) {
      throw mappedExceptionFn(
        await toPlatformErrorResponse(error?.response),
      );
    } else if (httpStatusCode === 400) {
      throw new BadRequestException(error.response?.data?.message, error);
    } else if (httpStatusCode === 401) {
      throw new UnauthorizedException(error.response?.data?.message, error);
    } else if (httpStatusCode === 403) {
      throw new ForbiddenException(error.response?.data?.message, error);
    }
  }

  // If axios.isAxiosError(error) returns falsy
  throw new LensSDKException((error as any)?.response?.status, "Unexpected exception [Lens Platform SDK]", error);
};

export const defaultRetries = 3;
export const defaultRetryIntervalMS = 1000;
/**
 * Executes a given function, catching all exceptions. When an exception is caught
 * it is converted to strongly-typed `LensPlatformExtension` and thrown again.
 * @param fn - a function
 * @param exceptionsMap - map of HTTP error codes onto expected exception creators
 * @param retryInterval - time between retries
 * @param retries - How many times to retry
 * @returns the result of `fn`
 * @throws expected exceptions or `LensPlatformException` with code 400 if it caught something unexpected
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
  retryInterval = defaultRetryIntervalMS,
  retries = defaultRetries,
) => {
  try {
    // First try
    const result = await fn();

    return result;
  } catch (error: unknown) {
    // Retry if the error is a Network error and GET
    if (
      axios.isAxiosError(error)
      // If it's an axios error but there is no response => a network error
      // See https://github.com/axios/axios#handling-errors
      && !error.response
      // ONLY retry for GET requests
      && error.config?.method === "get"
    ) {
      await timeout(retryInterval);
      try {
        const retriedResult = await retry<T>(
          async () =>
            // Second try
            fn()
          ,
          {
            minTimeout: retryInterval,
            retries: retries - 1 - 1, // Two `-1` because we already did two tries
          },

        );
        return retriedResult;
      } catch (error: unknown) {
        await handleException(error, exceptionsMap);
        return undefined;
      }
    }

    await handleException(error, exceptionsMap);
  }
};


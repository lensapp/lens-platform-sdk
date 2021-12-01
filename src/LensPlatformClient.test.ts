import LensPlatformClient from "./LensPlatformClient";
import axios from "axios";
import { minimumOptions, accessToken, apiEndpointAddress } from "./helpers/testConfig";
import { defaultRetries, defaultRetryIntervalMS } from "./exceptions/utils"

jest.setTimeout(defaultRetries * defaultRetryIntervalMS);
describe("LensPlatformClient", () => {
  beforeEach(() => {
    // Resets all the mocks usage data, but keeps the behaviour (e.g. return value) of the mocks
    jest.clearAllMocks();
    // Same as “clearMocks”: true but also resets the behaviour of the mocks
    jest.resetAllMocks();
    // Restores methods that were spied using jest.spyOn(..) to its original method.
    // This flag is independent of the clearMocks / resetMocks flags.
    jest.restoreAllMocks();
  });

  it("is a class", () => {
    // @ts-expect-error
    // eslint-disable-next-line new-cap, @typescript-eslint/no-unsafe-return
    expect(() => LensPlatformClient()).toThrow("Cannot call a class as a function");
  });

  it("checks options in constructor", () => {
    // @ts-expect-error
    expect(() => new LensPlatformClient()).toThrow("Options can not be undefined");
    // @ts-expect-error
    expect(() => new LensPlatformClient({
      accessToken: undefined,
      getAccessToken: undefined,
    })).toThrow("Both accessToken undefined or getAccessToken are undefined");
  });

  it("can `new LensPlatformClient` with minimum (but valid) options", () => {
    expect(
      () => new LensPlatformClient(minimumOptions),
    ).not.toThrow();
  });

  it(".authHeader", () => {
    const lensPlatformClient = new LensPlatformClient(minimumOptions);
    expect(lensPlatformClient.authHeader).toEqual({
      Authorization: `Bearer ${accessToken}`,
    });
  });

  describe("proxied version of fetch", () => {
    it(("adds Authorization header"), async () => {
      const expectedHeaders = { Authorization: `Bearer ${accessToken}` };
      const lensPlatformClient = new LensPlatformClient({
        ...minimumOptions,
      });

      const spies = [
        jest.spyOn(axios, "get"),
        jest.spyOn(axios, "head"),
        jest.spyOn(axios, "delete"),
      ];

      const _fetch = lensPlatformClient.fetch;

      try {
        await Promise.all([
          _fetch.get(apiEndpointAddress),
          _fetch.head(apiEndpointAddress),
          _fetch.delete(apiEndpointAddress),
        ]);
      } catch {
        // Do not handle exceptions
      } finally {
        spies.forEach(spy => {
          expect(spy).toBeCalledWith(apiEndpointAddress, { headers: expectedHeaders });
          spy.mockRestore();
        });
      }
    });

    it(("doesn't add Authorization header if no token"), async () => {
      const lensPlatformClient = new LensPlatformClient({
        ...minimumOptions,
        accessToken: "",
        getAccessToken: async () => Promise.resolve(""),
      });

      const spy = jest.spyOn(axios, "get");
      const _fetch = lensPlatformClient.fetch;

      try {
        await _fetch.get(apiEndpointAddress);
      } catch {
        // Do not handle exceptions
      } finally {
        expect(spy).toBeCalledWith(apiEndpointAddress, { headers: {} });
        spy.mockRestore();
      }
    });

    it(("adds Authorization header with body"), async () => {
      const expectedHeaders = { Authorization: `Bearer ${accessToken}` };
      const lensPlatformClient = new LensPlatformClient({
        ...minimumOptions,
      });

      const spies = [
        jest.spyOn(axios, "post"),
        jest.spyOn(axios, "put"),
        jest.spyOn(axios, "patch"),
      ];

      const _fetch = lensPlatformClient.fetch;

      try {
        await Promise.all([
          _fetch.post(apiEndpointAddress),
          _fetch.put(apiEndpointAddress),
          _fetch.patch(apiEndpointAddress),
        ]);
      } catch {
        // Do not handle exceptions
      } finally {
        spies.forEach(spy => {
          expect(spy).toBeCalledWith(apiEndpointAddress, undefined, { headers: expectedHeaders });
          spy.mockRestore();
        });
      }
    });

    it(("merged request options"), async () => {
      const extraOptions = { withCredentials: true };
      const expectedHeaders = { Authorization: `Bearer ${accessToken}` };
      const lensPlatformClient = new LensPlatformClient({
        ...minimumOptions,
      });

      const spies = [
        jest.spyOn(axios, "get"),
        jest.spyOn(axios, "head"),
        jest.spyOn(axios, "delete"),
      ];

      const _fetch = lensPlatformClient.fetch;
      try {
        await Promise.all([
          _fetch.get(apiEndpointAddress, extraOptions),
          _fetch.head(apiEndpointAddress, extraOptions),
          _fetch.delete(apiEndpointAddress, extraOptions),
        ]);
      } catch {
        // Do not handle exceptions
      } finally {
        spies.forEach(spy => {
          expect(spy).toBeCalledWith(apiEndpointAddress, { headers: expectedHeaders, ...extraOptions });
          spy.mockRestore();
        });
      }
    });

    it(("merged request options with body"), async () => {
      const extraOptions = { withCredentials: true };
      const expectedHeaders = { Authorization: `Bearer ${accessToken}` };
      const lensPlatformClient = new LensPlatformClient({
        ...minimumOptions,
      });

      const spies = [
        jest.spyOn(axios, "post"),
        jest.spyOn(axios, "put"),
        jest.spyOn(axios, "patch"),
      ];

      const _fetch = lensPlatformClient.fetch;
      try {
        await Promise.all([
          _fetch.post(apiEndpointAddress, undefined, extraOptions),
          _fetch.put(apiEndpointAddress, undefined, extraOptions),
          _fetch.patch(apiEndpointAddress, undefined, extraOptions),
        ]);
      } catch {
        // Do not handle exceptions
      } finally {
        spies.forEach(spy => {
          expect(spy).toBeCalledWith(apiEndpointAddress, undefined, { headers: expectedHeaders, ...extraOptions });
          spy.mockRestore();
        });
      }
    });

    it(("merged headers"), async () => {
      const defaultHeaders = { "X-Consumer-Id": "xx-yy-zz" };
      const extraHeader = { "X-An-Example": "Header" };
      const expectedHeaders = { Authorization: `Bearer ${accessToken}`, ...extraHeader, ...defaultHeaders };
      const lensPlatformClient = new LensPlatformClient({
        ...minimumOptions,
        ...{
          defaultHeaders: { "X-Consumer-Id": "xx-yy-zz" },
        },
      });

      const spies = [
        jest.spyOn(axios, "get"),
        jest.spyOn(axios, "head"),
        jest.spyOn(axios, "delete"),
      ];

      const _fetch = lensPlatformClient.fetch;

      try {
        await Promise.all([
          _fetch.get(apiEndpointAddress, { headers: extraHeader }),
          _fetch.head(apiEndpointAddress, { headers: extraHeader }),
          _fetch.delete(apiEndpointAddress, { headers: extraHeader }),
        ]);
      } catch {
        // Do not handle exceptions
      } finally {
        spies.forEach(spy => {
          expect(spy).toBeCalledWith(apiEndpointAddress, { headers: expectedHeaders });
          spy.mockRestore();
        });
      }
    });

    it(("merged headers with body"), async () => {
      const defaultHeaders = { "X-Consumer-Id": "xx-yy-zz" };
      const extraHeader = { "X-An-Example": "Header" };
      const expectedHeaders = { Authorization: `Bearer ${accessToken}`, ...extraHeader, ...defaultHeaders };
      const lensPlatformClient = new LensPlatformClient({
        ...minimumOptions,
        ...{
          defaultHeaders: { "X-Consumer-Id": "xx-yy-zz" },
        },
      });

      const spies = [
        jest.spyOn(axios, "post"),
        jest.spyOn(axios, "put"),
        jest.spyOn(axios, "patch"),
      ];

      const _fetch = lensPlatformClient.fetch;

      try {
        await Promise.all([
          _fetch.post(apiEndpointAddress, {}, { headers: extraHeader }),
          _fetch.put(apiEndpointAddress, {}, { headers: extraHeader }),
          _fetch.patch(apiEndpointAddress, {}, { headers: extraHeader }),
        ]);
      } catch {
        // Do not handle exceptions
      } finally {
        spies.forEach(spy => {
          expect(spy).toBeCalledWith(apiEndpointAddress, {}, { headers: expectedHeaders });
          spy.mockRestore();
        });
      }
    });

    it(("merged headers and request options at the same time"), async () => {
      const extraHeader = { "X-An-Example": "Header" };
      const extraOption = { json: { an: "example_extra_option" } };
      const lensPlatformClient = new LensPlatformClient({
        ...minimumOptions,
      });

      const spies = [
        jest.spyOn(axios, "get"),
        jest.spyOn(axios, "head"),
        jest.spyOn(axios, "delete"),
      ];

      const _fetch = lensPlatformClient.fetch;

      try {
        await Promise.all([
          _fetch.get(apiEndpointAddress, { ...extraOption, headers: extraHeader }),
          _fetch.head(apiEndpointAddress, { ...extraOption, headers: extraHeader }),
          _fetch.delete(apiEndpointAddress, { ...extraOption, headers: extraHeader }),
        ]);
      } catch {
        // Do not handle exceptions
      } finally {
        spies.forEach(spy => {
          expect(spy).toBeCalledWith(apiEndpointAddress, {
            headers: {
              ...extraHeader,
              ...{ Authorization: `Bearer ${accessToken}` },
            },
            ...extraOption,
          });
          spy.mockRestore();
        });
      }
    });

    it(("merged headers and request options at the same time with body"), async () => {
      const extraHeader = { "X-An-Example": "Header" };
      const extraOption = { json: { an: "example_extra_option" } };
      const lensPlatformClient = new LensPlatformClient({
        ...minimumOptions,
      });

      const spies = [
        jest.spyOn(axios, "post"),
        jest.spyOn(axios, "put"),
        jest.spyOn(axios, "patch"),
      ];

      const _fetch = lensPlatformClient.fetch;

      try {
        await Promise.all([
          _fetch.post(apiEndpointAddress, { a: 1 }, { ...extraOption, headers: extraHeader }),
          _fetch.put(apiEndpointAddress, { a: 1 }, { ...extraOption, headers: extraHeader }),
          _fetch.patch(apiEndpointAddress, { a: 1 }, { ...extraOption, headers: extraHeader }),
        ]);
      } catch {
        // Do not handle exceptions
      } finally {
        spies.forEach(spy => {
          expect(spy).toBeCalledWith(apiEndpointAddress, { a: 1 }, {
            headers: {
              ...extraHeader,
              ...{ Authorization: `Bearer ${accessToken}` },
            },
            ...extraOption,
          });
          spy.mockRestore();
        });
      }
    });

    it((`should retry ${defaultRetries} times if GET get Network error`), async () => {
      const lensPlatformClient = new LensPlatformClient({
        ...minimumOptions,
      });
      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);

      const fakeAxiosGetError = new Error("fakeAxiosGetError");
      // @ts-expect-error
      fakeAxiosGetError.config = {};
      // @ts-expect-error
      fakeAxiosGetError.config.method = "get";

      const spyOnGet = jest.spyOn(axios, "get")
        .mockImplementationOnce(async () => {
          throw fakeAxiosGetError;
        })
        .mockImplementationOnce(async () => {
          throw fakeAxiosGetError;
        })
        .mockImplementationOnce(async () => {
          throw fakeAxiosGetError;
        });

      try {
        await lensPlatformClient.space.getOne({ name: "any" });
      } catch {
        // Do not handle exceptions
      } finally {
        expect(spyOnGet).toBeCalledTimes(defaultRetries);
      }
    });

    it(("shouldn't retry if request is not idempotent (POST)"), async () => {
      const lensPlatformClient = new LensPlatformClient({
        ...minimumOptions,
      });
      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);

      const fakeAxiosPostError = new Error("fakeAxiosPostError");
      // @ts-expect-error
      fakeAxiosPostError.config = {};
      // @ts-expect-error
      fakeAxiosPostError.config.method = "post";

      const spyOnGet = jest.spyOn(axios, "post")
        .mockImplementationOnce(async () => {
          throw fakeAxiosPostError;
        })
        .mockImplementationOnce(async () => {
          throw fakeAxiosPostError;
        })
        .mockImplementationOnce(async () => {
          throw fakeAxiosPostError;
        });

      try {
        await lensPlatformClient.space.createOne({ name: "any" });
      } catch {
        // Do not handle exceptions
      } finally {
        expect(spyOnGet).toBeCalledTimes(1);
      }
    });

    it(("shouldn't retry if error is not AxiosError"), async () => {
      const lensPlatformClient = new LensPlatformClient({
        ...minimumOptions,
      });
      jest.spyOn(axios, "isAxiosError").mockReturnValue(false);

      const fakeAxiosGetError = new Error("fakeAxiosGetError");
      // @ts-expect-error
      fakeAxiosGetError.config = {};
      // @ts-expect-error
      fakeAxiosGetError.config.method = "get";

      const spyOnGet = jest.spyOn(axios, "get")
        .mockImplementation(async () => {
          throw fakeAxiosGetError;
        });

      try {
        await lensPlatformClient.space.getOne({ name: "any" });
      } catch {
        // Do not handle exceptions
      } finally {
        expect(spyOnGet).toBeCalledTimes(1);
      }
    });

    it(("shouldn't retry if there is response (not a Network error)"), async () => {
      const lensPlatformClient = new LensPlatformClient({
        ...minimumOptions,
      });
      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);

      const fakeAxiosGetError = new Error("fakeAxiosGetError");
      // @ts-expect-error
      fakeAxiosGetError.config = {};
      // @ts-expect-error
      fakeAxiosGetError.config.method = "get";
      // @ts-expect-error
      fakeAxiosGetError.response = { status: 503 };

      const spyOnGet = jest.spyOn(axios, "get")
        .mockImplementation(async () => {
          throw fakeAxiosGetError;
        });

      try {
        await lensPlatformClient.space.getOne({ name: "any" });
      } catch {
        // Do not handle exceptions
      } finally {
        expect(spyOnGet).toBeCalledTimes(1);
      }
    });
  });
});

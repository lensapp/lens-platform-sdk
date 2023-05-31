import LensPlatformClient from "./LensPlatformClient";
import axios from "axios";

// A random jwt from https://www.jsonwebtoken.io/
export const accessToken =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImp0aSI6ImI4Y2RmMmRjLTA3ZmUtNDc5Ny1iOWZkLThmYjlmYTMyZGMyZiIsImlhdCI6MTYxODQ4Mjc3OCwiZXhwIjoxNjE4NDg2Mzc4fQ.h9jJveiwYLPDIX3ZIqB-06QH6CLTDVKToSfWJnwRAgg";
export const apiEndpointAddress = "http://api.endpoint";
export const minimumOptions = {
  accessToken, // The access token for apis
  keyCloakAddress: "", // Keycloak address, e.g. "https://keycloak.k8slens.dev"
  keycloakRealm: "", // The realm name, e.g. "lensCloud"
  apiEndpointAddress, // Api endpoint address, e.g. "https://api.k8slens.dev"
};

describe("LensPlatformClient", () => {
  jest.mock("axios");

  // @swc/jest would throw error when compiling this test case.
  it.skip("is a class", () => {
    // @ts-expect-error
    // eslint-disable-next-line new-cap, @typescript-eslint/no-unsafe-return
    expect(() => LensPlatformClient()).toThrow("Cannot call a class as a function");
  });

  it("checks options in constructor", () => {
    // @ts-expect-error
    expect(() => new LensPlatformClient()).toThrow("Options can not be undefined");
    expect(
      () =>
        new LensPlatformClient({
          accessToken: undefined,
          getAccessToken: undefined,
          keyCloakAddress: "",
          keycloakRealm: "",
          apiEndpointAddress: "",
        }),
    ).toThrow("Both accessToken undefined or getAccessToken are undefined");
  });

  it("can `new LensPlatformClient` with minimum (but valid) options", () => {
    expect(() => new LensPlatformClient(minimumOptions)).not.toThrow();
  });

  it(".authHeader", () => {
    const lensPlatformClient = new LensPlatformClient(minimumOptions);

    expect(lensPlatformClient.authHeader).toEqual({
      Authorization: `Bearer ${accessToken}`,
    });
  });

  describe("proxied version of fetch", () => {
    it("adds Authorization header", async () => {
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
        spies.forEach((spy) => {
          expect(spy).toBeCalledWith(apiEndpointAddress, { headers: expectedHeaders });
          spy.mockRestore();
        });
      }
    });

    describe("when unauthenticated", () => {
      it("doesn't add Authorization header", async () => {
        const expectedHeaders = {};
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
            _fetch.get(apiEndpointAddress, {
              unauthenticated: true,
            } as any),
            _fetch.head(apiEndpointAddress, {
              unauthenticated: true,
            } as any),
            _fetch.delete(apiEndpointAddress, {
              unauthenticated: true,
            } as any),
          ]);
        } catch {
          // Do not handle exceptions
        } finally {
          spies.forEach((spy) => {
            expect(spy).toBeCalledWith(apiEndpointAddress, {
              headers: expectedHeaders,
              unauthenticated: true,
            });
            spy.mockRestore();
          });
        }
      });
    });

    it("doesn't add Authorization header if no token", async () => {
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

    it("adds Authorization header with body", async () => {
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
        spies.forEach((spy) => {
          expect(spy).toBeCalledWith(apiEndpointAddress, undefined, { headers: expectedHeaders });
          spy.mockRestore();
        });
      }
    });

    it("merged request options", async () => {
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
        spies.forEach((spy) => {
          expect(spy).toBeCalledWith(apiEndpointAddress, {
            headers: expectedHeaders,
            ...extraOptions,
          });
          spy.mockRestore();
        });
      }
    });

    it("merged request options with body", async () => {
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
        spies.forEach((spy) => {
          expect(spy).toBeCalledWith(apiEndpointAddress, undefined, {
            headers: expectedHeaders,
            ...extraOptions,
          });
          spy.mockRestore();
        });
      }
    });

    it("merged headers", async () => {
      const defaultHeaders = { "X-Consumer-Id": "xx-yy-zz" };
      const extraHeader = { "X-An-Example": "Header" };
      const expectedHeaders = {
        Authorization: `Bearer ${accessToken}`,
        ...extraHeader,
        ...defaultHeaders,
      };
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
        spies.forEach((spy) => {
          expect(spy).toBeCalledWith(apiEndpointAddress, { headers: expectedHeaders });
          spy.mockRestore();
        });
      }
    });

    it("merged headers with body", async () => {
      const defaultHeaders = { "X-Consumer-Id": "xx-yy-zz" };
      const extraHeader = { "X-An-Example": "Header" };
      const expectedHeaders = {
        Authorization: `Bearer ${accessToken}`,
        ...extraHeader,
        ...defaultHeaders,
      };
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
        spies.forEach((spy) => {
          expect(spy).toBeCalledWith(apiEndpointAddress, {}, { headers: expectedHeaders });
          spy.mockRestore();
        });
      }
    });

    it("merged headers and request options at the same time", async () => {
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
        spies.forEach((spy) => {
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

    it("merged headers and request options at the same time with body", async () => {
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
        spies.forEach((spy) => {
          expect(spy).toBeCalledWith(
            apiEndpointAddress,
            { a: 1 },
            {
              headers: {
                ...extraHeader,
                ...{ Authorization: `Bearer ${accessToken}` },
              },
              ...extraOption,
            },
          );
          spy.mockRestore();
        });
      }
    });
  });
});

import LensPlatformClient, { accessTokenNotValidMessage } from "./LensPlatformClient";
import axios from "axios";
import { LensSDKException } from "./exceptions/common.exceptions";

// A random jwt from https://www.jsonwebtoken.io/
export const accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImp0aSI6ImI4Y2RmMmRjLTA3ZmUtNDc5Ny1iOWZkLThmYjlmYTMyZGMyZiIsImlhdCI6MTYxODQ4Mjc3OCwiZXhwIjoxNjE4NDg2Mzc4fQ.h9jJveiwYLPDIX3ZIqB-06QH6CLTDVKToSfWJnwRAgg";
export const apiEndpointAddress = "http://api.endpoint";
export const minimumOptions = {
  accessToken, // The access token for apis
  keyCloakAddress: "", // Keycloak address, e.g. "https://keycloak.k8slens.dev"
  keycloakRealm: "", // The realm name, e.g. "lensCloud"
  apiEndpointAddress, // Api endpoint address, e.g. "https://api.k8slens.dev"
};

describe("LensPlatformClient", () => {
  // @swc/jest would throw error when compiling this test case.
  it.skip("is a class", () => {
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
  });

  describe("access token logics", () => {
    it("should take 'static' accessToken", async () => {
      const accessToken = "a static access token";
      const lensPlatformClient = new LensPlatformClient({
        ...minimumOptions,
        accessToken,
      });

      const spyOnGet = jest.spyOn(axios, "get")
        .mockImplementationOnce(async () => ({ name: "a dummy space" }));

      const spaceName = "any";
      try {
        await lensPlatformClient.space.getOne({ name: spaceName });
      } catch {
        // Do not handle exceptions
      } finally {
        expect(spyOnGet).toBeCalledWith(
          `${apiEndpointAddress}/spaces/${spaceName}`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
        spyOnGet.mockRestore();
      }
    });

    it("should resolve getAccessToken()", async () => {
      const accessToken = "some access token";
      const getAccessToken = jest.fn(async () => Promise.resolve(accessToken));
      const lensPlatformClient = new LensPlatformClient({
        ...minimumOptions,
        getAccessToken,
      });

      const spyOnGet = jest.spyOn(axios, "get")
        .mockImplementationOnce(async () => ({ name: "a dummy space" }));

      const spaceName = "any";
      try {
        await lensPlatformClient.space.getOne({ name: "any" });
      } catch {
        // Do not handle exceptions
      } finally {
        expect(spyOnGet).toBeCalledWith(
          `${apiEndpointAddress}/spaces/${spaceName}`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
        spyOnGet.mockRestore();
      }
    });

    it("what resolved from getAccessToken has higher priority then the 'static' version", async () => {
      const staticAccessToken = "static access token";
      const dynamicAccessToken = "dynamic access token";
      const getAccessToken = jest.fn(async () => Promise.resolve(dynamicAccessToken));
      const lensPlatformClient = new LensPlatformClient({
        ...minimumOptions,
        accessToken: staticAccessToken,
        getAccessToken,
      });

      const spyOnGet = jest.spyOn(axios, "get")
        .mockImplementationOnce(async () => ({ name: "a dummy space" }));

      const spaceName = "any";
      try {
        await lensPlatformClient.space.getOne({ name: "any" });
      } catch {
        // Do not handle exceptions
      } finally {
        expect(spyOnGet).toBeCalledWith(
          `${apiEndpointAddress}/spaces/${spaceName}`,
          { headers: { Authorization: `Bearer ${dynamicAccessToken}` } },
        );
        spyOnGet.mockRestore();
      }
    });

    it("if getAccessToken returns '' (empty string) || undefined || null, dont make requests", async () => {
      ["", undefined, null].forEach(async accessToken => {
        const getAccessToken = jest.fn(async () => Promise.resolve(accessToken));
        const lensPlatformClient = new LensPlatformClient({
          ...minimumOptions,
          accessToken: "some valid access token",
          // @ts-expect-error
          getAccessToken,
        });

        const spyOnGet = jest.spyOn(axios, "get")
          .mockImplementationOnce(async () => ({ name: "a dummy space" }));

        try {
          await lensPlatformClient.space.getOne({ name: "any" });
        // eslint-disable-next-line @typescript-eslint/no-implicit-any-catch
        } catch (error: any) {
          expect(error).toBeInstanceOf(LensSDKException);
          expect(error.message).toBe(accessTokenNotValidMessage);
        } finally {
          expect(spyOnGet).toBeCalledTimes(0);
          spyOnGet.mockRestore();
        }
      });
    });

    it("if both accessToken/getAccessToken returns '' (empty string) || undefined || null, dont make requests", async () => {
      ["", undefined, null].forEach(async accessToken => {
        const getAccessToken = jest.fn(async () => Promise.resolve(accessToken));
        const lensPlatformClient = new LensPlatformClient({
          ...minimumOptions,
          // @ts-expect-error
          accessToken,
          // @ts-expect-error
          getAccessToken,
        });

        const spyOnGet = jest.spyOn(axios, "get")
          .mockImplementationOnce(async () => ({ name: "a dummy space" }));

        try {
          await lensPlatformClient.space.getOne({ name: "any" });
        // eslint-disable-next-line @typescript-eslint/no-implicit-any-catch
        } catch (error: any) {
          expect(error).toBeInstanceOf(LensSDKException);
          expect(error.message).toBe(accessTokenNotValidMessage);
        } finally {
          expect(spyOnGet).toBeCalledTimes(0);
          spyOnGet.mockRestore();
        }
      });
    });
  });
});

import LensPlatformClient from "./LensPlatformClient";
import got from "got";

// A randome jwt from https://www.jsonwebtoken.io/
export const accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImp0aSI6ImI4Y2RmMmRjLTA3ZmUtNDc5Ny1iOWZkLThmYjlmYTMyZGMyZiIsImlhdCI6MTYxODQ4Mjc3OCwiZXhwIjoxNjE4NDg2Mzc4fQ.h9jJveiwYLPDIX3ZIqB-06QH6CLTDVKToSfWJnwRAgg";
export const apiEndpointAddress = "http://api.endpoint";
export const minimumOptions = {
  accessToken, // The access token for apis
  keyCloakAddress: "", // Keycloak address, e.g. "https://keycloak.k8slens.dev"
  keycloakRealm: "", // The realm name, e.g. "lensCloud"
  apiEndpointAddress // Api endpoint address, e.g. "https://api.k8slens.dev"
};

describe("LensPlatformClient", () => {
  jest.mock("got");

  it("is a class", () => {
    // @ts-expect-error
    // eslint-disable-next-line new-cap
    expect(() => LensPlatformClient()).toThrow("Cannot call a class as a function");
  });

  it("checks options in constructor", () => {
    // @ts-expect-error
    expect(() => new LensPlatformClient()).toThrow("Options can not be undefined");
    // @ts-expect-error
    expect(() => new LensPlatformClient({
      accessToken: undefined,
      getAccessToken: undefined
    })).toThrow("Both accessToken undefined or getAccessToken are undefined");
  });

  it("can `new LensPlatformClient` with minimum (but valid) options", () => {
    expect(
      () => new LensPlatformClient(minimumOptions)
    ).not.toThrow();
  });

  it(".decodedAccessToken", () => {
    const lensPlatformClient = new LensPlatformClient(minimumOptions);
    expect(lensPlatformClient.decodedAccessToken).toEqual({ admin: true, exp: 1618486378, iat: 1618482778, jti: "b8cdf2dc-07fe-4797-b9fd-8fb9fa32dc2f", name: "John Doe", sub: "1234567890" });
  });

  it(".authHeader", () => {
    const lensPlatformClient = new LensPlatformClient(minimumOptions);
    expect(lensPlatformClient.authHeader).toEqual({
      Authorization: `Bearer ${accessToken}`
    });
  });

  it(".currentUserId", () => {
    const lensPlatformClient = new LensPlatformClient(minimumOptions);

    expect(lensPlatformClient.currentUserId).toEqual("1234567890");
  });

  describe("proxied version of got.*", () => {
    it(("adds Authorization header"), async () => {
      const expectedHeaders = { Authorization: `Bearer ${accessToken}` };
      const lensPlatformClient = new LensPlatformClient({
        ...minimumOptions,
        ...{
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          exceptionHandler: () => { }
        }
      });

      const spies = [
        jest.spyOn(got, "get"),
        jest.spyOn(got, "post"),
        jest.spyOn(got, "put"),
        jest.spyOn(got, "patch"),
        jest.spyOn(got, "head"),
        jest.spyOn(got, "delete")
      ];

      const _got = lensPlatformClient.got;
      await Promise.all([
        _got.get(apiEndpointAddress),
        _got.post(apiEndpointAddress),
        _got.put(apiEndpointAddress),
        _got.patch(apiEndpointAddress),
        _got.head(apiEndpointAddress),
        _got.delete(apiEndpointAddress)
      ]);

      spies.forEach(spy => {
        expect(spy).toBeCalledWith(apiEndpointAddress, { headers: expectedHeaders });
        spy.mockRestore();
      });
    });

    it(("merged request options"), async () => {
      const extraOptions = { json: { an: "example_extra_option" } };
      const expectedHeaders = { Authorization: `Bearer ${accessToken}` };
      const lensPlatformClient = new LensPlatformClient({
        ...minimumOptions,
        ...{
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          exceptionHandler: () => { }
        }
      });

      const spies = [
        jest.spyOn(got, "get"),
        jest.spyOn(got, "post"),
        jest.spyOn(got, "put"),
        jest.spyOn(got, "patch"),
        jest.spyOn(got, "head"),
        jest.spyOn(got, "delete")
      ];

      const _got = lensPlatformClient.got;
      await Promise.all([
        _got.get(apiEndpointAddress, extraOptions),
        _got.post(apiEndpointAddress, extraOptions),
        _got.put(apiEndpointAddress, extraOptions),
        _got.patch(apiEndpointAddress, extraOptions),
        _got.head(apiEndpointAddress, extraOptions),
        _got.delete(apiEndpointAddress, extraOptions)
      ]);

      spies.forEach(spy => {
        expect(spy).toBeCalledWith(apiEndpointAddress, { headers: expectedHeaders, ...extraOptions });
        spy.mockRestore();
      });
    });

    it(("merged headers"), async () => {
      const defaultHeaders = { "X-Consumer-Id": "xx-yy-zz" };
      const extraHeader = { "X-An-Example": "Header" };
      const expectedHeaders = { Authorization: `Bearer ${accessToken}`, ...extraHeader, ...defaultHeaders };
      const lensPlatformClient = new LensPlatformClient({
        ...minimumOptions,
        ...{
          defaultHeaders: { "X-Consumer-Id": "xx-yy-zz" },
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          exceptionHandler: () => { }
        }
      });

      const spies = [
        jest.spyOn(got, "get"),
        jest.spyOn(got, "post"),
        jest.spyOn(got, "put"),
        jest.spyOn(got, "patch"),
        jest.spyOn(got, "head"),
        jest.spyOn(got, "delete")
      ];

      const _got = lensPlatformClient.got;
      await Promise.all([
        _got.get(apiEndpointAddress, { headers: extraHeader }),
        _got.post(apiEndpointAddress, { headers: extraHeader }),
        _got.put(apiEndpointAddress, { headers: extraHeader }),
        _got.patch(apiEndpointAddress, { headers: extraHeader }),
        _got.head(apiEndpointAddress, { headers: extraHeader }),
        _got.delete(apiEndpointAddress, { headers: extraHeader })
      ]);

      spies.forEach(spy => {
        expect(spy).toBeCalledWith(apiEndpointAddress, { headers: expectedHeaders });
        spy.mockRestore();
      });
    });

    it(("merged headers and request options at the same time"), async () => {
      const extraHeader = { "X-An-Example": "Header" };
      const extraOption = { json: { an: "example_extra_option" } };
      const lensPlatformClient = new LensPlatformClient({
        ...minimumOptions,
        ...{
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          exceptionHandler: () => { }
        }
      });

      const spies = [
        jest.spyOn(got, "get"),
        jest.spyOn(got, "post"),
        jest.spyOn(got, "put"),
        jest.spyOn(got, "patch"),
        jest.spyOn(got, "head"),
        jest.spyOn(got, "delete")
      ];

      const _got = lensPlatformClient.got;
      await Promise.all([
        _got.get(apiEndpointAddress, { ...extraOption, headers: extraHeader }),
        _got.post(apiEndpointAddress, { ...extraOption, headers: extraHeader }),
        _got.put(apiEndpointAddress, { ...extraOption, headers: extraHeader }),
        _got.patch(apiEndpointAddress, { ...extraOption, headers: extraHeader }),
        _got.head(apiEndpointAddress, { ...extraOption, headers: extraHeader }),
        _got.delete(apiEndpointAddress, { ...extraOption, headers: extraHeader })
      ]);

      spies.forEach(spy => {
        expect(spy).toBeCalledWith(apiEndpointAddress, {
          headers: {
            ...extraHeader,
            ...{ Authorization: `Bearer ${accessToken}` }
          },
          ...extraOption
        });
        spy.mockRestore();
      });
    });
  });
});

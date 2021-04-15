import LensPlatformClient from "./LensPlatformClient";
import got from "got";

jest.mock("got");

describe("LensPlatformClient", () => {
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

  const accessToken = "a_jwt_token";
  const minimumOptions = {
    accessToken, // The access token for apis
    keyCloakAddress: "", // Keycloak address, e.g. "https://keycloak.k8slens.dev"
    keycloakRealm: "", // The realm name, e.g. "lensCloud"
    apiEndpointAddress: "" // Api endpoint address, e.g. "https://api.k8slens.dev"
  };

  it("can `new LensPlatformClient` with minimum (but valid) options", () => {
    expect(
      () => new LensPlatformClient(minimumOptions)
    ).not.toThrow();
  });

  it(".decodedAccessToken", () => {
    const lensPlatformClient = new LensPlatformClient({
      ...minimumOptions,
      ...{
        // A randome jwt from https://www.jsonwebtoken.io/
        accessToken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImp0aSI6ImI4Y2RmMmRjLTA3ZmUtNDc5Ny1iOWZkLThmYjlmYTMyZGMyZiIsImlhdCI6MTYxODQ4Mjc3OCwiZXhwIjoxNjE4NDg2Mzc4fQ.h9jJveiwYLPDIX3ZIqB-06QH6CLTDVKToSfWJnwRAgg"
      }
    });
    expect(lensPlatformClient.decodedAccessToken).toEqual({ admin: true, exp: 1618486378, iat: 1618482778, jti: "b8cdf2dc-07fe-4797-b9fd-8fb9fa32dc2f", name: "John Doe", sub: "1234567890" });
  });

  it(".authHeader", () => {
    const lensPlatformClient = new LensPlatformClient(minimumOptions);
    expect(lensPlatformClient.authHeader).toEqual({
      Authorization: `Bearer ${accessToken}`
    });
  });

  describe("proxied version of got.*", () => {
    it(("adds Authorization header"), async () => {
      const url = "http://any.url";
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
        _got.get(url),
        _got.post(url),
        _got.put(url),
        _got.patch(url),
        _got.head(url),
        _got.delete(url)
      ]);

      spies.forEach(spy => {
        expect(spy).toBeCalledWith(url, { headers: expectedHeaders });
        spy.mockRestore();
      });
    });

    it(("merged request options"), async () => {
      const url = "http://any.url";
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
        _got.get(url, extraOptions),
        _got.post(url, extraOptions),
        _got.put(url, extraOptions),
        _got.patch(url, extraOptions),
        _got.head(url, extraOptions),
        _got.delete(url, extraOptions)
      ]);

      spies.forEach(spy => {
        expect(spy).toBeCalledWith(url, { headers: expectedHeaders, ...extraOptions });
        spy.mockRestore();
      });
    });

    it(("merged headers"), async () => {
      const url = "http://any.url";
      const extraHeader = { "X-An-Example": "Header" };
      const expectedHeaders = { Authorization: `Bearer ${accessToken}`, ...extraHeader };
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
        _got.get(url, { headers: extraHeader }),
        _got.post(url, { headers: extraHeader }),
        _got.put(url, { headers: extraHeader }),
        _got.patch(url, { headers: extraHeader }),
        _got.head(url, { headers: extraHeader }),
        _got.delete(url, { headers: extraHeader })
      ]);

      spies.forEach(spy => {
        expect(spy).toBeCalledWith(url, { headers: expectedHeaders });
        spy.mockRestore();
      });
    });

    it(("merged headers and request options at the same time"), async () => {
      const url = "http://any.url";
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
        _got.get(url, { ...extraOption, headers: extraHeader }),
        _got.post(url, { ...extraOption, headers: extraHeader }),
        _got.put(url, { ...extraOption, headers: extraHeader }),
        _got.patch(url, { ...extraOption, headers: extraHeader }),
        _got.head(url, { ...extraOption, headers: extraHeader }),
        _got.delete(url, { ...extraOption, headers: extraHeader })
      ]);

      spies.forEach(spy => {
        expect(spy).toBeCalledWith(url, {
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

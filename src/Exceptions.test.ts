import nock from "nock";
import LensPlatformClient from "./LensPlatformClient";
import { minimumOptions as options, apiEndpointAddress } from "./helpers/testConfig";
import { NotFoundException, LensSDKException } from "./exceptions";

export const plaform404response = {
  name: "HTTPError",
  message: "Response code 404 (Not Found)",
};

export const plaform500response = {
  name: "HTTPError",
  message: "Response code 500 (Internal Server Error)",
};

describe(".users.*", () => {
  const invalidUserName = "idonotexist";
  const brokenUserName = "ibreakthings";
  const username = "randomuser";
  const userResponse = { username };
  const lensPlatformClient = new LensPlatformClient(options);

  beforeAll(() => {
    nock(apiEndpointAddress).get(`/users/${invalidUserName}`).reply(404, plaform404response);
    nock(apiEndpointAddress).get(`/users/${brokenUserName}`).reply(500, plaform500response).persist();
    nock(apiEndpointAddress).get(`/users/${username}`).reply(200, userResponse);
  });

  it("doesn't break functionality", async () => {
    const result = await lensPlatformClient.user.getOne({ username });

    expect(result).toStrictEqual(userResponse);
  });

  it("throws proper expected exception", async () => {
    const expectedException = new NotFoundException(`User ${invalidUserName} not found`);

    try {
      await lensPlatformClient.user.getOne({ username: invalidUserName });
    } catch (e: unknown) {
      // Check exact exception
      expect(e).toStrictEqual(expectedException);
      // Check reflected type
      expect(e).toBeInstanceOf(NotFoundException);
      expect(e).toBeInstanceOf(LensSDKException);
    }
  });

  it("throws proper unexpected exception", async () => {
    try {
      await lensPlatformClient.user.getOne({ username: brokenUserName });
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(LensSDKException);

      if (e instanceof LensSDKException) {
        expect(e.errorCode).toEqual(500);
        expect(e.message).toMatch(/Unexpected exception \[Lens Platform SDK\]/);
      }
    }
  });
});

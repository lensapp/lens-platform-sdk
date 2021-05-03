import nock from "nock";
import LensPlatformClient from "./LensPlatformClient";
import { minimumOptions as options, apiEndpointAddress } from "./LensPlatformClient.test";
import { NotFoundException, LensSDKException } from "./exceptions";

export const plaform404response = {
  name: "HTTPError",
  message: "Response code 404 (Not Found)"
};

describe(".users.*", () => {
  const invalidUserName = "idonotexist";
  nock(apiEndpointAddress).get(`/users/${invalidUserName}`).reply(404, plaform404response);
  nock(apiEndpointAddress).get("/users/test").reply(200, { });

  const lensPlatformClient = new LensPlatformClient(options);

  it("fetches a user", async () => {
    const result = await lensPlatformClient.user.getOne({ username: "test" });

    expect(result).toStrictEqual({});
  });

  it("throws proper 404 exception", async () => {
    const expectedException = new NotFoundException(`User ${invalidUserName} not found`);

    try {
      const result = await lensPlatformClient.user.getOne({ username: invalidUserName });
    } catch (e: unknown) {
      // Check exact exception
      expect(e).toStrictEqual(expectedException);
      // Check reflected type
      expect(e).toBeInstanceOf(LensSDKException);
    }
  });
});

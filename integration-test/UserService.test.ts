import { LensPlatformClient } from "../";

const user = {
  username: process.env.STAGING_USERNAME,
  password: process.env.STAGING_PASSWORD
};

if (!user.username || !user.password) {
  throw new Error("STAGING_USERNAME or STAGING_PASSWORD environmental variable not set");
}

describe("UserService", () => {
  describe("getOne", () => {
    it("can get itself", () => {
      //
    });
  });
});

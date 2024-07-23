import { ForbiddenException } from "../src";
import { config } from "./configuration";
import { testPlatformFactory } from "./utils";
import type { TestPlatform } from "./utils";

jest.setTimeout(10000);

describe("DemoClusterService", () => {
  const [userBob] = config.users;
  let bobPlatform: TestPlatform;

  beforeAll(async () => {
    bobPlatform = await testPlatformFactory(userBob.username, userBob.password);
  });

  describe("getConfig", () => {
    it("doesn't return democluster config for old users", async () => {
      return expect(bobPlatform.client.demoCluster.getConfig()).rejects.toThrowError(
        ForbiddenException,
      );
    });
  });
});

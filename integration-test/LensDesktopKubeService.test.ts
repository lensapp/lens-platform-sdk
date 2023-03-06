import { config } from "./configuration";
import { testPlatformFactory } from "./utils";
import type { TestPlatform } from "./utils";

jest.setTimeout(10000);

describe("LensDesktopKubeService", () => {
  const [userBob] = config.users;
  let bobPlatform: TestPlatform;

  beforeAll(async () => {
    bobPlatform = await testPlatformFactory(userBob.username, userBob.password);
  });

  describe("getK0sVersions", () => {
    it("returns versions", async () => {
      const versions = await bobPlatform.client.lensDesktopKube.getK0sVersions();

      expect(versions.length).toBeGreaterThan(1);
    });
  });
});

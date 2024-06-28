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
    it("returns kubeconfig file", async () => {
      const config = await bobPlatform.client.demoCluster.getConfig();

      expect(config.startsWith("apiVersion: v1")).toBeTruthy();
      expect(typeof config).toBe("string");
    });
  });
});

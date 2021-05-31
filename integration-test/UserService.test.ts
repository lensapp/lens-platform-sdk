import { config } from "./configuration";
import { testPlatformClientFactory } from "./utils";
import type { TestPlatformClient } from "./utils";
import { BadRequestException, ForbiddenException, LensSDKException, NotFoundException, UnauthorizedException } from "../src/exceptions";

describe("UserService", () => {
  const mainUser = config.users[0];
  let testPlatform: TestPlatformClient;

  beforeAll(async () => {
    testPlatform = await testPlatformClientFactory(mainUser.username, mainUser.password);
  });

  beforeEach(() => {
    testPlatform.fakeToken = undefined;
  });

  describe("getOne", () => {
    it("rejects requests with invalid tokens", async () => {
      testPlatform.fakeToken = "fake token";

      return expect(testPlatform.client.user.getOne({ username: mainUser.username }))
        .rejects.toThrowError(UnauthorizedException);
    });

    it("can get itself", async () => {
      const user = await testPlatform.client.user.getOne({ username: mainUser.username });

      expect(user.username).toEqual(user.username);
    });

    it("throws NotFoundException if user is missing", async () => {
      const username = "abcdef-12345-missing-" + String(Math.random() * 1000000000);

      return expect(testPlatform.client.user.getOne({ username }))
        .rejects.toThrowError(NotFoundException);
    });
  });

  describe("updateOne", () => {
    it("rejects requests with invalid tokens", async () => {
      testPlatform.fakeToken = "fake token";

      return expect(testPlatform.client.user.updateOne(mainUser.username, {}))
        .rejects.toThrowError(UnauthorizedException);
    });

    it("can update itself", async () => {
      const user = await testPlatform.client.user.updateOne(mainUser.username, {});
      expect(user.username).toEqual(mainUser.username);
    });

    it("throws ForbiddenException when trying to modify unrelated users", async () => {
      const username = "abcdef-12345-missing-" + String(Math.random() * 1000000000);

      return expect(testPlatform.client.user.updateOne(username, {}))
        .rejects.toThrowError(ForbiddenException);
    });
  });

  describe("getMany", () => {
    it("rejects requests with invalid tokens", async () => {
      testPlatform.fakeToken = "fake token";

      return expect(testPlatform.client.user.getMany())
        .rejects.toThrowError(UnauthorizedException);
    });

    it("can get users", async () => {
      const users = await testPlatform.client.user.getMany(`filter=email||$eq||${mainUser.username}@mirantis.com`);
      expect(users.length).toEqual(0);
    });

    it("rejects bad requests", async () =>
      expect(
        testPlatform.client.user.getMany()
      ).rejects.toThrowError(BadRequestException)
    );
  });

  describe("getSelf", () => {
    it("rejects requiests with invalid tokens", async () => {
      testPlatform.fakeToken = "fake token";

      return expect(testPlatform.client.user.getSelf())
        .rejects.toThrow();
    });

    it("can get self", async () => {
      const user = await testPlatform.client.user.getSelf();
      expect(user.username).toEqual(mainUser.username);
    });
  });
});

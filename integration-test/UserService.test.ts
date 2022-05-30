import { config } from "./configuration";
import { testPlatformFactory, rng } from "./utils";
import type { TestPlatform } from "./utils";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
  UsernameAlreadyExistsException,
  ConflictException,
} from "../src/exceptions";
import { LicenseType } from "../src/types/types";

describe("UserService", () => {
  const [userBob, userAlice] = config.users;
  let bobPlatform: TestPlatform;
  let alicePlatform: TestPlatform;

  beforeAll(async () => {
    bobPlatform = await testPlatformFactory(userBob.username, userBob.password);
    alicePlatform = await testPlatformFactory(userAlice.username, userAlice.password);
  });

  beforeEach(() => {
    bobPlatform.fakeToken = undefined;
    alicePlatform.fakeToken = undefined;
  });

  describe("getOne", () => {
    it("rejects requests with invalid tokens", async () => {
      bobPlatform.fakeToken = "fake token";

      return expect(bobPlatform.client.user.getOne({ username: userBob.username }))
        .rejects.toThrowError(UnauthorizedException);
    });

    it("can get itself", async () => {
      const user = await bobPlatform.client.user.getOne({ username: userBob.username });

      expect(user.username).toEqual(user.username);
    });

    it("throws NotFoundException if user is missing", async () => {
      const username = "abcdef-12345-missing-" + rng();

      return expect(bobPlatform.client.user.getOne({ username }))
        .rejects.toThrowError(NotFoundException);
    });
  });

  describe("updateOne", () => {
    it("rejects requests with invalid tokens", async () => {
      bobPlatform.fakeToken = "fake token";

      return expect(bobPlatform.client.user.updateOne(userBob.username, {}))
        .rejects.toThrowError(UnauthorizedException);
    });

    it("can update itself", async () => {
      const user = await bobPlatform.client.user.updateOne(userBob.username, {});
      expect(user.username).toEqual(userBob.username);
    });

    it("throws ForbiddenException when trying to modify unrelated users", async () => {
      const username = "abcdef-12345-missing-" + rng();

      return expect(bobPlatform.client.user.updateOne(username, {}))
        .rejects.toThrowError(ForbiddenException);
    });

    it("throws UsernameAlreadyExistsException when trying to change username to existing user's", async () => expect(bobPlatform.client.user.updateOne(userBob.username, {
      username: userAlice.username
    })).rejects.toThrowError(UsernameAlreadyExistsException));
  });

  describe("getMany", () => {
    it("rejects requests with invalid tokens", async () => {
      bobPlatform.fakeToken = "fake token";

      return expect(bobPlatform.client.user.getMany())
        .rejects.toThrowError(UnauthorizedException);
    });

    it("can get 0 users", async () => {
      const users = await bobPlatform.client.user.getMany("filter=username||$eq||missingfoobarusername");
      expect(users.length).toEqual(0);
    });

    it("rejects bad requests", async () =>
      expect(
        bobPlatform.client.user.getMany()
      ).rejects.toThrowError(BadRequestException)
    );
  });

  describe("getSelf", () => {
    it("rejects requests with invalid tokens", async () => {
      bobPlatform.fakeToken = "fake token";

      return expect(bobPlatform.client.user.getSelf())
        .rejects.toThrow();
    });

    it("can get self", async () => {
      const user = await bobPlatform.client.user.getSelf();
      expect(user.username).toEqual(userBob.username);
    });
  });

  describe("activateSubscription", () => {
    beforeEach(async () => {
      try {
        // Make sure the subscription isn't yet active
        const license = {
          subscriptionId: userBob.subscriptionId!,
        };
        await bobPlatform.client.user.deactivateSubscription({ username: userBob.username, license })
      } catch (_: unknown) {}
    });

    it("rejects requests with invalid username", async () => {
      const license = {
        subscriptionId: userBob.subscriptionId!,
        type: "pro" as LicenseType,
      };
      return expect(bobPlatform.client.user.activateSubscription({ username: "FAKE_USER", license }))
        .rejects.toThrowError(ForbiddenException);
    });

    it("rejects requests with invalid subscriptionId", async () => {
      const license = {
        subscriptionId: "FAKE_SUBSCRIPTION",
        type: "pro" as LicenseType,
      };

      return expect(bobPlatform.client.user.activateSubscription({ username: userBob.username, license }))
        .rejects.toThrowError(NotFoundException);
    });

    it("rejects requests for already existing subscriptions", async () => {
      const license = {
        subscriptionId: userBob.subscriptionId!,
        type: "pro" as LicenseType,
      };

      await bobPlatform.client.user.activateSubscription({ username: userBob.username, license });
      return expect(bobPlatform.client.user.activateSubscription({ username: userBob.username, license }))
        .rejects.toThrowError(ConflictException);
    });

    it("returns the activated license", async () => {
      const license = {
        subscriptionId: userBob.subscriptionId!,
        type: "pro" as LicenseType,
      };

      const result = await bobPlatform.client.user.activateSubscription({ username: userBob.username, license });
      expect(result).toEqual(license);
    });
  });

  describe("deactivateSubscription", () => {
    beforeEach(async () => {
      // Make sure the subscription is active
      try {
        const license = {
          subscriptionId: userBob.subscriptionId!,
          type: "pro" as LicenseType,
        };
        await bobPlatform.client.user.deactivateSubscription({ username: userBob.username, license });
        await bobPlatform.client.user.activateSubscription({ username: userBob.username, license });
      } catch (_: unknown) {}
    });

    it("rejects requests with invalid username", async () => {
      bobPlatform.fakeToken = undefined;

      return expect(bobPlatform.client.user.deactivateSubscription({ username: "FAKE_USER", license: { subscriptionId: userBob.subscriptionId! } }))
        .rejects.toThrowError(ForbiddenException);
    });
    it("rejects requests with invalid subscriptionId", async () =>
      expect(bobPlatform.client.user.deactivateSubscription({ username: userBob.username, license: { subscriptionId: "FAKE_SUBSCRIPTION" } }))
        .rejects.toThrowError(NotFoundException)
    );
    it("returns undefined after subscription deactivation", async () => {
      // Active the license
      try {
        const license = {
          subscriptionId: userBob.subscriptionId!,
          type: "pro" as LicenseType,
        };
        await bobPlatform.client.user.deactivateSubscription({ username: userBob.username, license });
        await bobPlatform.client.user.activateSubscription({ username: userBob.username, license });
      } catch (_: unknown) {}

      return expect(bobPlatform.client.user.deactivateSubscription({ username: userBob.username, license: { subscriptionId: userBob.subscriptionId! } }))
        .resolves.toBeUndefined();
    });
  });
});

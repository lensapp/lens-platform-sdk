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
import { License } from "../src/types/types";

jest.setTimeout(10000);

describe("UserService", () => {
  const [userBob, userAlice, userSteve, userAdam, userErin] = config.users;
  let bobPlatform: TestPlatform;
  let alicePlatform: TestPlatform;
  let stevePlatform: TestPlatform;
  let adamPlatform: TestPlatform;
  let erinPlatform: TestPlatform;

  beforeAll(async () => {
    bobPlatform = await testPlatformFactory(userBob.username, userBob.password);
    alicePlatform = await testPlatformFactory(userAlice.username, userAlice.password);
    stevePlatform = await testPlatformFactory(userSteve.username, userSteve.password);
    adamPlatform = await testPlatformFactory(userAdam.username, userAdam.password);
    erinPlatform = await testPlatformFactory(userErin.username, userErin.password);
  });

  beforeEach(() => {
    bobPlatform.fakeToken = undefined;
    alicePlatform.fakeToken = undefined;
    stevePlatform.fakeToken = undefined;
    adamPlatform.fakeToken = undefined;
    erinPlatform.fakeToken = undefined;
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
      username: userAlice.username,
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
        bobPlatform.client.user.getMany(),
      ).rejects.toThrowError(BadRequestException),
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

  describe("License", () => {
    describe("activateSubscription", () => {
      beforeEach(async () => {
        try {
          // Make sure the subscription isn't yet active
          const license = {
            subscriptionId: userSteve.subscriptionId!,
          };
          await stevePlatform.client.user.deactivateSubscription({ username: userSteve.username, license });
        } catch (_: unknown) {}
      });

      it.skip("rejects requests with invalid username", async () => {
        const license: License = {
          subscriptionId: userSteve.subscriptionId!,
          type: "pro",
        };
        return expect(stevePlatform.client.user.activateSubscription({ username: "FAKE_USER", license }))
          .rejects.toThrowError(ForbiddenException);
      });

      it.skip("rejects requests with invalid subscriptionId", async () => {
        const license: License = {
          subscriptionId: "FAKE_SUBSCRIPTION",
          type: "pro",
        };

        return expect(stevePlatform.client.user.activateSubscription({ username: userSteve.username, license }))
          .rejects.toThrowError(NotFoundException);
      });

      it.skip("rejects requests for already existing subscriptions", async () => {
        const license: License = {
          subscriptionId: userSteve.subscriptionId!,
          type: "pro",
        };

        await stevePlatform.client.user.activateSubscription({ username: userSteve.username, license });
        return expect(stevePlatform.client.user.activateSubscription({ username: userSteve.username, license }))
          .rejects.toThrowError(ConflictException);
      });

      it("returns the activated license", async () => {
        const license: License = {
          subscriptionId: userSteve.subscriptionId!,
          type: "pro",
        };

        const result = await stevePlatform.client.user.activateSubscription({ username: userSteve.username, license });

        expect(result).toEqual(license);
      });
    });

    describe("deactivateSubscription", () => {
      beforeEach(async () => {
        // Make sure the subscription is active
        try {
          const license: License = {
            subscriptionId: userAdam.subscriptionId!,
            type: "pro",
          };
          await adamPlatform.client.user.activateSubscription({ username: userAdam.username, license });
        } catch (_: unknown) {}
      });

      afterEach(async () => {
        // Make sure the subscription is deactivated
        try {
          const license: License = {
            subscriptionId: userAdam.subscriptionId!,
            type: "pro",
          };
          await adamPlatform.client.user.deactivateSubscription({ username: userAdam.username, license });
        } catch (_: unknown) {}
      });

      it.skip("rejects requests with invalid username", async () => {
        adamPlatform.fakeToken = undefined;

        return expect(adamPlatform.client.user.deactivateSubscription({ username: "FAKE_USER", license: { subscriptionId: userAdam.subscriptionId! } }))
          .rejects.toThrowError(ForbiddenException);
      });

      it.skip("rejects requests with invalid subscriptionId", async () =>
        expect(adamPlatform.client.user.deactivateSubscription({ username: userAdam.username, license: { subscriptionId: "FAKE_SUBSCRIPTION" } }))
          .rejects.toThrowError(NotFoundException),
      );

      it("returns undefined after subscription deactivation", async () =>
        expect(adamPlatform.client.user.deactivateSubscription({ username: userAdam.username, license: { subscriptionId: userAdam.subscriptionId! } }))
          .resolves.toBeUndefined(),
      );
    });

    describe("Get user subscriptions", () => {
      it("Should get list of subscriptions", async () => {
        const subscriptions = [{
          currentPeriodEndsAt: "2023-07-01T08:01:22.000Z",
          currentPeriodStartedAt: "2022-07-01T08:01:22.000Z",
          id: "6327929c2cfb8762b99eec44ddb3c3c4",
          planCode: "pro-yearly",
          planName: "Pro",
          trialEndsAt: null,
          trialStartedAt: null,
          companyName: "sdgfdgdfg",
        },
        {
          currentPeriodEndsAt: "2022-07-24T12:15:15.000Z",
          currentPeriodStartedAt: "2022-06-24T12:15:15.000Z",
          id: "6264c96770f423f8980c7d45569dc21a",
          planCode: "pro-monthly",
          planName: "Pro",
          trialEndsAt: null,
          trialStartedAt: null,
          companyName: "sdgfdgdfg",
        }];
        const userSubscriptions = await bobPlatform.client.user.getUserSubscriptions(userBob.username);
        expect(userSubscriptions).toEqual(subscriptions);
      });
    });

    describe("Get user subscription", () => {
      it("Should get subscription", async () => {
        const subscription = {
          currentPeriodEndsAt: "2023-07-01T08:01:22.000Z",
          currentPeriodStartedAt: "2022-07-01T08:01:22.000Z",
          id: "6327929c2cfb8762b99eec44ddb3c3c4",
          planCode: "pro-yearly",
          planName: "Pro",
          trialEndsAt: null,
          trialStartedAt: null,
          companyName: "sdgfdgdfg",
        };
        const userSubscription = await bobPlatform.client.user.getUserSubscription(userBob.username, subscription.id);
        expect(userSubscription).toEqual(subscription);
      });
    });
  });

  describe("getBillingPageToken", () => {
    it("rejects requests with invalid username", async () =>
      expect(erinPlatform.client.user.getBillingPageToken("FAKE_USER"))
        .rejects.toThrowError(ForbiddenException),
    );
    it("returns the billing page token", async () => {
      const token = await erinPlatform.client.user.getBillingPageToken(userErin.username);
      expect(token).toHaveProperty("hostedLoginToken");
      expect(typeof token.hostedLoginToken).toBe("string");
    });
  });

  describe("getBillingInfo", () => {
    it("rejects requests with invalid username", async () =>
      expect(bobPlatform.client.user.getUserBillingInformation("FAKE_USER"))
        .rejects.toThrowError(ForbiddenException),
    );

    it("returns the billing information", async () => {
      const billingInfo = {
        lastName: "sdfsdf",
        firstName: "sdfsdf",
        company: null,
        address: {
          street1: "dfgdfgdfg",
          street2: "8",
          city: "dfgdfg",
          region: "none",
          postalCode: "4444",
          country: "DE",
          phone: "fdgg",
        },
        paymentMethod: {
          cardType: "Visa",
          firstSix: "411111",
          expMonth: 12,
          expYear: 2023,
          lastTwo: null,
        },
      };
      const billingInformation = await bobPlatform.client.user.getUserBillingInformation(userBob.username);
      expect(billingInformation).toEqual(billingInfo);
    });
  });
});

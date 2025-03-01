import { config } from "./configuration";
import { testPlatformFactory, rng } from "./utils";
import type { TestPlatform } from "./utils";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
  UsernameAlreadyExistsException,
} from "../src/exceptions";
import { testAvatar } from "./avatar";

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

      return expect(
        bobPlatform.client.user.getOne({ username: userBob.username }),
      ).rejects.toThrowError(UnauthorizedException);
    });

    it("can get itself", async () => {
      const user = await bobPlatform.client.user.getOne({ username: userBob.username });

      expect(user.username).toEqual(user.username);
    });

    it("throws NotFoundException if user is missing", async () => {
      const username = `abcdef-12345-missing-${rng()}`;

      return expect(bobPlatform.client.user.getOne({ username })).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe("getAvatar", () => {
    it("rejects requests with invalid tokens", async () => {
      bobPlatform.fakeToken = "fake token";

      return expect(bobPlatform.client.user.getAvatar(userBob.username)).rejects.toThrowError(
        UnauthorizedException,
      );
    });

    it("throws NotFoundException if user is missing", async () => {
      const username = `abcdef-12345-missing-${rng()}`;

      return expect(bobPlatform.client.user.getAvatar(username)).rejects.toThrowError(
        NotFoundException,
      );
    });

    it.skip("can get avatar", async () => {
      const avatarBase64 = await bobPlatform.client.user.getAvatar(userBob.username);

      expect(avatarBase64).toEqual(testAvatar);
    });
  });

  describe("updateOne", () => {
    it("rejects requests with invalid tokens", async () => {
      bobPlatform.fakeToken = "fake token";

      return expect(bobPlatform.client.user.updateOne(userBob.username, {})).rejects.toThrowError(
        UnauthorizedException,
      );
    });

    it("can update itself", async () => {
      const user = await bobPlatform.client.user.updateOne(userBob.username, {});

      expect(user.username).toEqual(userBob.username);
    });

    it("throws ForbiddenException when trying to modify unrelated users", async () => {
      const username = `abcdef-12345-missing-${rng()}`;

      return expect(bobPlatform.client.user.updateOne(username, {})).rejects.toThrowError(
        ForbiddenException,
      );
    });

    it("throws UsernameAlreadyExistsException when trying to change username to existing user's", async () =>
      expect(
        bobPlatform.client.user.updateOne(userBob.username, {
          username: userAlice.username,
        }),
      ).rejects.toThrowError(UsernameAlreadyExistsException));
  });

  describe("getMany", () => {
    it("rejects requests with invalid tokens", async () => {
      bobPlatform.fakeToken = "fake token";

      return expect(bobPlatform.client.user.getMany()).rejects.toThrowError(UnauthorizedException);
    });

    it("can get 0 users", async () => {
      const users = await bobPlatform.client.user.getMany(
        "filter=username||$eq||missingfoobarusername",
      );

      expect(users.length).toEqual(0);
    });

    it("rejects bad requests", async () =>
      expect(bobPlatform.client.user.getMany()).rejects.toThrowError(BadRequestException));
  });

  describe("getSelf", () => {
    it("rejects requests with invalid tokens", async () => {
      bobPlatform.fakeToken = "fake token";

      return expect(bobPlatform.client.user.getSelf()).rejects.toThrow();
    });

    it("can get self", async () => {
      const user = await bobPlatform.client.user.getSelf();

      expect(user.username).toEqual(userBob.username);
    });
  });

  describe("License", () => {
    describe("Get user subscriptions", () => {
      it("Should get list of subscriptions", async () => {
        const subscriptions = [
          {
            currentPeriodEndsAt: expect.any(String),
            currentPeriodStartedAt: expect.any(String),
            id: "6327929c2cfb8762b99eec44ddb3c3c4",
            planCode: "pro-yearly",
            planName: "Lens Desktop Pro",
            seats: 1,
            shortSubscriptionId: "r55uxv78pktg",
            trialEndsAt: null,
            trialStartedAt: null,
            unitAmount: 249,
            usedSeats: [],
            customFields: [],
            companyName: "sdgfdgdfg",
            accountCode: "f63ed988-017a-4a0f-8486-cc8cf5ec6f32",
            autoRenew: true,
            collectionMethod: "automatic",
            isBusinessAccount: false,
            state: "active",
            pendingChange: {
              activateAt: null,
              quantity: null,
            },
          },
          {
            currentPeriodEndsAt: expect.any(String),
            currentPeriodStartedAt: expect.any(String),
            id: "6264c96770f423f8980c7d45569dc21a",
            planCode: "pro-monthly",
            planName: "Lens Desktop Pro",
            seats: 1,
            shortSubscriptionId: "qxnxlkczs7r6",
            trialEndsAt: null,
            trialStartedAt: null,
            unitAmount: 0,
            usedSeats: [],
            customFields: [],
            companyName: "sdgfdgdfg",
            accountCode: "f63ed988-017a-4a0f-8486-cc8cf5ec6f32",
            autoRenew: true,
            collectionMethod: "automatic",
            isBusinessAccount: false,
            state: "active",
            pendingChange: {
              activateAt: null,
              quantity: null,
            },
          },
        ];
        const userSubscriptions = await bobPlatform.client.user.getUserSubscriptions(
          userBob.username,
        );

        expect(userSubscriptions).toEqual(subscriptions);
      });
    });
  });

  describe("getBillingPageToken", () => {
    it("rejects requests with invalid username", async () =>
      expect(erinPlatform.client.user.getBillingPageToken("FAKE_USER")).rejects.toThrowError(
        ForbiddenException,
      ));

    it("returns the billing page token", async () => {
      const token = await erinPlatform.client.user.getBillingPageToken(userErin.username);

      expect(token).toHaveProperty("hostedLoginToken");
      expect(typeof token.hostedLoginToken).toBe("string");
    });
  });

  describe("getBillingPageTokenBySubscriptionId", () => {
    it("rejects requests with invalid username", async () =>
      expect(
        erinPlatform.client.user.getBillingPageTokenBySubscriptionId("FAKE_USER", "foo-bar"),
      ).rejects.toThrowError(ForbiddenException));

    it("returns the billing page token for subscription", async () => {
      const token = await bobPlatform.client.user.getBillingPageTokenBySubscriptionId(
        userBob.username,
        "6327929c2cfb8762b99eec44ddb3c3c4",
      );

      expect(token).toHaveProperty("hostedLoginToken");
      expect(typeof token.hostedLoginToken).toBe("string");
    });
  });

  describe("getBillingInfo", () => {
    it("rejects requests with invalid username", async () =>
      expect(bobPlatform.client.user.getUserBillingInformation("FAKE_USER")).rejects.toThrowError(
        ForbiddenException,
      ));

    it("returns the billing information", async () => {
      const billingInfo = {
        lastName: "sdfsdf",
        firstName: "sdfsdf",
        company: null,
        type: "credit_card",
        vatNumber: null,
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
          lastFour: "1111",
        },
      };
      const billingInformation = await bobPlatform.client.user.getUserBillingInformation(
        userBob.username,
      );

      expect(billingInformation).toEqual(billingInfo);
    });
  });
});

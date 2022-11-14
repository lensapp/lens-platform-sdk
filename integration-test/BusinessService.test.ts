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

  describe("getMany", () => {
    it("rejects requests with invalid tokens", async () => {
      await bobPlatform.client.business.createOne({
        name: "Bobs business",
        additionalAddress: null,
        state: null,
        country: "Bobbia",
        address: "Bubble street 11",
        zip: "4567",
        city: "BobTown",
        phoneNumber: "9999999",
      });

      await bobPlatform.client.business.createOne({
        name: "Bobs business",
        additionalAddress: null,
        state: null,
        country: "Bobbia",
        address: "Bubble street 11",
        zip: "4567",
        city: "BobTown",
        phoneNumber: "9999999",
      });

      const bobsBusinesses = await bobPlatform.client.business.getMany();

      expect(bobsBusinesses.length).toBe(2);
    });
  });
});

import type { Space } from "../src";
import { config } from "./configuration";
import type { TestPlatform } from "./utils";
import { rng, testPlatformFactory } from "./utils";
import { InvalidEmailDomainException } from "../src/exceptions";

const [credBob, credAlice] = config.users;

describe("InvitationService", () => {
  let testPlatformBob: TestPlatform;
  let testPlatformAlice: TestPlatform;

  beforeAll(async () => {
    testPlatformAlice = await testPlatformFactory(credAlice.username, credAlice.password);
    testPlatformBob = await testPlatformFactory(credBob.username, credBob.password);
  });

  beforeEach(() => {
    testPlatformBob.fakeToken = undefined;
    testPlatformAlice.fakeToken = undefined;
  });

  let bobSpace: Space;

  beforeAll(async () => {
    bobSpace = await testPlatformBob.client.space.createOne({
      name: `sdk-e2e-${rng()}`,
      description: "Test space for InvitationService"
    });
  });

  afterAll(async () => {
    if (bobSpace) {
      await testPlatformBob.client.space.deleteOne({ name: bobSpace.name });
    }
  });

  describe("InvitationDomain", () => {
    it("returns InvalidEmailDomainException", async () => {
      const domain = "foobar-example.com";

      await testPlatformBob.client.space.addInvitationDomain({ name: bobSpace.name, domain });

      const invitation = await testPlatformBob.client.invitation.createOne({
        spaceId: bobSpace.id,
        invitedUsername: credAlice.username,
        kind: "directInvite"
      });

      return expect(testPlatformAlice.client.invitation.updateOne({
        id: invitation.id!,
        state: "accepted"
      })).rejects.toThrowError(InvalidEmailDomainException);
    });
  });

  describe("invitations", () => {
    it("creates and returns invitation", async () => {
      const space = await testPlatformBob.client.space.createOne({
        name: `sdk-e2e-${rng()}`,
        description: "Test space for InvitationService"
      });

      // Note: this invitation can't be deleted after the test
      const invitation = await testPlatformBob.client.invitation.createOne({
        spaceId: space.id,
        invitedUsername: credAlice.username,
        kind: "directInvite"
      });

      await testPlatformBob.client.invitation.getOne({ id: invitation.id! });
      await testPlatformAlice.client.invitation.getOne({ id: invitation.id! });

      await testPlatformBob.client.space.deleteOne({ name: space.name });
    });
  });
});

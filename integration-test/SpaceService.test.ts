import { rng, testPlatformFactory } from "./utils";
import { config } from "./configuration";
import type { Space, K8sCluster } from "../src";
import type { TestPlatform } from "./utils";
import {
  UnauthorizedException,
  SpaceNameReservedException,
  SpaceNotFoundException,
  ForbiddenException,
  NotFoundException
} from "../src/exceptions";

const TEST_SPACE_NAME = "test-space";
const [credBob, credAlice] = config.users;

describe("SpaceService", () => {
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

  it("allows to create, update and delete a space", async () => {
    const name = `sdk-e2e-test-${rng()}`;
    const description = "My space description";
    const updatedDescription = "New description";

    let space = await testPlatformBob.client.space.createOne({ name, description });
    expect(space.name).toEqual(name);

    try {
      space = await testPlatformBob.client.space.updateOne(name, { name, description: updatedDescription });
      expect(space.description).toEqual(updatedDescription);
    } finally {
      await testPlatformBob.client.space.deleteOne({ name: name });
    }
  });

  describe("createOne", () => {
    let existingSpace: Space;

    beforeAll(async () => {
      existingSpace = await testPlatformBob.client.space.createOne({
        name: `sdk-e2e-test-${rng()}`,
        description: "Test space for createOne function"
      });
    });

    afterAll(async () => {
      if (existingSpace) {
        await testPlatformBob.client.space.deleteOne({ name: existingSpace.name });
      }
    });

    it("rejects requests with invalid tokens", async () => {
      testPlatformBob.fakeToken = "fake token";

      return expect(testPlatformBob.client.space.createOne({ name: TEST_SPACE_NAME, description: "My space description" }))
        .rejects.toThrowError(UnauthorizedException);
    });

    it("rejects when space already exists", async () => {
      return expect(testPlatformBob.client.space.createOne({ name: existingSpace.name }))
        .rejects.toThrowError(SpaceNameReservedException);
    });
  });

  describe("getOne", () => {
    let bobSpace: Space;
    let aliceSpace: Space;

    beforeAll(async () => {
      bobSpace = await testPlatformBob.client.space.createOne({
        name: `sdk-e2e-${rng()}`,
        description: "Test space for getOne function"
      });
      aliceSpace = await testPlatformAlice.client.space.createOne({
        name: `sdk-e2e-${rng()}`,
        description: "Test space for getOne function"
      });
    });

    afterAll(async () => {
      if (bobSpace) {
        await testPlatformBob.client.space.deleteOne({ name: bobSpace.name });
      }

      if (aliceSpace) {
        await testPlatformAlice.client.space.deleteOne({ name: aliceSpace.name });
      }
    });

    it("rejects requests with invalid tokens", async () => {
      testPlatformBob.fakeToken = "fake token";

      return expect(testPlatformBob.client.space.getOne({ name: TEST_SPACE_NAME }))
        .rejects.toThrowError(UnauthorizedException);
    });

    it("reports NotFound errors", async () => {
      const name = "missing-" + rng();

      return expect(testPlatformBob.client.space.getOne({ name }))
        .rejects.toThrowError(SpaceNotFoundException);
    });

    it("reports Forbidden errors", async () => {
      return expect(testPlatformBob.client.space.getOne({ name: aliceSpace.name }))
        .rejects.toThrowError(ForbiddenException);
    });
  });

  describe("invitationDomain", () => {
    let bobSpace: Space;
    let aliceSpace: Space;

    beforeAll(async () => {
      bobSpace = await testPlatformBob.client.space.createOne({
        name: `sdk-e2e-${rng()}`,
        description: "Test space for getOne function"
      });
      aliceSpace = await testPlatformAlice.client.space.createOne({
        name: `sdk-e2e-${rng()}`,
        description: "Test space for getOne function"
      });
    });

    afterAll(async () => {
      if (bobSpace) {
        await testPlatformBob.client.space.deleteOne({ name: bobSpace.name });
      }

      if (aliceSpace) {
        await testPlatformAlice.client.space.deleteOne({ name: aliceSpace.name });
      }
    });

    it("adds, gets and deletes invitation domains", async () => {
      const domain = "mirantis.com";

      expect(await testPlatformBob.client.space.getInvitationDomains({ name: bobSpace.name })).toEqual([]);

      expect(await testPlatformBob.client.space.addInvitationDomain({ name: bobSpace.name, domain })).toEqual({
        createdAt: expect.any(String),
        createdById: bobSpace.createdById,
        id: expect.any(String),
        domain,
        spaceId: bobSpace.id,
        updatedAt: expect.any(String)
      });

      const invitationDomains = await testPlatformBob.client.space.getInvitationDomains({ name: bobSpace.name });

      expect(invitationDomains).toEqual([{
        createdAt: expect.any(String),
        createdById: bobSpace.createdById,
        id: expect.any(String),
        domain,
        spaceId: bobSpace.id,
        updatedAt: expect.any(String)
      }]);

      await testPlatformBob.client.space.deleteInvitationDomain({ name: bobSpace.name, invitationDomainId: invitationDomains[0].id });

      expect(await testPlatformBob.client.space.getInvitationDomains({ name: bobSpace.name })).toEqual([]);
    });

    it("returns forbidden if fetching another user's Space's invitation domains", async () => {
      return expect(testPlatformBob.client.space.getInvitationDomains({ name: aliceSpace.name }))
        .rejects.toThrowError(ForbiddenException);
    });

    it("returns not found if fetching not existing Space", async () => {
      return expect(testPlatformBob.client.space.getInvitationDomains({ name: "missing-foobar-space" }))
        .rejects.toThrowError(NotFoundException);
    });
  });

  describe("getOneCluster", () => {
    let aliceSpace: Space;
    let aliceCluster: K8sCluster;
    const spaceName = `sdk-e2e-${rng()}`;

    beforeAll(async () => {
      aliceSpace = await testPlatformAlice.client.space.createOne({
        name: spaceName,
        description: "Test space for getOne function"
      });
      aliceCluster = await testPlatformAlice.client.space.createOneCluster({
        name: spaceName,
        cluster: {
          name: `${spaceName}-cluster`,
          description: "Integration Test Cluster Description",
          kind: "K8sCluster",
          region: "eu"
        }
      });
    });

    afterAll(async () => {
      if (aliceSpace) {
        await testPlatformAlice.client.space.deleteOne({ name: aliceSpace.name });
      }

      if (aliceCluster) {
        await testPlatformAlice.client.space.deleteOneCluster({
          name: aliceSpace.name, clusterId: aliceCluster.id!
        });
      }
    });

    it("reports Forbidden errors", async () => {
      return expect(testPlatformBob.client.space.getOneCluster({ name: aliceSpace.name, clusterId: aliceCluster.id! }))
        .rejects.toThrowError(ForbiddenException);
    });
  });

  describe("updateOne", () => {
    let bobSpace: Space;
    let aliceSpace: Space;

    beforeAll(async () => {
      bobSpace = await testPlatformBob.client.space.createOne({
        name: `sdk-e2e-${rng()}`,
        description: "Test space for updateOne function"
      });
      aliceSpace = await testPlatformAlice.client.space.createOne({
        name: `sdk-e2e-${rng()}`,
        description: "Test space for updateOne function"
      });
    });

    afterAll(async () => {
      if (bobSpace) {
        await testPlatformBob.client.space.deleteOne({ name: bobSpace.name });
      }

      if (aliceSpace) {
        await testPlatformAlice.client.space.deleteOne({ name: aliceSpace.name });
      }
    });

    it("rejects requests with invalid tokens", async () => {
      testPlatformBob.fakeToken = "fake token";

      return expect(testPlatformBob.client.space.updateOne(bobSpace.name, { name: bobSpace.name, description: "My space description" }))
        .rejects.toThrowError(UnauthorizedException);
    });

    it("rejects when space already exists", async () => {
      return expect(testPlatformBob.client.space.updateOne(bobSpace.name, { name: aliceSpace.name }))
        .rejects.toThrowError(SpaceNameReservedException);
    });

    it("rejects when trying to modify space without permissions", async () => {
      return expect(testPlatformBob.client.space.updateOne(aliceSpace.name, { name: aliceSpace.name, description: "Pwned by Bob" }))
        .rejects.toThrowError(ForbiddenException);
    });
  });
});

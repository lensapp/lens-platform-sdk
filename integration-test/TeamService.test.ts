import type { Space, Team } from "../src";
import {
  CantRemoveLastTeamUser,
  ForbiddenException,
  UserNameNotFoundException,
} from "../src/exceptions";
import { config } from "./configuration";
import type { TestPlatform } from "./utils";
import { rng, testPlatformFactory } from "./utils";

const [credBob, credAlice] = config.users;

describe("TeamService", () => {
  let testPlatformBob: TestPlatform;
  let testPlatformAlice: TestPlatform;

  beforeAll(async () => {
    testPlatformBob = await testPlatformFactory(credBob.username, credBob.password);
    testPlatformAlice = await testPlatformFactory(credAlice.username, credAlice.password);
  });

  beforeEach(() => {
    testPlatformBob.fakeToken = undefined;
    testPlatformAlice.fakeToken = undefined;
  });

  describe("removeUser", () => {
    let existingSpace: Space;
    let teams: Team[];

    beforeAll(async () => {
      existingSpace = await testPlatformBob.client.space.createOne({
        name: `sdk-e2e-test-${rng()}`,
        description: "Test space for TeamService.removeUser",
      });
      const joinedSpace = await testPlatformBob.client.space.getOne({
        name: existingSpace.name,
        queryString: "join=teams",
      });

      teams = joinedSpace.teams as any as Team[];
    });

    afterAll(async () => {
      if (existingSpace) {
        await testPlatformBob.client.space.deleteOne({ name: existingSpace.name });
      }
    });

    it("throws CantRemoveLastTeamUser if removing last user from Owner team", async () => {
      const ownerTeam = teams.find((team) => team.kind === "Owner");

      expect(ownerTeam).toBeTruthy();

      return expect(
        testPlatformBob.client.team.removeUser({
          id: ownerTeam?.id!,
          username: credBob.username,
        }),
      ).rejects.toThrowError(CantRemoveLastTeamUser);
    });

    it("throws UserNameNotFoundException if removing user not in Team", async () => {
      const ownerTeam = teams.find((team) => team.kind === "Owner");

      expect(ownerTeam).toBeTruthy();

      return expect(
        testPlatformBob.client.team.removeUser({
          id: ownerTeam?.id!,
          username: credAlice.username,
        }),
      ).rejects.toThrowError(UserNameNotFoundException);
    });

    it("throws ForbiddenException if removing user from another user", async () => {
      const ownerTeam = teams.find((team) => team.kind === "Owner");

      expect(ownerTeam).toBeTruthy();

      return expect(
        testPlatformAlice.client.team.removeUser({
          id: ownerTeam?.id!,
          username: credBob.username,
        }),
      ).rejects.toThrowError(ForbiddenException);
    });
  });
});

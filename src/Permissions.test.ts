import type { Space, Team, User } from ".";
import { LensPlatformClient, Roles, Actions } from ".";
import { minimumOptions } from "./LensPlatformClient.test";

// Current user (Owner)
const mockUser1: User = {
  id: "1234567890"
};

// Admin user
const mockUser2: User = {
  id: "1"
};

// Member user
const mockUser3: User = {
  id: "2"
};

// Random user
const mockUser4: User = {
  id: "3"
};

const mockTeam1: Team = {
  kind: "Owner",
  id: "mt1",
  name: "mt1",
  description: "mt1",
  users: [mockUser1],
  spaceId: "ms1"
};
const mockTeam2: Team = {
  kind: "Admin",
  id: "mt2",
  name: "mt2",
  description: "mt2",
  users: [mockUser2],
  spaceId: "ms1"
};
const mockTeam3: Team = {
  kind: "Normal",
  id: "mt3",
  name: "mt3",
  description: "mt3",
  users: [mockUser3],
  spaceId: "ms1"
};
const mockSpace1: Space = {
  id: "ms1",
  name: "ms1",
  description: "ms1",
  users: [mockUser1, mockUser2, mockUser3],
  teams: [mockTeam1, mockTeam2, mockTeam3]
};

describe("PermissionsService", () => {
  let client: LensPlatformClient;

  beforeAll(() => {
    client = new LensPlatformClient(minimumOptions);
  });

  it("should contain a reference to `PermissionsService`", () => {
    expect(client.permissions).toBeDefined();
  });

  describe(".getRole", () => {
    it("recognizes Owner, Admin and Member roles", () => {
      expect(client.permissions.getRole(mockSpace1)).toEqual(Roles.Owner);
      expect(client.permissions.getRole(mockSpace1, mockUser2.id)).toEqual(Roles.Admin);
      expect(client.permissions.getRole(mockSpace1, mockUser3.id)).toEqual(Roles.Member);
    });

    it("recognizes lack of role", () => {
      expect(client.permissions.getRole(mockSpace1, mockUser4.id)).toEqual(Roles.None);
    });
  });

  describe(".canI", () => {
    it("recognizes owner priviliges", () => {
      expect(client.permissions.canI(Actions.DeleteSpace, mockSpace1)).toBeTruthy();
      expect(client.permissions.canI(Actions.CreateTeam, mockSpace1)).toBeTruthy();
      expect(client.permissions.canI(Actions.DeleteTeam, mockSpace1)).toBeTruthy();
      expect(client.permissions.canI(Actions.PatchTeam, mockSpace1)).toBeTruthy();
      expect(client.permissions.canI(Actions.PatchInvitation, mockSpace1)).toBeTruthy();
      expect(client.permissions.canI(Actions.CreateInvitation, mockSpace1)).toBeTruthy();
      expect(client.permissions.canI(Actions.PatchSpace, mockSpace1)).toBeTruthy();
    });

    it("recognizes admin priviliges", () => {
      expect(client.permissions.canI(Actions.DeleteSpace, mockSpace1, mockUser2.id)).toBeFalsy();
      expect(client.permissions.canI(Actions.CreateTeam, mockSpace1, mockUser2.id)).toBeTruthy();
      expect(client.permissions.canI(Actions.DeleteTeam, mockSpace1, mockUser2.id)).toBeTruthy();
      expect(client.permissions.canI(Actions.PatchTeam, mockSpace1, mockUser2.id)).toBeTruthy();
      expect(client.permissions.canI(Actions.PatchInvitation, mockSpace1, mockUser2.id)).toBeTruthy();
      expect(client.permissions.canI(Actions.CreateInvitation, mockSpace1, mockUser2.id)).toBeTruthy();
      expect(client.permissions.canI(Actions.PatchSpace, mockSpace1, mockUser2.id)).toBeTruthy();
    });

    it("recognizes member priviliges", () => {
      expect(client.permissions.canI(Actions.DeleteSpace, mockSpace1, mockUser3.id)).toBeFalsy();
      expect(client.permissions.canI(Actions.CreateTeam, mockSpace1, mockUser3.id)).toBeFalsy();
      expect(client.permissions.canI(Actions.DeleteTeam, mockSpace1, mockUser3.id)).toBeFalsy();
      expect(client.permissions.canI(Actions.PatchTeam, mockSpace1, mockUser3.id)).toBeFalsy();
      expect(client.permissions.canI(Actions.PatchInvitation, mockSpace1, mockUser3.id)).toBeFalsy();
      expect(client.permissions.canI(Actions.CreateInvitation, mockSpace1, mockUser3.id)).toBeFalsy();
      expect(client.permissions.canI(Actions.PatchSpace, mockSpace1, mockUser3.id)).toBeFalsy();
    });

    it("recognizes lack of priviliges (random unrelated user test)", () => {
      expect(client.permissions.canI(Actions.DeleteSpace, mockSpace1, mockUser4.id)).toBeFalsy();
      expect(client.permissions.canI(Actions.CreateTeam, mockSpace1, mockUser4.id)).toBeFalsy();
      expect(client.permissions.canI(Actions.DeleteTeam, mockSpace1, mockUser4.id)).toBeFalsy();
      expect(client.permissions.canI(Actions.PatchTeam, mockSpace1, mockUser4.id)).toBeFalsy();
      expect(client.permissions.canI(Actions.PatchInvitation, mockSpace1, mockUser4.id)).toBeFalsy();
      expect(client.permissions.canI(Actions.CreateInvitation, mockSpace1, mockUser4.id)).toBeFalsy();
      expect(client.permissions.canI(Actions.PatchSpace, mockSpace1, mockUser4.id)).toBeFalsy();
    });
  });
});

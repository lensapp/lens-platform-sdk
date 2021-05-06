import type { Space, Team, User, K8sCluster } from ".";
import { LensPlatformClient, Roles, Actions, K8sClusterActions } from ".";
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
const mockK8sCluster1: K8sCluster = {
  id: "mk1",
  createdById: mockUser3.id,
  name: "",
  kind: "K8sCluster"
};

describe("PermissionsService", () => {
  let client: LensPlatformClient;

  beforeAll(() => {
    client = new LensPlatformClient(minimumOptions);
  });

  it("should contain a reference to `PermissionsService`", () => {
    expect(client.permission).toBeDefined();
  });

  describe(".getRole", () => {
    it("recognizes Owner, Admin and Member roles", () => {
      expect(client.permission.getRole(mockSpace1)).toEqual(Roles.Owner);
      expect(client.permission.getRole(mockSpace1, mockUser2.id)).toEqual(Roles.Admin);
      expect(client.permission.getRole(mockSpace1, mockUser3.id)).toEqual(Roles.Member);
    });

    it("recognizes lack of role", () => {
      expect(client.permission.getRole(mockSpace1, mockUser4.id)).toEqual(Roles.None);
    });
  });

  describe(".canSpace", () => {
    it("recognizes owner privileges", () => {
      expect(client.permission.canSpace(Actions.DeleteSpace, mockSpace1)).toBeTruthy();
      expect(client.permission.canSpace(Actions.CreateTeam, mockSpace1)).toBeTruthy();
      expect(client.permission.canSpace(Actions.DeleteTeam, mockSpace1)).toBeTruthy();
      expect(client.permission.canSpace(Actions.PatchTeam, mockSpace1)).toBeTruthy();
      expect(client.permission.canSpace(Actions.PatchInvitation, mockSpace1)).toBeTruthy();
      expect(client.permission.canSpace(Actions.RevokeInvitation, mockSpace1)).toBeTruthy();
      expect(client.permission.canSpace(Actions.CreateInvitation, mockSpace1)).toBeTruthy();
      expect(client.permission.canSpace(Actions.PatchSpace, mockSpace1)).toBeTruthy();
    });

    it("recognizes admin privileges", () => {
      expect(client.permission.canSpace(Actions.DeleteSpace, mockSpace1, mockUser2.id)).toBeFalsy();
      expect(client.permission.canSpace(Actions.CreateTeam, mockSpace1, mockUser2.id)).toBeTruthy();
      expect(client.permission.canSpace(Actions.DeleteTeam, mockSpace1, mockUser2.id)).toBeTruthy();
      expect(client.permission.canSpace(Actions.PatchTeam, mockSpace1, mockUser2.id)).toBeTruthy();
      expect(client.permission.canSpace(Actions.PatchInvitation, mockSpace1, mockUser2.id)).toBeTruthy();
      expect(client.permission.canSpace(Actions.RevokeInvitation, mockSpace1, mockUser2.id)).toBeTruthy();
      expect(client.permission.canSpace(Actions.CreateInvitation, mockSpace1, mockUser2.id)).toBeTruthy();
      expect(client.permission.canSpace(Actions.PatchSpace, mockSpace1, mockUser2.id)).toBeTruthy();
    });

    it("recognizes member privileges", () => {
      expect(client.permission.canSpace(Actions.CreateInvitation, mockSpace1, mockUser3.id)).toBeTruthy();
      expect(client.permission.canSpace(Actions.DeleteSpace, mockSpace1, mockUser3.id)).toBeFalsy();
      expect(client.permission.canSpace(Actions.CreateTeam, mockSpace1, mockUser3.id)).toBeFalsy();
      expect(client.permission.canSpace(Actions.DeleteTeam, mockSpace1, mockUser3.id)).toBeFalsy();
      expect(client.permission.canSpace(Actions.PatchTeam, mockSpace1, mockUser3.id)).toBeFalsy();
      expect(client.permission.canSpace(Actions.PatchInvitation, mockSpace1, mockUser3.id)).toBeFalsy();
      expect(client.permission.canSpace(Actions.RevokeInvitation, mockSpace1, mockUser3.id)).toBeFalsy();
      expect(client.permission.canSpace(Actions.PatchSpace, mockSpace1, mockUser3.id)).toBeFalsy();
    });

    it("recognizes lack of privileges (random unrelated user test)", () => {
      expect(client.permission.canSpace(Actions.DeleteSpace, mockSpace1, mockUser4.id)).toBeFalsy();
      expect(client.permission.canSpace(Actions.CreateTeam, mockSpace1, mockUser4.id)).toBeFalsy();
      expect(client.permission.canSpace(Actions.DeleteTeam, mockSpace1, mockUser4.id)).toBeFalsy();
      expect(client.permission.canSpace(Actions.PatchTeam, mockSpace1, mockUser4.id)).toBeFalsy();
      expect(client.permission.canSpace(Actions.PatchInvitation, mockSpace1, mockUser4.id)).toBeFalsy();
      expect(client.permission.canSpace(Actions.CreateInvitation, mockSpace1, mockUser4.id)).toBeFalsy();
      expect(client.permission.canSpace(Actions.PatchSpace, mockSpace1, mockUser4.id)).toBeFalsy();
    });
  });

  describe(".canK8sCluster", () => {
    it("user can delete cluster created by the user", () => {
      expect(client.permission.canK8sCluster(
        K8sClusterActions.DeleteK8sCluster, mockSpace1, mockK8sCluster1, mockUser3.id)
      ).toBeTruthy();
    });

    it("Admin can delete", () => {
      expect(client.permission.canK8sCluster(
        K8sClusterActions.DeleteK8sCluster, mockSpace1, mockK8sCluster1, mockUser2.id)
      ).toBeTruthy();
    });

    it("Owner can delete", () => {
      expect(client.permission.canK8sCluster(
        K8sClusterActions.DeleteK8sCluster, mockSpace1, mockK8sCluster1, mockUser1.id)
      ).toBeTruthy();
    });

    it("non-owner user can't delete", () => {
      expect(client.permission.canK8sCluster(
        K8sClusterActions.DeleteK8sCluster, mockSpace1, mockK8sCluster1, mockUser4.id)
      ).toBeFalsy();
    });
  });
});

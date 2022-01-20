import type { Space, Team, User, K8sCluster } from ".";
import { LensPlatformClient, Roles, Actions, K8sClusterActions } from ".";
import { minimumOptions } from "./LensPlatformClient.test";
import { TeamActions } from "./Permissions";

// Current user (Owner)
const ownerUser: User = {
  id: "1234567890",
};

// Admin user
const adminUser: User = {
  id: "1",
};

// Member user
const memberUser: User = {
  id: "2",
};

// Random user
const mockUser4: User = {
  id: "3",
};

// Member of Space, but not team
const mockUser5: User = {
  id: "4",
};

const ownerTeam: Team = {
  kind: "Owner",
  id: "mt1",
  name: "mt1",
  description: "mt1",
  users: [ownerUser],
  spaceId: "ms1",
};
const adminTeam: Team = {
  kind: "Admin",
  id: "mt2",
  name: "mt2",
  description: "mt2",
  users: [adminUser],
  spaceId: "ms1",
};
const normalTeam: Team = {
  kind: "Normal",
  id: "mt3",
  name: "mt3",
  description: "mt3",
  users: [memberUser],
  spaceId: "ms1",
};
const mockSpace1: Space = {
  id: "ms1",
  name: "ms1",
  description: "ms1",
  kind: "Team",
  users: [ownerUser, adminUser, memberUser, mockUser5],
  teams: [ownerTeam, adminTeam, normalTeam],
  createdById: ownerUser.id,
};
const mockK8sCluster1: K8sCluster = {
  id: "mk1",
  createdById: memberUser.id,
  name: "",
  kind: "K8sCluster",
};
const mockDevCluster1: K8sCluster = {
  id: "mk1",
  createdById: memberUser.id,
  name: "",
  kind: "K8sCluster",
  metadata: {
    labels: {
      devCluster: "true",
    },
  },
};
const mockDevCluster2: K8sCluster = {
  id: "mk1",
  createdById: mockUser5.id,
  name: "",
  kind: "K8sCluster",
  metadata: {
    labels: {
      devCluster: "true",
    },
  },
};

const invitationToBeRevokedByMockUser3 = "invitation_id_to_be_revoked_by_user_3";
const invitationIdsCreatedByMockUser3 = [invitationToBeRevokedByMockUser3, "another_invitation_id"];

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
      expect(client.permission.getRole(mockSpace1, ownerUser.id!)).toEqual(Roles.Owner);
      expect(client.permission.getRole(mockSpace1, adminUser.id!)).toEqual(Roles.Admin);
      expect(client.permission.getRole(mockSpace1, memberUser.id!)).toEqual(Roles.Member);

      // MockUser5 is Space member but is not in any team
      expect(client.permission.getRole(mockSpace1, mockUser5.id!)).toEqual(Roles.Member);
    });

    it("recognizes lack of role", () => {
      expect(client.permission.getRole(mockSpace1, mockUser4.id!)).toEqual(Roles.None);
    });
  });

  describe(".canSpace", () => {
    it("recognizes owner privileges", () => {
      expect(client.permission.canSpace(Actions.DeleteSpace, mockSpace1, ownerUser.id!)).toBeTruthy();
      expect(client.permission.canSpace(Actions.RenameSpace, mockSpace1, ownerUser.id!)).toBeTruthy();
      expect(client.permission.canSpace(Actions.CreateTeam, mockSpace1, ownerUser.id!)).toBeTruthy();
      expect(client.permission.canSpace(Actions.DeleteTeam, mockSpace1, ownerUser.id!)).toBeTruthy();
      expect(client.permission.canSpace(Actions.PatchTeam, mockSpace1, ownerUser.id!)).toBeTruthy();
      expect(client.permission.canSpace(Actions.PatchInvitation, mockSpace1, ownerUser.id!)).toBeTruthy();
      expect(client.permission.canSpace(Actions.RevokeInvitation, mockSpace1, ownerUser.id!)).toBeTruthy();
      expect(client.permission.canSpace(Actions.CreateInvitation, mockSpace1, ownerUser.id!)).toBeTruthy();
      expect(client.permission.canSpace(Actions.PatchSpace, mockSpace1, ownerUser.id!)).toBeTruthy();
      expect(client.permission.canSpace(Actions.AddInvitationDomain, mockSpace1, ownerUser.id!)).toBeTruthy();
      expect(client.permission.canSpace(Actions.DeleteInvitationDomain, mockSpace1, ownerUser.id!)).toBeTruthy();
      expect(client.permission.canSpace(Actions.ChangeSpacePlan, mockSpace1, ownerUser.id!)).toBeTruthy();
      expect(client.permission.canSpace(Actions.GetBillingPageToken, mockSpace1, ownerUser.id!)).toBeTruthy();
    });

    it("can't delete Personal Space", () => {
      expect(client.permission.canSpace(Actions.DeleteSpace, {
        ...mockSpace1,
        kind: "Personal",
      }, ownerUser.id!)).toBeFalsy();
    });

    it("can't rename Personal Space", () => {
      expect(client.permission.canSpace(Actions.RenameSpace, {
        ...mockSpace1,
        kind: "Personal",
      }, ownerUser.id!)).toBeFalsy();
    });

    it("recognizes admin privileges", () => {
      expect(client.permission.canSpace(Actions.DeleteSpace, mockSpace1, adminUser.id!)).toBeFalsy();
      expect(client.permission.canSpace(Actions.RenameSpace, mockSpace1, adminUser.id!)).toBeTruthy();
      expect(client.permission.canSpace(Actions.CreateTeam, mockSpace1, adminUser.id!)).toBeTruthy();
      expect(client.permission.canSpace(Actions.DeleteTeam, mockSpace1, adminUser.id!)).toBeTruthy();
      expect(client.permission.canSpace(Actions.PatchTeam, mockSpace1, adminUser.id!)).toBeTruthy();
      expect(client.permission.canSpace(Actions.PatchInvitation, mockSpace1, adminUser.id!)).toBeTruthy();
      expect(client.permission.canSpace(Actions.RevokeInvitation, mockSpace1, adminUser.id!)).toBeTruthy();
      expect(client.permission.canSpace(Actions.CreateInvitation, mockSpace1, adminUser.id!)).toBeTruthy();
      expect(client.permission.canSpace(Actions.PatchSpace, mockSpace1, adminUser.id!)).toBeTruthy();
      expect(client.permission.canSpace(Actions.AddInvitationDomain, mockSpace1, adminUser.id!)).toBeTruthy();
      expect(client.permission.canSpace(Actions.DeleteInvitationDomain, mockSpace1, adminUser.id!)).toBeTruthy();
      expect(client.permission.canSpace(Actions.GetBillingPageToken, mockSpace1, adminUser.id!)).toBeTruthy();
      expect(client.permission.canSpace(Actions.ChangeSpacePlan, mockSpace1, adminUser.id!)).toBeFalsy();
    });

    it("recognizes member privileges", () => {
      expect(client.permission.canSpace(Actions.CreateInvitation, mockSpace1, memberUser.id!)).toBeFalsy();
      expect(client.permission.canSpace(Actions.DeleteSpace, mockSpace1, memberUser.id!)).toBeFalsy();
      expect(client.permission.canSpace(Actions.CreateTeam, mockSpace1, memberUser.id!)).toBeFalsy();
      expect(client.permission.canSpace(Actions.DeleteTeam, mockSpace1, memberUser.id!)).toBeFalsy();
      expect(client.permission.canSpace(Actions.PatchTeam, mockSpace1, memberUser.id!)).toBeFalsy();
      expect(client.permission.canSpace(Actions.RenameSpace, mockSpace1, memberUser.id!)).toBeFalsy();
      expect(client.permission.canSpace(Actions.PatchInvitation, mockSpace1, memberUser.id!)).toBeFalsy();
      expect(client.permission.canSpace(Actions.RevokeInvitation, mockSpace1, memberUser.id!)).toBeFalsy();
      expect(client.permission.canSpace(Actions.RevokeInvitation, mockSpace1, memberUser.id!)).toBeFalsy();
      expect(client.permission.canSpace(Actions.RevokeInvitation, mockSpace1, memberUser.id!, {
        invitationId: invitationToBeRevokedByMockUser3,
        invitationIdsCreatedByUserId: invitationIdsCreatedByMockUser3,
      })).toBeTruthy();
      expect(client.permission.canSpace(Actions.PatchSpace, mockSpace1, memberUser.id!)).toBeFalsy();
      expect(client.permission.canSpace(Actions.AddInvitationDomain, mockSpace1, memberUser.id!)).toBeFalsy();
      expect(client.permission.canSpace(Actions.DeleteInvitationDomain, mockSpace1, memberUser.id!)).toBeFalsy();
      expect(client.permission.canSpace(Actions.GetBillingPageToken, mockSpace1, memberUser.id!)).toBeFalsy();
      expect(client.permission.canSpace(Actions.ChangeSpacePlan, mockSpace1, memberUser.id!)).toBeFalsy();
    });

    it("recognizes lack of privileges (random unrelated user test)", () => {
      expect(client.permission.canSpace(Actions.DeleteSpace, mockSpace1, mockUser4.id!)).toBeFalsy();
      expect(client.permission.canSpace(Actions.CreateTeam, mockSpace1, mockUser4.id!)).toBeFalsy();
      expect(client.permission.canSpace(Actions.DeleteTeam, mockSpace1, mockUser4.id!)).toBeFalsy();
      expect(client.permission.canSpace(Actions.PatchTeam, mockSpace1, mockUser4.id!)).toBeFalsy();
      expect(client.permission.canSpace(Actions.PatchInvitation, mockSpace1, mockUser4.id!)).toBeFalsy();
      expect(client.permission.canSpace(Actions.CreateInvitation, mockSpace1, mockUser4.id!)).toBeFalsy();
      expect(client.permission.canSpace(Actions.PatchSpace, mockSpace1, mockUser4.id!)).toBeFalsy();
      expect(client.permission.canSpace(Actions.RenameSpace, mockSpace1, mockUser4.id!)).toBeFalsy();
      expect(client.permission.canSpace(Actions.AddInvitationDomain, mockSpace1, mockUser4.id!)).toBeFalsy();
      expect(client.permission.canSpace(Actions.DeleteInvitationDomain, mockSpace1, mockUser4.id!)).toBeFalsy();
      expect(client.permission.canSpace(Actions.GetBillingPageToken, mockSpace1, mockUser4.id!)).toBeFalsy();
      expect(client.permission.canSpace(Actions.ChangeSpacePlan, mockSpace1, mockUser4.id!)).toBeFalsy();
    });
  });

  describe(".canTeam", () => {
    describe("AddUser", () => {
      it("can add user to team as Owner", () => {
        expect(client.permission.canTeam(TeamActions.AddUser, mockSpace1, ownerTeam, ownerUser.id ?? "")).toBeTruthy();
      });

      it("can add user to Owner team of Personal Space", () => {
        expect(client.permission.canTeam(TeamActions.AddUser, {
          ...mockSpace1,
          kind: "Personal",
        }, ownerTeam, adminUser.id ?? "")).toBeFalsy();
      });

      it("admin user can't add user to owner team", () => {
        expect(client.permission.canTeam(TeamActions.AddUser, mockSpace1, ownerTeam, adminUser.id ?? "")).toBeFalsy();
      });

      it("admin user can add user to admin team", () => {
        expect(client.permission.canTeam(TeamActions.AddUser, mockSpace1, adminTeam, adminUser.id ?? "")).toBeTruthy();
      });

      it("admin user can add user to normal team", () => {
        expect(client.permission.canTeam(TeamActions.AddUser, mockSpace1, normalTeam, adminUser.id ?? "")).toBeTruthy();
      });

      it("member user can't add user to owner team", () => {
        expect(client.permission.canTeam(TeamActions.AddUser, mockSpace1, ownerTeam, memberUser.id ?? "")).toBeFalsy();
      });

      it("member user can't add user to admin team", () => {
        expect(client.permission.canTeam(TeamActions.AddUser, mockSpace1, adminTeam, memberUser.id ?? "")).toBeFalsy();
      });

      it("member user can't add user to normal team", () => {
        expect(client.permission.canTeam(TeamActions.AddUser, mockSpace1, normalTeam, memberUser.id ?? "", memberUser.id ?? "")).toBeFalsy();
      });
    });

    describe("RemoveUser", () => {
      it("can remove user from team as Owner", () => {
        expect(client.permission.canTeam(TeamActions.RemoveUser, mockSpace1, ownerTeam, ownerUser.id ?? "", ownerUser.id ?? "")).toBeTruthy();
      });

      it("can't remove itself from Owner team of Personal Space", () => {
        expect(client.permission.canTeam(TeamActions.RemoveUser, {
          ...mockSpace1,
          kind: "Personal",
        }, ownerTeam, ownerUser.id ?? "", ownerUser.id ?? "")).toBeFalsy();
      });

      it("admin team can't remove user from owner team", () => {
        expect(client.permission.canTeam(TeamActions.RemoveUser, mockSpace1, ownerTeam, adminUser.id ?? "", ownerUser.id ?? "")).toBeFalsy();
      });

      it("admin team can remove user from admin team", () => {
        expect(client.permission.canTeam(TeamActions.RemoveUser, mockSpace1, adminTeam, adminUser.id ?? "", adminUser.id ?? "")).toBeTruthy();
      });

      it("admin team can remove user from normal team", () => {
        expect(client.permission.canTeam(TeamActions.RemoveUser, mockSpace1, normalTeam, adminUser.id ?? "", memberUser.id ?? "")).toBeTruthy();
      });

      it("member user can't remove user to owner team", () => {
        expect(client.permission.canTeam(TeamActions.RemoveUser, mockSpace1, ownerTeam, memberUser.id ?? "", ownerUser.id ?? "")).toBeFalsy();
      });

      it("member user can't remove user to admin team", () => {
        expect(client.permission.canTeam(TeamActions.RemoveUser, mockSpace1, adminTeam, memberUser.id ?? "", adminUser.id ?? "")).toBeFalsy();
      });

      it("member user can't remove user to normal team", () => {
        expect(client.permission.canTeam(TeamActions.RemoveUser, mockSpace1, normalTeam, memberUser.id ?? "", memberUser.id ?? "")).toBeFalsy();
      });
    });
  });

  describe(".canK8sCluster", () => {
    it("user can delete cluster created by the user", () => {
      expect(client.permission.canK8sCluster(
        K8sClusterActions.DeleteK8sCluster, mockSpace1, mockK8sCluster1, memberUser.id!),
      ).toBeTruthy();
    });

    it("Admin can delete", () => {
      expect(client.permission.canK8sCluster(
        K8sClusterActions.DeleteK8sCluster, mockSpace1, mockK8sCluster1, adminUser.id!),
      ).toBeTruthy();
    });

    it("Owner can delete", () => {
      expect(client.permission.canK8sCluster(
        K8sClusterActions.DeleteK8sCluster, mockSpace1, mockK8sCluster1, ownerUser.id!),
      ).toBeTruthy();
    });

    it("non-owner user can't delete", () => {
      expect(client.permission.canK8sCluster(
        K8sClusterActions.DeleteK8sCluster, mockSpace1, mockK8sCluster1, mockUser4.id!),
      ).toBeFalsy();
    });

    it("user can access non-devCluster", () => {
      expect(client.permission.canK8sCluster(
        K8sClusterActions.AccessK8sCluster, mockSpace1, mockK8sCluster1, memberUser.id!),
      ).toBeTruthy();
    });

    it("user can access own devCluster", () => {
      expect(client.permission.canK8sCluster(
        K8sClusterActions.AccessK8sCluster, mockSpace1, mockDevCluster1, memberUser.id!),
      ).toBeTruthy();
    });

    it("user can access own devCluster 2", () => {
      expect(client.permission.canK8sCluster(
        K8sClusterActions.AccessK8sCluster, mockSpace1, mockDevCluster2, mockUser5.id!),
      ).toBeTruthy();
    });

    it("member can't access another user's devCluster", () => {
      expect(client.permission.canK8sCluster(
        K8sClusterActions.AccessK8sCluster, mockSpace1, mockDevCluster1, mockUser5.id!),
      ).toBeFalsy();
    });

    it("member can't access another user's devCluster 2", () => {
      expect(client.permission.canK8sCluster(
        K8sClusterActions.AccessK8sCluster, mockSpace1, mockDevCluster2, memberUser.id!),
      ).toBeFalsy();
    });

    it("admin can access own devCluster", () => {
      expect(client.permission.canK8sCluster(
        K8sClusterActions.AccessK8sCluster, mockSpace1, mockDevCluster1, adminUser.id!),
      ).toBeTruthy();
    });

    it("admin can access another user's devCluster", () => {
      expect(client.permission.canK8sCluster(
        K8sClusterActions.AccessK8sCluster, mockSpace1, mockDevCluster2, adminUser.id!),
      ).toBeTruthy();
    });

    it("owner can access own devCluster", () => {
      expect(client.permission.canK8sCluster(
        K8sClusterActions.AccessK8sCluster, mockSpace1, mockDevCluster1, ownerUser.id!),
      ).toBeTruthy();
    });

    it("owner can access another user's devCluster", () => {
      expect(client.permission.canK8sCluster(
        K8sClusterActions.AccessK8sCluster, mockSpace1, mockDevCluster2, ownerUser.id!),
      ).toBeTruthy();
    });
  });
});

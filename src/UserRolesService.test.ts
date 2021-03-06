import nock from "nock";
import { apiEndpointAddress, minimumOptions as options } from "./LensPlatformClient.test";
import LensPlatformClient from "./LensPlatformClient";
import { Roles } from "./Permissions";

describe(".user role.*", () => {
  const username = "test-username";
  const spaceName = "test-space";
  const lensPlatformClient = new LensPlatformClient(options);

  describe("Change user role", () => {
    it("Should change use role from Member to Admin", async () => {
      nock(apiEndpointAddress).patch(`/spaces/${spaceName}/users/${username}/role`).reply(200, {
        role: "Admin",
      });

      const role = await lensPlatformClient.roles.setUserRole(spaceName, username, Roles.Admin);

      expect(role).toEqual({ role: Roles.Admin });
    });

    it("Should change use role from Member to Owner", async () => {
      nock(apiEndpointAddress).patch(`/spaces/${spaceName}/users/${username}/role`).reply(200, {
        role: "Owner",
      });

      const role = await lensPlatformClient.roles.setUserRole(spaceName, username, Roles.Owner);

      expect(role).toEqual({ role: Roles.Owner });
    });

    it("Should change use role from Admin to Member", async () => {
      nock(apiEndpointAddress).patch(`/spaces/${spaceName}/users/${username}/role`).reply(200, {
        role: "Normal",
      });

      const role = await lensPlatformClient.roles.setUserRole(spaceName, username, Roles.Admin);

      expect(role).toEqual({ role: Roles.Member });
    });

    it("Should change use role from Owner to Member", async () => {
      nock(apiEndpointAddress).patch(`/spaces/${spaceName}/users/${username}/role`).reply(200, {
        role: "Normal",
      });

      const role = await lensPlatformClient.roles.setUserRole(spaceName, username, Roles.Owner);

      expect(role).toEqual({ role: Roles.Member });
    });

    it("Should change use role from Owner to Admin", async () => {
      nock(apiEndpointAddress).patch(`/spaces/${spaceName}/users/${username}/role`).reply(200, {
        role: "Admin",
      });

      const role = await lensPlatformClient.roles.setUserRole(spaceName, username, Roles.Admin);

      expect(role).toEqual({ role: Roles.Admin });
    });
  });

  describe("Get use role", () => {
    it("Should get Member use role", async () => {
      nock(apiEndpointAddress).get(`/spaces/${spaceName}/users/${username}/role`).reply(200, {
        role: "Normal",
      });

      const role = await lensPlatformClient.roles.getUserSpaceRole(spaceName, username);

      expect(role).toEqual({ role: Roles.Member });
    });

    it("Should get Admin use role", async () => {
      nock(apiEndpointAddress).get(`/spaces/${spaceName}/users/${username}/role`).reply(200, {
        role: "Admin",
      });

      const role = await lensPlatformClient.roles.getUserSpaceRole(spaceName, username);

      expect(role).toEqual({ role: Roles.Admin });
    });

    it("Should get Owner use role", async () => {
      nock(apiEndpointAddress).get(`/spaces/${spaceName}/users/${username}/role`).reply(200, {
        role: "Owner",
      });

      const role = await lensPlatformClient.roles.getUserSpaceRole(spaceName, username);

      expect(role).toEqual({ role: Roles.Owner });
    });
  });
});

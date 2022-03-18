import nock from "nock";
import { apiEndpointAddress, minimumOptions as options } from "./LensPlatformClient.test";
import LensPlatformClient from "./LensPlatformClient";
import { Roles } from "./Permissions";

describe(".user role.*", () => {
  const username = "test-username";
  const spacename = "test-space";
  const lensPlatformClient = new LensPlatformClient(options);

  it("Should change use role from Member to Admin", async () => {
    nock(apiEndpointAddress).patch(`/spaces/${spacename}/users/${username}/role`).reply(200, {
      role: "Admin",
    });

    const role = await lensPlatformClient.roles.changeUserSpaceRole(spacename, username, Roles.Admin);

    expect(role).toEqual({ role: Roles.Admin });
  });

  it("Should change use role from Member to Owner", async () => {
    nock(apiEndpointAddress).patch(`/spaces/${spacename}/users/${username}/role`).reply(200, {
      role: "Owner",
    });

    const role = await lensPlatformClient.roles.changeUserSpaceRole(spacename, username, Roles.Owner);

    expect(role).toEqual({ role: Roles.Owner });
  });

  it("Should change use role from Admin to Member", async () => {
    nock(apiEndpointAddress).patch(`/spaces/${spacename}/users/${username}/role`).reply(200, {
      role: "Normal",
    });

    const role = await lensPlatformClient.roles.changeUserSpaceRole(spacename, username, Roles.Admin);

    expect(role).toEqual({ role: Roles.Member });
  });

  it("Should change use role from Owner to Member", async () => {
    nock(apiEndpointAddress).patch(`/spaces/${spacename}/users/${username}/role`).reply(200, {
      role: "Normal",
    });

    const role = await lensPlatformClient.roles.changeUserSpaceRole(spacename, username, Roles.Owner);

    expect(role).toEqual({ role: Roles.Member });
  });
});

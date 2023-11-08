import nock from "nock";
import LensPlatformClient from "./LensPlatformClient";
import { minimumOptions as options, apiEndpointAddress } from "./LensPlatformClient.test";

describe(".user.*", () => {
  const username = "test-username";

  nock(apiEndpointAddress)
    .get("/users")
    .reply(200, [
      {
        id: "test-id",
        username,
        fullname: "test fullname",
      },
    ]);
  nock(apiEndpointAddress).get(`/users/${username}`).reply(200, {
    id: "test-id",
    username,
    fullname: "test fullname",
    email: "test@example.com",
  });
  nock(apiEndpointAddress).delete(`/users/${username}`).reply(200);
  nock(apiEndpointAddress).patch(`/users/${username}`).twice().reply(200, {
    id: "test-id",
    username,
    fullname: "test fullname",
    email: "test@example.com",
  });
  nock(apiEndpointAddress).put(`/users/${username}/reset-password`).reply(204);

  nock(apiEndpointAddress).get(`/users/${username}/communications`).reply(200, {
    newsletter: false,
    onboarding: false,
  });

  nock(apiEndpointAddress).patch(`/users/${username}/communications`).reply(200, {
    newsletter: true,
    onboarding: false,
  });

  const lensPlatformClient = new LensPlatformClient(options);

  lensPlatformClient.getDecodedAccessToken = jest.fn().mockResolvedValue({
    preferred_username: username,
  });

  it("can call getOne", async () => {
    const user = await lensPlatformClient.user.getOne({ username });

    expect(user.email).toBeTruthy();
  });

  it("can call getMany", async () => {
    await lensPlatformClient.user.getMany();
  });

  it("can call updateOne with email", async () => {
    await lensPlatformClient.user.updateOne(username, {
      email: "new@example.com",
    });
  });

  it("can call updateOne without email", async () => {
    await lensPlatformClient.user.updateOne(username, {});
  });

  it("can call deleteOne", async () => {
    await lensPlatformClient.user.deleteOne(username);
  });

  it("can call getUserCommunicationPreferences", async () => {
    const pref = await lensPlatformClient.user.getUserCommunicationsPreferences();

    expect(pref.newsletter).toBeFalsy();
  });

  it("can call updateUserCommunicationsPreferences", async () => {
    await lensPlatformClient.user.updateUserCommunicationsPreferences({
      newsletter: true,
      onboarding: false,
    });
  });

  it("should get full name from first and last names", async () => {
    const user = {
      firstName: "John",
      lastName: "Doe",
      email: "test@test.test",
      fullname: "John Doe test",
      username: "Johntest",
      password: "test",
    };

    expect(lensPlatformClient.user.getUserFullName(user)).toEqual("John Doe");
  });

  it("should get full name from first name", async () => {
    const user = {
      firstName: "John",
      email: "test@test.test",
      fullname: "John Doe test",
      username: "Johntest",
      password: "test",
    };

    expect(lensPlatformClient.user.getUserFullName(user)).toEqual("John");
  });

  it("should get full name from full name", async () => {
    const user = {
      email: "test@test.test",
      fullname: "John Doe test",
      username: "Johntest",
      password: "test",
    };

    expect(lensPlatformClient.user.getUserFullName(user)).toEqual("John Doe test");
  });

  it("should get full name from username", async () => {
    const user = {
      email: "test@test.test",
      username: "Johntest",
      password: "test",
    };

    expect(lensPlatformClient.user.getUserFullName(user)).toEqual("Johntest");
  });

  it("can call resetPassword", async () => {
    const response = await lensPlatformClient.user.resetPassword(username, "newPassword!");

    expect(response).toBeUndefined();
  });
});

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

  const lensPlatformClient = new LensPlatformClient(options);

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
});

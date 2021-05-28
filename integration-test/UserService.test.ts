import LensPlatformClient from "../src/LensPlatformClient";
import { ResourceOwnerPassword } from "simple-oauth2";
import { config } from "./configuration";
import { BadRequestException, ForbiddenException, LensSDKException, NotFoundException, UnauthorizedException } from "../src/exceptions";

describe("UserService", () => {
  describe("getOne", () => {
    let lensPlatformClient: LensPlatformClient;
    let useInvalidToken: boolean;

    beforeAll(async () => {
      const client = new ResourceOwnerPassword({
        client: {
          id: config.keycloakClientId,
          // Client secret not needed for Direct Access Grant / Resource Owner Password Credentials Grant
          secret: "<client-secret>"
        },
        auth: {
          tokenHost: config.tokenHost,
          tokenPath: "/auth/realms/lensCloud/protocol/openid-connect/token"
        }
      });

      const tokenParams = {
        username: config.user.username,
        password: config.user.password,
        scope: "openid"
      };

      const accessToken = (await client.getToken(tokenParams)).token.access_token as string;

      lensPlatformClient = new LensPlatformClient({
        getAccessToken: () => useInvalidToken ? "invalid_token" : accessToken,
        keyCloakAddress: config.keyCloakAddress,
        keycloakRealm: config.keycloakRealm,
        apiEndpointAddress: config.apiEndpointAddress
      });
    });

    beforeEach(() => {
      useInvalidToken = false;
    });

    describe("getOne", () => {
      it("rejects requiests with invalid tokens", async () => {
        useInvalidToken = true;

        return expect(lensPlatformClient.user.getOne({ username: config.user.username }))
          .rejects.toThrowError(UnauthorizedException);
      });

      it("can get itself", async () => {
        const user = await lensPlatformClient.user.getOne({ username: config.user.username });

        expect(user.username).toEqual(config.user.username);
      });

      it("throws NotFoundException if user is missing", async () => {
        const username = "abcdef-12345-missing-" + String(Math.random() * 1000000000);

        return expect(lensPlatformClient.user.getOne({ username }))
          .rejects.toThrowError(NotFoundException);
      });
    });

    describe("updateOne", () => {
      it("rejects requiests with invalid tokens", async () => {
        useInvalidToken = true;

        return expect(lensPlatformClient.user.updateOne(config.user.username, {}))
          .rejects.toThrowError(UnauthorizedException);
      });

      it("can update itself", async () => {
        const user = await lensPlatformClient.user.updateOne(config.user.username, {});
        expect(user.username).toEqual(config.user.username);
      });

      it("throws ForbiddenException when trying to modify unrelated users", async () => {
        const username = "abcdef-12345-missing-" + String(Math.random() * 1000000000);

        return expect(lensPlatformClient.user.updateOne(username, {}))
          .rejects.toThrowError(ForbiddenException);
      });
    });

    describe("getMany", () => {
      it("rejects requiests with invalid tokens", async () => {
        useInvalidToken = true;

        return expect(lensPlatformClient.user.getMany())
          .rejects.toThrowError(UnauthorizedException);
      });

      it("can get users", async () => {
        const users = await lensPlatformClient.user.getMany(`filter=email||$eq||${config.user.username}@mirantis.com`);
        expect(users.length).toEqual(0);
      });

      it("rejects bad requests", async () =>
        expect(
          lensPlatformClient.user.getMany()
        ).rejects.toThrowError(BadRequestException)
      );
    });
  });
});

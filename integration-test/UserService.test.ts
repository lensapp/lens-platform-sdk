import LensPlatformClient from "../src/LensPlatformClient";
import { ResourceOwnerPassword } from "simple-oauth2";
import { config } from "./configuration";
import { NotFoundException } from "../src/exceptions";

describe("UserService", () => {
  describe("getOne", () => {
    let lensPlatformClient: LensPlatformClient;

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
        getAccessToken: () => accessToken,
        keyCloakAddress: config.keyCloakAddress,
        keycloakRealm: config.keycloakRealm,
        apiEndpointAddress: config.apiEndpointAddress
      });
    });

    describe("getOne", () => {
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
      it("can update itself", async () => {
        const user = await lensPlatformClient.user.updateOne(config.user.username, {});

        expect(user.username).toEqual(config.user.username);
      });
    });
  });
});

import { ResourceOwnerPassword } from "simple-oauth2";

import LensPlatformClient from "../src/LensPlatformClient";
import { config } from "./configuration";

export class TestPlatform {
  public fakeToken?: string;
  public readonly client: LensPlatformClient;

  constructor(private readonly accessToken: string) {
    this.client = new LensPlatformClient({
      getAccessToken: async () =>
        Promise.resolve(this.fakeToken ? this.fakeToken : this.accessToken),
      keyCloakAddress: config.keyCloakAddress,
      keycloakRealm: config.keycloakRealm,
      apiEndpointAddress: config.apiEndpointAddress,
    });
  }
}

export const testPlatformFactory = async (username: string, password: string) => {
  const client = new ResourceOwnerPassword({
    client: {
      id: config.keycloakClientId,
      // Client secret not needed for Direct Access Grant / Resource Owner Password Credentials Grant
      secret: "<client-secret>",
    },
    auth: {
      tokenHost: config.tokenHost,
      tokenPath: "/auth/realms/lensCloud/protocol/openid-connect/token",
    },
  });

  const tokenParams = {
    username: username,
    password: password,
    scope: "openid",
  };

  const accessToken = (await client.getToken(tokenParams)).token.access_token as string;

  return new TestPlatform(accessToken);
};

export const rng = () => String(Math.ceil(Math.random() * 1000000000));

import LensPlatformClient from "../src/LensPlatformClient";
import { config } from "./configuration";

describe("UserService", () => {
  describe("getOne", () => {
    const lensPlatformClient = new LensPlatformClient({
      getAccessToken: () => "",
      keyCloakAddress: config.keyCloakAddress,
      keycloakRealm: config.keycloakRealm,
      apiEndpointAddress: config.apiEndpointAddress
    });

    it("can get itself", () => {
      //
    });
  });
});

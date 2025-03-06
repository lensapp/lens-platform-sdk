import nock from "nock";
import LensPlatformClient from "./LensPlatformClient";
import { minimumOptions as options, apiEndpointAddress } from "./LensPlatformClient.test";

describe(".domain/features.*", () => {
  const username = "test-username";
  const domain = "mirantis.com";

  nock(apiEndpointAddress)
    .get("/domain/features")
    .reply(200, [
      {
        domainMatchingEnabled: false,
      },
    ]);

  const lensPlatformClient = new LensPlatformClient(options);

  lensPlatformClient.getDecodedAccessToken = jest.fn().mockResolvedValue({
    preferred_username: username,
  });

  it("can call get", async () => {
    const features = await lensPlatformClient.domainFeatures.get({ domain });

    expect(features.domainMatchingEnabled).toBeTruthy();
  });
});

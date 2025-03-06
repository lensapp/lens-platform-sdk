import nock from "nock";
import LensPlatformClient from "./LensPlatformClient";
import { minimumOptions as options, apiEndpointAddress } from "./LensPlatformClient.test";

describe(".domain/features.*", () => {
  const domain = "mirantis.com";

  nock(apiEndpointAddress).get(`/domain/features?domain=${domain}`).reply(200, {
    domainMatchingEnabled: true,
  });

  const lensPlatformClient = new LensPlatformClient(options);

  it("can call get", async () => {
    const features = await lensPlatformClient.domainFeatures.get({ domain });

    expect(features.domainMatchingEnabled).toBeTruthy();
  });
});

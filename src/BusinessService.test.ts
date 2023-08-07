import nock from "nock";
import LensPlatformClient from "./LensPlatformClient";
import { minimumOptions as options, apiEndpointAddress } from "./LensPlatformClient.test";

describe(".business.*", () => {
  const businessId = "businessId";
  const subscriptionId = "test-subscription";

  const lensPlatformClient = new LensPlatformClient(options);

  it("can call updateBusinessSubscriptionCustomField", async () => {
    nock(apiEndpointAddress)
      .patch(`/businesses/${businessId}/subscriptions/${subscriptionId}/custom-field`)
      .once()
      .reply(200, {
        id: "test-subscription",
        customFields: [
          {
            name: "test-field",
            value: "test-value",
          },
        ],
      });

    const subscription = await lensPlatformClient.business.updateBusinessSubscriptionCustomField({
      businessId: "businessId",
      businessSubscriptionId: "test-subscription",
      customField: { name: "test-field", value: "test-value" },
    });

    expect(subscription.customFields).toBeTruthy();
  });
});

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

  it("can call previewBusinessSubscriptionSeatsQuantityChange", async () => {
    nock(apiEndpointAddress)
      .post(`/businesses/${businessId}/subscriptions/${subscriptionId}/change/preview`)
      .once()
      .reply(200, {
        balance: 498,
      });

    const preview =
      await lensPlatformClient.business.previewBusinessSubscriptionSeatsQuantityChange({
        businessId: "businessId",
        businessSubscriptionId: "test-subscription",
        quantity: 4,
      });

    expect(preview.balance).toEqual(498);
  });
});

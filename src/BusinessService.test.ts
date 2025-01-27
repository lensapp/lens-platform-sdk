/* eslint-disable jest/no-conditional-expect */
import nock from "nock";
import LensPlatformClient from "./LensPlatformClient";
import { minimumOptions as options, apiEndpointAddress } from "./LensPlatformClient.test";
import { type BusinessJoinRequest } from "./BusinessService";
import { MultiStatusException } from "./exceptions";

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

  it("can call updateBusinessJoinRequests with successful response", async () => {
    const joinRequests: Array<Pick<BusinessJoinRequest, "id" | "state">> = [
      {
        id: "req-01",
        state: "accepted",
      },
      {
        id: "req-02",
        state: "rejected",
      },
      {
        id: "req-03",
        state: "accepted",
      },
    ];

    nock(apiEndpointAddress)
      .patch(`/businesses/${businessId}/join-requests`, joinRequests)
      .once()
      .reply(200, joinRequests);

    const data = await lensPlatformClient.business.updateBusinessJoinRequests(
      "businessId",
      joinRequests,
    );

    expect(data).toEqual(joinRequests);
  });

  it("can call updateBusinessJoinRequests with partly unsuccessful response", async () => {
    const joinRequests: Array<Pick<BusinessJoinRequest, "id" | "state">> = [
      {
        id: "req-01",
        state: "accepted",
      },
      {
        id: "req-02",
        state: "rejected",
      },
      {
        id: "req-03",
        state: "accepted",
      },
    ];

    nock(apiEndpointAddress)
      .patch(`/businesses/${businessId}/join-requests`, joinRequests)
      .once()
      .reply(207, {
        error: "Some join requests could not be processed",
        "multi-status": [
          {
            id: joinRequests[0].id,
            data: joinRequests[0],
            status: "success",
          },
          {
            id: joinRequests[1].id,
            status: "failure",
            error: `Join request ${joinRequests[1].id} is ${joinRequests[1].state}, can not update`,
            statusCode: 422,
          },
          {
            id: joinRequests[2].id,
            status: "failure",
            error: `Join request ${joinRequests[2].id} not found`,
            statusCode: 404,
          },
        ],
      });

    try {
      await lensPlatformClient.business.updateBusinessJoinRequests("businessId", joinRequests);
      // The test should fail if the exception is not thrown
      expect(true).toBe(false);
    } catch (e: unknown) {
      if (e instanceof MultiStatusException) {
        expect(e).toBeInstanceOf(MultiStatusException);
        expect(e.message).toEqual("Failed to update 2 out of 3 join requests");
        expect((e.rawException as any)?.body).toEqual({
          error: "Some join requests could not be processed",
          "multi-status": [
            {
              data: {
                id: "req-01",
                state: "accepted",
              },
              id: "req-01",
              status: "success",
            },
            {
              error: "Join request req-02 is rejected, can not update",
              id: "req-02",
              status: "failure",
              statusCode: 422,
            },
            {
              error: "Join request req-03 not found",
              id: "req-03",
              status: "failure",
              statusCode: 404,
            },
          ],
        });
      } else {
        throw e;
      }
    }
  });
});

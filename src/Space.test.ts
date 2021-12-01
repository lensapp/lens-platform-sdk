import nock from "nock";
import LensPlatformClient from "./LensPlatformClient";
import { minimumOptions as options, apiEndpointAddress } from "./LensPlatformClient.test";

describe(".space.*", () => {
  const spaceName = "spaceName";
  const response = {
    name: spaceName,
  };
  nock(apiEndpointAddress).get(/spaces/).twice().reply(200, response);
  nock(apiEndpointAddress).post("/spaces").reply(200, response);
  nock(apiEndpointAddress).patch(`/spaces/${spaceName}`).reply(200, response);
  nock(apiEndpointAddress).delete(`/spaces/${spaceName}`).reply(200, response);

  const lensPlatformClient = new LensPlatformClient(options);

  [
    "createOne",
    "getOne",
    "getMany",
    "updateOne",
    "deleteOne",
  ].forEach(method => {
    it(`${method}()`, async () => {
      if (method === "deleteOne") {
        expect(async () => lensPlatformClient.space[method]({ name: spaceName })).not.toThrow();
      } else if (method === "updateOne") {
        expect(await lensPlatformClient.space[method](spaceName, { name: spaceName })).toEqual(response);
      } else {
        // @ts-expect-error
        expect(await lensPlatformClient.space[method]({ name: spaceName })).toEqual(response);
      }
    });
  });
});

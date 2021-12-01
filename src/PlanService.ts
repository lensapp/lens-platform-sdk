import { Base } from "./Base";
import type { BillingPlan } from "./BillingPlan";

/**
 *
 * The class for consuming all `plan` resources.
 *
 * @remarks
 * This class should be generated using OpenAPI generator in the future.
 *
 * @alpha
 */
class PlanService extends Base {
  /**
   * Get one plan by space name
   */
  async getOne({ name, queryString }: { name: string; queryString?: string }): Promise<BillingPlan> {
    const { apiEndpointAddress, fetch, throwExpected } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/plans/${name}${queryString ? `/?${queryString}` : ""}`;

    const json = await throwExpected(
      async () => fetch.get(url),
    );

    return (json as unknown) as BillingPlan;
  }
}

export { PlanService };

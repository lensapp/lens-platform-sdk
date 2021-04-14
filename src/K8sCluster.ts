import type { Space } from "./Space";

/**
 *
 * @remarks
 * This interface should be generated using OpenAPI generator in the future.
 *
 * @alpha
 */
export interface K8scluster {
  id?: string;
  name: string;
  kind: string;
  region?: string;
  description?: string;
  ownerId?: string;
  createdById?: string;
  spaceId?: string;
  space?: Space;
}

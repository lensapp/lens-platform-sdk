import type { Space } from "./SpaceService";

/**
 *
 * @remarks
 * This interface should be generated using OpenAPI generator in the future.
 *
 * @alpha
 */
export interface K8sCluster {
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

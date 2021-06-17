import type { Space } from "./SpaceService";

/**
 *
 * @remarks
 * This interface should be generated using OpenAPI generator in the future.
 *
 * @alpha
 */
export interface K8sCluster {
  apiVersion?: string;
  id?: string;
  name: string;
  kind: string;
  region?: string;
  description?: string;
  createdById?: string;
  spaceId?: string;
  space?: Space;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  status?: {
    phase?: string;
    reason?: string;
    message?: string;
  };
}

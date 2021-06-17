import type { Space, SpaceEntity } from "./SpaceService";
import type { MapToEntity } from "./types/types";
import type { Except } from "type-fest";

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

export type K8sClusterEntity = Except<MapToEntity<K8sCluster>, "space"> & {
  space?: SpaceEntity;
};


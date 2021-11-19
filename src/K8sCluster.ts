import type { Space, SpaceEntity } from "./SpaceService";
import type { MapToEntity } from "./types/types";
import type { Except } from "type-fest";

// State of the DevCluster CRD
export type DevClusterCrdState = "Provisioning" | "Starting" | "Running" | "Stopping" | "Stopped" | "Terminating" | "Terminated";

// Possible status.phase of the K8sCluster in the backend
// This can be any CrdState and the others listed here.
// UI can in addition show "deleting", "connecting", "connected", "disconnected" as per typing in Lens.
export type Phase =
  Lowercase<DevClusterCrdState> |
  // Initial state is empty
  "" |
  "initializing" |
  "available" |
  "failed" |
  "tunneling";

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
    phase?: Phase;
    reason?: string;
    message?: string;
  };
}

export type K8sClusterEntity = Except<MapToEntity<K8sCluster>, "space"> & {
  space?: SpaceEntity;
};


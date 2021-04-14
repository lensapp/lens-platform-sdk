import type { Space } from "./Space";

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

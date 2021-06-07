import type { Space } from "./SpaceService";

/**
 *
 * @remarks
 * This interface should be generated using OpenAPI generator in the future.
 *
 * @alpha
 */
export interface InvitationDomain {
  id?: string;
  domain: string;
  createdById?: string;
  spaceId?: string;
  space?: Space;
  createdAt?: string;
  updatedAt?: string;
}

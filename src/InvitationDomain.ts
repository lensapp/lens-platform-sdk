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
export interface InvitationDomain {
  id?: string;
  domain: string;
  createdById?: string;
  spaceId?: string;
  space?: Space;
  createdAt?: string;
  updatedAt?: string;
}

export type InvitationDomainEntity = Except<MapToEntity<InvitationDomain>, "space"> & {
  space?: SpaceEntity;
};

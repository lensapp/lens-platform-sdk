import type { MapToEntity } from "./types/types";

/**
 *
 * @remarks
 * This interface should be generated using OpenAPI generator in the future.
 *
 * @alpha
 */
export interface CatalogAPI {
  id?: string;
  url?: string;
  certificateAuthority?: string;
  createdById?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CatalogAPIEntity = MapToEntity<CatalogAPI>;

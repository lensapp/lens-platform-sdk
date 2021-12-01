import type { MapToEntity } from "./types/types";

/**
 *
 * @remarks
 * This interface should be generated using OpenAPI generator in the future.
 *
 * @alpha
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface CatalogAPI {
  id?: string;
  url?: string;
  certificateAuthority?: string;
  createdById?: string;
  createdAt?: string;
  updatedAt?: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type CatalogAPIEntity = MapToEntity<CatalogAPI>;

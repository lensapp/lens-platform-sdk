import type { Space } from "./Space";
import type { User } from "./User";

/**
 *
 * @remarks
 * This interface should be generated using OpenAPI generator in the future.
 *
 * @alpha
 */
export interface Team {
  id?: string;
  name: string;
  description: string;
  kind?: string;
  createdById?: string;
  users?: [User];
  spaceId: string;
  space?: Space;
}

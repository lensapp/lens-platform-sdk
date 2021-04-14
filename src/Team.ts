import type { Space } from "./Space";
import type { User } from "./User";

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

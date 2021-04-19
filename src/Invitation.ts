import type { User } from "./User";

/**
 *
 * @remarks
 * This interface should be generated using OpenAPI generator in the future.
 *
 * @alpha
 */
export interface Invitation {
  spaceId?: string;
  spaceName?: string;
  invitedUsername?: string;
  kind?: string;
  id?: string;
  createdBy?: User;
  createdById?: string;
  createdAt?: Date;
  invitedEmail?: string;
  invitedUserId?: string;
  invitedUser?: User;
  state?: "pending" | "accepted" | "rejected" | "revoked";
  expiryTime?: string;
}

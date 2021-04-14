import type { User } from "./User";

export interface Invitation {
  spaceId?: string;
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

import { Base } from "./Base";
import type { User } from "./UserService";
import { Except } from "type-fest";

export const invitationEntityKinds = ["directInvite", "emailInvite", "weblinkInvite"] as const;
export type InvitationEntityKind = typeof invitationEntityKinds[number];

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
  spaceDescription?: string;
  invitedUsername?: string;
  kind?: InvitationEntityKind;
  id?: string;
  createdBy?: User;
  createdById?: string;
  createdAt?: Date;
  invitedEmail?: string;
  invitedUserId?: string;
  invitedUser?: User;
  state?: "pending" | "accepted" | "rejected" | "revoked";
  expiryTime?: Date | string;
}

/**
 *
 * The class for consuming all `invitation` resources.
 *
 * @remarks
 * This class should be generated using OpenAPI generator in the future.
 *
 * @alpha
 */
class InvitationService extends Base {
  /**
   * Get invitations
   */
  async getMany(): Promise<Invitation[]> {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/invitations`;
    const json = await got.get(url);

    return (json as unknown) as Invitation[];
  }

  /**
   * Create one invitation
   */
  async createOne(invitation: Invitation) {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/invitations`;

    const json = await got.post(url, {
      json: invitation
    });

    return json as Invitation & { weblink?: string };
  }

  /**
   * Update one invitation
   */
  async updateOne(invitation: Except<Invitation, "id"> & { id: string }): Promise<Invitation> {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/invitations/${invitation.id}`;

    const json = await got.patch(url, {
      json: invitation
    });

    return (json as unknown) as Invitation;
  }
}

export { InvitationService };

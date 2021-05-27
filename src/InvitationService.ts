import { Base } from "./Base";
import type { User } from "./UserService";
import {
  throwExpected,
  SpaceNotFoundException,
  PastExpiryException,
  UserAlreadyExistsException,
  PendingInvitationException,
  EmailMissingException,
  BadRequestException
} from "./exceptions";
import { Except } from "type-fest";

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
  kind?: string;
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
  async createOne(invitation: Invitation): Promise<Invitation> {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/invitations`;

    const json = await throwExpected(
      () => got.post(url, {
        json: invitation
      }),
      {
        404: (e: unknown) => new SpaceNotFoundException(`id: ${invitation.spaceId}`),
        422: (e: unknown) => {
          const msg: string = (e as any)?.message ?? "";

          if (msg.includes("is already in space")) {
            return new UserAlreadyExistsException(invitation.invitedUsername);
          }

          if (msg.includes("pending invitation")) {
            return new PendingInvitationException(invitation.invitedUsername);
          }

          if (msg.includes("email missing")) {
            return new EmailMissingException();
          }

          return new PastExpiryException();
        },
        400: () => new BadRequestException("Invalid invitation kind")
      }
    );

    return (json as unknown) as Invitation;
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

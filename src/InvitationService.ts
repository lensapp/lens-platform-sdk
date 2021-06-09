import { Base } from "./Base";
import type { User } from "./UserService";
import {
  throwExpected,
  SpaceNotFoundException,
  PastExpiryException,
  UserAlreadyExistsException,
  PendingInvitationException,
  EmailMissingException,
  BadRequestException,
  ForbiddenException,
  InvalidEmailDomainException
} from "./exceptions";
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

    const json = await throwExpected(
      () => got.post(url, {
        json: invitation
      }),
      {
        404: () => new SpaceNotFoundException(`id: ${invitation.spaceId}`),
        422: e => {
          const msg: string = e?.body.message ?? "";

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

    return json as Invitation & { weblink?: string };
  }

  /**
   * Update one invitation
   */
  async updateOne(invitation: Except<Invitation, "id"> & { id: string }): Promise<Invitation> {
    const { apiEndpointAddress, got } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/invitations/${invitation.id}`;

    const json = await throwExpected(
      () => got.patch(url, {
        json: invitation
      }),
      {
        403: error => {
          console.error(error);
          console.log(error?.body);
          console.log(error?.body?.message);
          if (error?.body?.message?.includes("your email address domain")) {
            return new InvalidEmailDomainException(error?.body?.message);
          }

          return new ForbiddenException();
        }
      }
    );

    return (json as unknown) as Invitation;
  }
}

export { InvitationService };

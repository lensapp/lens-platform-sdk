import { Base } from "./Base";
import type { User } from "./UserService";
import {
  throwExpected,
  SpaceNotFoundException,
  PastExpiryException,
  UserAlreadyExistsException,
  PendingInvitationException,
  EmailMissingException,
  ForbiddenException,
  InvalidEmailDomainException,
  NotFoundException,
} from "./exceptions";
import { Except } from "type-fest";
import type { MapToEntity } from "./types/types";
import { TeamEntityKind } from "./TeamService";

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
  createdAt?: string;
  updatedAt?: string;
  invitedEmail?: string;
  invitedUserId?: string;
  invitedUser?: User;
  state?: "pending" | "accepted" | "rejected" | "revoked";
  expiryTime?: Date | string;
  role?: TeamEntityKind;
}

export type InvitationEntity = MapToEntity<Invitation>;

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
   * Get invitation by id
   */
  async getOne({ id, queryString }: { id: string; queryString?: string }): Promise<Invitation> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/invitations/${id}${queryString ? `?${queryString}` : ""}`;

    const json = await throwExpected(
      async () => fetch.get(url),
      {
        404: () => new NotFoundException(),
      },
    );

    return (json as unknown) as Invitation;
  }

  /**
   * Get invitation by key
   */
  async getOneByKey({ key }: { key: string }): Promise<Invitation> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/invitations/by-key/${key}`;

    const json = await throwExpected(
      async () => fetch.get(url),
      {
        404: () => new NotFoundException(),
      },
    );

    return (json as unknown) as Invitation;
  }

  /**
   * Get invitations
   */
  async getMany(): Promise<Invitation[]> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/invitations`;
    const json = await fetch.get(url);

    return (json as unknown) as Invitation[];
  }

  /**
   * Create one invitation
   */
  async createOne(invitation: Invitation) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/invitations`;

    const json = await throwExpected(
      async () => fetch.post(url, invitation),
      {
        404: () => new SpaceNotFoundException(`id: ${invitation.spaceId}`),
        422(e) {
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
      },
    );

    return json as Invitation & { weblink?: string };
  }

  /**
   * Update one invitation
   */
  async updateOne(invitation: Except<Invitation, "id"> & { id: string }): Promise<Invitation> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/invitations/${invitation.id}`;

    const json = await throwExpected(
      async () => fetch.patch(url, invitation),
      {
        403(error) {
          const message = error?.body?.message;
          if (typeof message === "string" && message.includes("your email address domain")) {
            return new InvalidEmailDomainException(error?.body?.message);
          }

          return new ForbiddenException(error?.body?.message);
        },
      },
    );

    return (json as unknown) as Invitation;
  }
}

export { InvitationService };

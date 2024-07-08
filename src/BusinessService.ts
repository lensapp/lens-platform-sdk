import { Base } from "./Base";
import {
  throwExpected,
  ForbiddenException,
  UnprocessableEntityException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from "./exceptions";
import { BillingPageToken } from "./types/types";
import {
  BillingInfo,
  Invoice,
  SubscriptionInfo,
  SubscriptionSeat,
  SubscriptionState,
  User,
  UserAttribute,
} from "./UserService";
import { SSO } from "./SSOService";

/**
 * ^: This anchor matches the start of the string.
 * [A-Za-z0-9]: This matches any English letter or digit.
 * [A-Za-z0-9-]{2,14}: This character set matches any English letter,
 * digit or the - character, and repeats between 3 and 15 times.
 * [A-Za-z0-9]: This matches any English letter or digit.
 * $: This anchor matches the end of the string.
 */
export const businessHandleValidation = /^[A-Za-z0-9][A-Za-z0-9-]{2,14}[A-Za-z0-9]$/;

export type SubscriptionCustomField = {
  name: string;
  value: string;
};

export type SubscriptionChangePreview = {
  total?: number | null;
  subtotal?: number | null;
  tax?: number | null;
  unitAmount?: number | null;
  quantity?: number | null;
  balance?: number | null;
  credit?: number | null;
  taxRate?: number | null;
};

/**
 * "Lens Business ID"
 */
export type Business = {
  /**
   * The business id (in uuid format)
   */
  id: string;
  /**
   * The business name.
   */
  name: string;
  /**
   * The business handle.
   */
  handle: string;
  /**
   * The business address.
   */
  address: string;
  /**
   * The business additional address (a.k.a. "address line 2").
   */
  additionalAddress: string | null;
  /**
   * The business country.
   */
  country: string;
  /**
   * The business state / province.
   */
  state: string | null;
  /**
   * The business city.
   */
  city: string;
  /**
   * The business zip/postal code.
   */
  zip: string;
  /**
   * The business phone number.
   */
  phoneNumber: string;
  /**
   * The date the business was created.
   */
  createdAt: string;
  /**
   * The user id that created the business.
   */
  createdById: string;
  /**
   * The date the business was updated.
   */
  updatedAt: string;
  /**
   * The users that are in the business.
   */
  businessUsers: BusinessUser[];
  /**
   * External is true when a business is created by external provider.
   */
  external: boolean;
  /**
   * The website URL of the business
   */
  websiteUrl: string;
  /**
   * The department name of the business
   */
  department: string;
  /**
   * Recurly subscription ID for businesses migrated from Recurly.
   */
  businessIdLiteSubscriptionId: string | null | undefined;
  /**
   * If set to true by the admin, users will be automatically added to the business when they log in via SSO.
   */
  ssoAutoJoin?: boolean;
  /**
   * If true, the invited user will be automatically assigned to a subscription.
   */
  automaticSeatAssignment: boolean;
  /**
   * A list of verified domains.
   */
  verifiedDomains: VerifiedDomain[];
  /**
   * True if the business is a reseller.
   */
  reseller: boolean;
};

export type VerifiedDomain = {
  /**
   * The id of the verified domain entity.
   */
  id: string;
  /**
   * The business entity id that the verified domain belongs to.
   */
  businessId: string;
  /**
   * The id of the user created the verified domain entity.
   */
  createdById: string;
  /**
   * The id of the user updated the verified domain entity.
   */
  updatedById: string;
  /**
   * The created date of verified domain entity in ISO format, e.g. 2022-06-28T08:13:06.000Z.
   */
  createdAt: string;
  /**
   * The updated date of verified domain entity in ISO format, e.g. 2022-06-28T08:13:06.000Z.
   */
  updatedAt: string;
  /**
   * The verified domain without protocol/params/query.
   * e.g. "example.com.fi"
   */
  domain: string;
};

/**
 * The subscription that have been assigned to a user (`user_subscriptions` relation)
 */
export type UsedSeat = {
  /**
   * The id of user_subscriptions entity
   */
  id: string;
  /**
   * The id of subscription entity
   */
  subscriptionId: string;
  /**
   * The created data of user_subscriptions entity in ISO format, e.g. 2022-06-28T08:13:06.000Z
   */
  createdAt: string;
  /**
   * The updated data of user_subscriptions entity in ISO format, e.g. 2022-06-28T08:13:06.000Z
   */
  updatedAt: string;
  /**
   * The activation data of user_subscriptions entity in ISO format, e.g. 2022-06-28T08:13:06.000Z
   */
  activatedAt: string;
  /**
   * The de-activation data of user_subscriptions entity in ISO format, e.g. 2022-06-28T08:13:06.000Z
   */
  deactivatedAt: string | null;
  /**
   * Subscription seat used offline
   */
  offline: boolean;
  /**
   * The expiration data of user_subscriptions entity in ISO format, e.g. 2022-06-28T08:13:06.000Z
   */
  expiredAt: string | null;
  /**
   * The user that is assigned to this subscription
   */
  user: {
    /**
     * The id of the user
     */
    id: string;
    /**
     * The username of the user
     */
    username: string;
    /**
     * The first name of the user
     */
    firstName: string;
    /**
     * The last name of the user
     */
    lastName: string;
    /**
     * The full name of the user
     */
    fullname: string;
    /**
     * User's email address
     */
    email: string;
  } | null;
};

export type BusinessSubscription = {
  /**
   * Subscription ID
   */
  id: string;
  /**
   * Subscribed plan name (Recurly `subscription["plan"]["name"]`, e.g. "Pro")
   */
  planName: string;
  /**
   * Subscribed plan code (Recurly `subscription["plan"]["code"]`, e.g. "pro-monthly")
   */
  planCode: string;
  /**
   * Current billing period started at (Recurly subscription["currentPeriodStartedAt"] in ISO format.
   * e.g. 2022-06-28T08:13:06.000Z)
   */
  currentPeriodStartedAt: string | null;
  /**
   * Current billing period ends at (Recurly subscription["currentPeriodEndsAt"] in ISO format,
   * e.g. 2022-06-28T08:13:06.000Z)
   */
  currentPeriodEndsAt: string | null;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  companyName: string;
  accountCode: string;
  /**
   * State of the subscription
   */
  state: SubscriptionState;
  /**
   * Is a business account
   */
  isBusinessAccount: boolean;
  /**
   * string if the subscription is from a child business
   */
  fromChildBusinessId?: Business["id"];
  /**
   * Total number of seats in this subscription, including unassigned and assigned. (Recurly subscription["quantity"])
   */
  seats: number;
  /**
   * The subscription that have been assigned to a user (`user_subscriptions` relation)
   */
  usedSeats: UsedSeat[];
  /**
   * Subscription ID
   */
  shortSubscriptionId: string | null;
  /**
   * Change to subscription from next billing cycle
   */
  pendingChange: {
    activateAt: string | null;
    quantity: number | null;
  };

  unitAmount: number | null;

  customFields?: SubscriptionCustomField[];
};

export type BusinessUser = {
  /**
   * The id of the business user, `undefined` if user is invited but not yet have an account.
   */
  id?: string;
  /**
   * The username of the business user, `undefined` if user is invited but not yet have an account.
   */
  username?: string;
  /**
   * The email of the business user or the email of the invited user.
   */
  email: string;
  /**
   * The fullname of the business user, `undefined` if user is invited but not yet have an account.
   */
  fullname?: string;
  /**
   * The state of the user in the business.
   *   - `active` if the user is in the business.
   *   - `pendign` if the user is invited but not yet in the business.
   */
  state: BusinessInvitationState;
  /**
   * The role of the user in the business or the role of the invited user.
   */
  role: UserBusinessRole;
  /**
   * The createdTimestamp of the business user, `undefined` if user is invited but not yet have an account.
   */
  createdTimestamp?: string;
  /**
   * The firstName of the business user, `undefined` if user is invited but not yet have an account.
   */
  firstName?: string;
  /**
   * The lastName of the business user, `undefined` if user is invited but not yet have an account.
   */
  lastName?: string;
  /**
   * The date the user was invited to the business.
   * `undefined` if the user is not joined via invitation.
   */
  invitationCreatedAt?: string;

  /**
   * The users ID in business
   */
  businessUserId?: string;

  /**
   * The timestemp of the user's last usage of Lens (lens-cloud-extension)
   */
  lastAccess?: number;

  /**
   * The public user's attributes
   */
  userAttributes?: UserAttribute[];
};

export type BusinessUserSubscriptionSeat = Pick<
  SubscriptionSeat,
  "activatedAt" | "offline" | "deactivatedAt" | "expiredAt" | "active"
> & {
  subscription: Pick<SubscriptionInfo, "id" | "state">;
};

/**
 * Business user with subscription seats
 */
export type BusinessUserWithSeats = BusinessUser & {
  /**
   * The user's subscription seats, populated from the user's subscriptions
   */
  seats: BusinessUserSubscriptionSeat[];
};

export type UserBusinessRole = "Administrator" | "Member";
export type BusinessInvitationState = "pending" | "active";
export type BusinessUpdate = Partial<
  Omit<
    Business,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "businessUsers"
    | "external"
    | "businessIdLiteSubscriptionId"
    | "verifiedDomains"
    | "createdById"
  > & {
    verifiedDomains: Array<{
      domain: string;
    }>;
  }
>;

export type BusinessReplace = BusinessUpdate & {
  verifiedDomains: Array<{
    domain: string;
  }>;
};

export type BusinessInvitation = {
  /**
   * The business invitation ID
   */
  id: string;
  /**
   * The role of the invited user in the business
   */
  role: UserBusinessRole;
  /**
   * Email address of the invited user
   */
  email: string;
  /**
   * The subscription ID of the subscription that the invited user will be assigned to
   */
  subscriptionId?: string;
  /**
   * The state of the invitation
   */
  state: BusinessInvitationState;
  /**
   * The date the invitation was created.
   */
  createdAt: string;
  /**
   * The date the invitation was updated.
   */
  updatedAt: string;
  /**
   * The userId that creates the invitation.
   */
  createdById: string;
};

export type BusinessHierarchyInvitationState = "pending" | "accepted" | "rejected" | "canceled";
export type BusinessHierarchyInvitation = {
  /**
   * The id of the invitation.
   */
  id: string;
  /**
   * The invitation state.
   */
  state: BusinessHierarchyInvitationState;
  /**
   * The parent LBID id.
   */
  parentBusinessId: Business["id"];
  /**
   * The user id of the user who created the invitation
   */
  createdById: User["id"];
  /**
   * The date the invitation was created.
   */
  createdAt: string;
  /**
   * The date the invitation was updated.
   */
  updatedAt: string;
  /**
   * The token for joining as a child LBID.
   */
  token: string;
  /**
   * The date the invitation will expire.
   */
  expiryTime: string | null;
};

export enum SSOType {
  SAML = "saml",
  OIDC = "oidc",
}

export interface BusinessSsoSamlDto {
  /**
   * SSO Identity Provider SinOn URL
   */
  singleSignOnServiceUrl: string;
  /**
   * idpEntityId - The Entity ID, provided by SSO provider, that is used to uniquely identify.
   * this SAML Service Provider (from Keycloak docs)
   */
  idpEntityId: string;
  /**
   * SAML SSO type
   */
  type: SSOType.SAML;
}

export interface BusinessSsoOidcDto {
  /**
   * OIDC client ID
   */
  clientId: string;

  /**
   * OIDC client secret
   */
  clientSecret: string;

  /**
   * Identity Provider Token URL
   */
  tokenUrl: string;

  /**
   * JWKS URL
   */
  jwksUrl: string;

  /**
   * User Info URL
   */
  userInfoUrl: string;

  /**
   * Logout Url
   */
  logoutUrl: string;

  /**
   * Issuer
   */
  issuer: string;

  /**
   * Authorization URL
   */
  authorizationUrl: string;
  /**
   * OIDC SSO type
   */
  type: SSOType.OIDC;
}

export interface BusinessSSOWithIDPDetails extends SSO {
  business?: Business;
  config: BusinessSsoSamlDto | BusinessSsoOidcDto;
}

export interface BusinessSsoDto {
  /**
   * SSO config object.
   */
  config: BusinessSsoSamlDto | BusinessSsoOidcDto;
}

/**
 * Lens Business ID Feature
 */
export type BusinessFeature = {
  key: string;

  /**
   * Human readable name of the feature
   */
  name: string;

  /**
   * An optional description of the feature
   */
  description?: string;

  /**
   * Is the feature enabled for the LBID
   */
  enabled: boolean;
};

type Parent = Business & {
  /** The contact email of the LBID Recurly account */
  email: undefined | null | string;
};

type Child = Business & {
  /** The contact email of the LBID Recurly account */
  email: undefined | null | string;
};

export type BusinessJoinRequestState = "pending" | "accepted" | "rejected" | "canceled";
export type BusinessJoinRequest = {
  /**
   * The business join request ID
   */
  id: string;
  /**
   * The state of the join request
   */
  state: BusinessJoinRequestState;
  /**
   * The requesting business's id
   */
  businessId: string;
  /**
   * The user id of the user who created the join request
   */
  createdById: string;
  /**
   * The date the join request was created.
   */
  createdAt: string;
  /**
   * The date the join request was updated.
   */
  updatedAt: string;
  /**
   * The user id of the user who updated the join request
   */
  updatedById: string;
};
export type BusinessJoinRequestWithCreatedBy = BusinessJoinRequest & {
  /**
   * The user who created the join request
   *
   * @remarks Values will be undefined if the user account has been deleted.
   */
  createdBy: {
    username?: string;
    email?: string;
    fullname?: string;
    firstName?: string;
    lastName?: string;
  };
};

export type BusinessSCIMToken = {
  /**
   * The business SCIM token id
   */
  id: string;
  /**
   * TThe business entity id that the token for.
   */
  businessId: string;
  /**
   * The user id that creates the token.
   */
  createdById: User["id"];
  /**
   * The date the token was created.
   */
  createdAt: string;
  /**
   * The value of the token.
   */
  token: string;
};

class BusinessService extends Base {
  /**
   * Lists business entities ("Lens Business ID") that the authenticated user has explicit permissions to access.
   */
  async getMany(): Promise<Business[]> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses`;
    const json = await throwExpected(async () => fetch.get(url), {
      403: (error) => new ForbiddenException(error?.body.message),
    });

    return json as unknown as Business[];
  }

  /**
   * Get one business entity ("Lens Business ID") by id.
   */
  async getOne(id: Business["id"]): Promise<Business> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}`;
    const json = await throwExpected(async () => fetch.get(url), {
      404: (error) => new NotFoundException(error?.body.message),
      403: (error) => new ForbiddenException(error?.body.message),
    });

    return json as unknown as Business;
  }

  /**
   * Create a new business ("Lens Business ID").
   */
  async createOne(
    business: Omit<
      Business,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "businessUsers"
      | "external"
      | "ssoAutoJoin"
      | "businessIdLiteSubscriptionId"
      | "verifiedDomains"
      | "createdById"
    > & {
      id?: string;
      verifiedDomains: Array<{
        domain: string;
      }>;
    },
  ): Promise<Business> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses`;
    const json = await throwExpected(async () => fetch.post(url, business), {
      400: (error) => new BadRequestException(error?.body.message),
      422: (error) => new UnprocessableEntityException(error?.body.message),
      403: (error) => new ForbiddenException(error?.body.message),
      409: (error) => new ForbiddenException(error?.body.message),
    });

    return json as unknown as Business;
  }

  /**
   * Update an existing business ("Lens Business ID").
   */
  async updateOne(id: string, business: BusinessUpdate): Promise<Business> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}`;
    const json = await throwExpected(async () => fetch.patch(url, business), {
      400: (error) => new BadRequestException(error?.body.message),
      422: (error) => new UnprocessableEntityException(error?.body.message),
      401: (error) => new UnauthorizedException(error?.body.message),
      403: (error) => new ForbiddenException(error?.body.message),
      409: (error) => new ForbiddenException(error?.body.message),
    });

    return json as unknown as Business;
  }

  /**
   * Replace an existing business ("Lens Business ID").
   */
  async replaceOne(id: string, business: BusinessReplace): Promise<Business> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}`;
    const json = await throwExpected(async () => fetch.put(url, business), {
      400: (error) => new BadRequestException(error?.body.message),
      401: (error) => new UnauthorizedException(error?.body.message),
      403: (error) => new ForbiddenException(error?.body.message),
      409: (error) => new ForbiddenException(error?.body.message),
    });

    return json as unknown as Business;
  }

  /**
   * Disable business light activation link
   */
  async disableBusinessLightActivationLink(id: string): Promise<void> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}/activation-link`;

    await throwExpected(async () => fetch.delete(url), {
      400: (error) => new BadRequestException(error?.body.message),
      422: (error) => new UnprocessableEntityException(error?.body.message),
      401: (error) => new UnprocessableEntityException(error?.body.message),
      403: (error) => new ForbiddenException(error?.body.message),
    });
  }

  /**
   * Delete business entity ("Lens Business ID") by id.
   */
  async deleteOne(id: Business["id"]): Promise<void> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}`;

    await throwExpected(async () => fetch.delete(url), {
      403: (error) => new ForbiddenException(error?.body.message),
    });
  }

  /**
   * Delete user from the business.
   */
  async deleteBusinessUser(businessId: Business["id"], businessUserId: string): Promise<void> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${businessId}/users/${businessUserId}`;

    await throwExpected(async () => fetch.delete(url), {
      403: (error) => new ForbiddenException(error?.body.message),
      404: (error) => new NotFoundException(error?.body.message),
      422: (error) => new NotFoundException(error?.body.message),
    });
  }

  /**
   * Change existing business user role
   */
  async changeBusinessUserRole(
    businessId: Business["id"],
    businessUserId: string,
    role: UserBusinessRole,
  ): Promise<BusinessUser> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${businessId}/users/${businessUserId}`;
    const json = await throwExpected(async () => fetch.patch(url, { role }), {
      400: (error) => new BadRequestException(error?.body.message),
      401: (error) => new UnprocessableEntityException(error?.body.message),
      403: (error) => new ForbiddenException(error?.body.message),
    });

    return json as unknown as BusinessUser;
  }

  /**
   * Lists the subscriptions by id
   */
  async getSubscriptions(id: Business["id"]): Promise<BusinessSubscription[]> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}/subscriptions`;
    const json = await throwExpected(async () => fetch.get(url), {
      400: (error) => new BadRequestException(error?.body.message),
      404: (error) => new NotFoundException(error?.body.message),
      403: (error) => new ForbiddenException(error?.body.message),
    });

    return json as unknown as BusinessSubscription[];
  }

  /**
   * Create a new subscription by planCode
   *
   * @remarks only use by LBID that has a parent LBID and the parent has valid billing info.
   */
  async createSubscription(
    id: Business["id"],
    planCode: BusinessSubscription["planCode"],
    quantity: number,
  ): Promise<BusinessSubscription> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}/subscriptions`;
    const json = await throwExpected(async () => fetch.post(url, { planCode, quantity }), {
      400: (error) => new BadRequestException(error?.body.message),
      422: (error) => new NotFoundException(error?.body.message),
      403: (error) => new ForbiddenException(error?.body.message),
    });

    return json as unknown as BusinessSubscription;
  }

  /**
   * Activate user business subscription seat
   */
  async activateBusinessUserSubscription({
    businessId,
    businessSubscriptionId,
    businessInvitationId,
    userId,
  }: {
    businessId: string;
    businessSubscriptionId?: string;
    businessInvitationId?: string;
    userId?: string;
  }): Promise<UsedSeat> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${businessId}/subscription-seats`;
    const json = await throwExpected(
      async () =>
        fetch.post(url, {
          invitationId: businessInvitationId,
          subscriptionId: businessSubscriptionId,
          userId,
        }),
      {
        404: (error) => new NotFoundException(error?.body.message),
        400: (error) => new BadRequestException(error?.body.message),
        403: (error) => new ForbiddenException(error?.body.message),
        422: (error) => new UnprocessableEntityException(error?.body.message),
      },
    );

    return json as unknown as UsedSeat;
  }

  /**
   * Deactivate user business subscription seat
   * Request user has to be an owner of the subscription seat or Business Administrator
   */
  async deActivateBusinessUserSubscription({
    businessId,
    businessSubscriptionId,
    username,
  }: {
    businessId: string;
    businessSubscriptionId: string;
    username: string;
  }): Promise<UsedSeat> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${businessId}/subscription-seats/${businessSubscriptionId}`;
    const json = await throwExpected(async () => fetch.patch(url), {
      404: (error) => new NotFoundException(error?.body.message),
      400: (error) => new BadRequestException(error?.body.message),
      403: () =>
        new ForbiddenException(`Modification of user licenses for ${username} is forbidden`),
      422: (error) => new UnprocessableEntityException(error?.body.message),
    });

    return json as unknown as UsedSeat;
  }

  /**
   * Change business subscription seat quantity
   */
  async changeBusinessSubscriptionSeatsQuantity({
    businessId,
    businessSubscriptionId,
    quantity,
  }: {
    businessId: string;
    businessSubscriptionId: string;
    quantity: number;
  }): Promise<SubscriptionInfo> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${businessId}/subscriptions/${businessSubscriptionId}`;
    const json = await throwExpected(async () => fetch.patch(url, { quantity }), {
      404: (error) => new NotFoundException(error?.body.message),
      400: (error) => new BadRequestException(error?.body.message),
      403: () =>
        new ForbiddenException(
          `Modification of subscription for business ${businessId} is forbidden`,
        ),
      422: (error) => new UnprocessableEntityException(error?.body.message),
    });

    return json as unknown as SubscriptionInfo;
  }

  /**
   * Preview business subscription seat quantity change
   */
  async previewBusinessSubscriptionSeatsQuantityChange({
    businessId,
    businessSubscriptionId,
    quantity,
  }: {
    businessId: string;
    businessSubscriptionId: string;
    quantity: number;
  }): Promise<SubscriptionChangePreview> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${businessId}/subscriptions/${businessSubscriptionId}/change/preview`;
    const json = await throwExpected(async () => fetch.post(url, { quantity }), {
      404: (error) => new NotFoundException(error?.body.message),
      400: (error) => new BadRequestException(error?.body.message),
      403: () =>
        new ForbiddenException(
          `Modification of subscription for business ${businessId} is forbidden`,
        ),
      422: (error) => new UnprocessableEntityException(error?.body.message),
    });

    return json as unknown as SubscriptionChangePreview;
  }

  /**
   * Change business subscription custom fields
   */
  async updateBusinessSubscriptionCustomField({
    businessId,
    businessSubscriptionId,
    customField,
  }: {
    businessId: string;
    businessSubscriptionId: string;
    customField: SubscriptionCustomField;
  }): Promise<SubscriptionInfo> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${businessId}/subscriptions/${businessSubscriptionId}/custom-field`;
    const json = await throwExpected(async () => fetch.patch(url, customField), {
      404: (error) => new NotFoundException(error?.body.message),
      400: (error) => new BadRequestException(error?.body.message),
      403: () =>
        new ForbiddenException(
          `Modification of subscription for business ${businessId} is forbidden`,
        ),
      422: (error) => new UnprocessableEntityException(error?.body.message),
    });

    return json as unknown as SubscriptionInfo;
  }

  /**
   * Lists the users in the business by id
   */
  async getUsers(id: Business["id"]): Promise<BusinessUserWithSeats[]> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}/users`;
    const json = await throwExpected(async () => fetch.get(url), {
      404: (error) => new NotFoundException(error?.body.message),
      403: (error) => new ForbiddenException(error?.body.message),
    });

    return json as unknown as BusinessUserWithSeats[];
  }

  /**
   * Get the list of business invitations by business id
   */
  async getInvitations(id: Business["id"]): Promise<BusinessInvitation[]> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}/invitations`;
    const json = await throwExpected(async () => fetch.get(url), {
      403: (error) => new ForbiddenException(error?.body.message),
    });

    return json as unknown as BusinessInvitation[];
  }

  /**
   * Create a new invitation for a user to join a business, optionally assigning them to a
   * subscription by given subscriptionId.
   *
   * @remarks inviter has to be the administrator of the business
   */
  async createInvitation(
    id: Business["id"],
    email: string,
    subscriptionId?: string,
    role = "Member",
  ): Promise<{
    id: BusinessInvitation["id"];
    email: BusinessInvitation["email"];
    subscriptionId: BusinessInvitation["subscriptionId"];
    role: UserBusinessRole;
  }> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}/invitations`;
    const json = await throwExpected(async () => fetch.post(url, { email, subscriptionId, role }), {
      400: (error) => new BadRequestException(error?.body.message),
      409: (error) => new ConflictException(error?.body.message),
      422: (error) => new UnprocessableEntityException(error?.body.message),
      404: (error) => new NotFoundException(error?.body.message),
      403: (error) => new ForbiddenException(error?.body.message),
    });

    return json as unknown as {
      id: BusinessInvitation["id"];
      email: BusinessInvitation["email"];
      subscriptionId: BusinessInvitation["subscriptionId"];
      role: BusinessInvitation["role"];
    };
  }

  /**
   * Accept an invitation to join a business.
   */
  async acceptInvitation(id: Business["id"], invitationId: BusinessInvitation["id"]) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}/invitations/${invitationId}`;
    const json = await throwExpected(
      async () =>
        fetch.patch(url, {
          state: "active",
        }),
      {
        400: (error) => new BadRequestException(error?.body.message),
        422: (error) => new UnprocessableEntityException(error?.body.message),
        404: (error) => new NotFoundException(error?.body.message),
        403: (error) => new ForbiddenException(error?.body.message),
      },
    );

    return json as unknown as BusinessInvitation;
  }

  /**
   * Delete business invitation
   */
  async deleteInvitation(id: Business["id"], invitationId: BusinessInvitation["id"]) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}/invitations/${invitationId}`;
    const json = await throwExpected(async () => fetch.delete(url), {
      400: (error) => new BadRequestException(error?.body.message),
      404: (error) => new NotFoundException(error?.body.message),
      403: (error) => new ForbiddenException(error?.body.message),
    });

    return json as unknown as BusinessInvitation;
  }

  /**
   * Get token for Recurly hosted pages
   *
   * @remarks user has to be the administrator of the business
   */
  async getBillingPageToken(id: Business["id"]): Promise<BillingPageToken> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}/billing-page-token`;
    const json = await throwExpected(async () => fetch.get(url), {
      404: (error) => new NotFoundException(error?.body.message),
      403: () =>
        new ForbiddenException(`Getting the billing page token for businessId ${id} is forbidden`),
      422: (error) => new UnprocessableEntityException(error?.body.message),
    });

    return json as unknown as BillingPageToken;
  }

  /**
   * Create token for Recurly hosted pages
   *
   * @remarks user has to be the administrator of the business
   */
  async createBillingPageToken(id: Business["id"]): Promise<BillingPageToken> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}/billing-page-token`;
    const json = await throwExpected(async () => fetch.post(url), {
      404: (error) => new NotFoundException(error?.body.message),
      403: (error) => new ForbiddenException(error?.body.message),
      422: (error) => new UnprocessableEntityException(error?.body.message),
    });

    return json as unknown as BillingPageToken;
  }

  /**
   * Get business billing information
   *
   */
  async geBusinessBillingInformation(id: Business["id"]): Promise<BillingInfo> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}/billing`;
    const json = await throwExpected(async () => fetch.get(url), {
      404: () => new NotFoundException(`Business ${id} not found`),
      403: () =>
        new ForbiddenException(`Getting the billing information for business ${id} is forbidden`),
    });

    return json as unknown as BillingInfo;
  }

  /**
   * List all children LBIDs of a LBID.
   *
   * @remarks user has to be the administrator of the business.
   */
  async getChildren(id: Business["id"]): Promise<Child[]> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}/businesses`;
    const json = await throwExpected(async () => fetch.get(url), {
      403: (error) => new ForbiddenException(error?.body?.message),
      404: (error) => new NotFoundException(error?.body?.message),
    });

    return json as unknown as Child[];
  }

  /**
   * Remove all children LBIDs of a LBID.
   *
   * @remarks user has to be the administrator of the business.
   */
  async removeAllChildren(id: Business["id"]) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}/businesses`;

    await throwExpected(async () => fetch.delete(url), {
      403: (error) => new ForbiddenException(error?.body?.message),
      404: (error) => new NotFoundException(error?.body?.message),
    });
  }

  /**
   * Remove one child LBID of a LBID.
   *
   * @remarks user has to be the administrator of the business.
   * @returns the remaining children LBIDs.
   */
  async removeOneChild(parentId: Business["id"], childId: Business["id"]): Promise<Business[]> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${parentId}/businesses/${childId}`;
    const json = await throwExpected(async () => fetch.delete(url), {
      401: (error) => new UnauthorizedException(error?.body?.message),
      403: (error) => new ForbiddenException(error?.body?.message),
      404: (error) => new NotFoundException(error?.body?.message),
    });

    return json as unknown as Business[];
  }

  /**
   * Get the parent LBID of a LBID.
   *
   * @remarks One LBID can only have one parent.
   * @remarks user has to be the administrator of the business.
   */
  async getParent(id: Business["id"]): Promise<Parent> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}/parent`;
    const json = await throwExpected(async () => fetch.get(url), {
      403: (error) => new ForbiddenException(error?.body?.message),
      404: (error) => new NotFoundException(error?.body?.message),
    });

    return json as unknown as Parent;
  }

  /**
   * Remove the parent LBID of a LBID.
   *
   * @remarks user has to be the administrator of the business.
   */
  async removeParent(id: Business["id"]) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}/parent`;

    await throwExpected(async () => fetch.delete(url), {
      400: (error) => new BadRequestException(error?.body?.message),
      404: (error) => new NotFoundException(error?.body?.message),
    });
  }

  /**
   * Create a new 'hierarchy' invitation for a LBID to join another LBID as child account.
   *
   * @remarks should be used by parent LBID admins.
   */
  async createChildInvitation(parentId: Business["id"], expiryTime?: Date) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${parentId}/hierarchies/invitations`;
    const json = await throwExpected(
      async () => fetch.post(url, expiryTime ? { expiryTime } : {}),
      {
        403: (error) => new ForbiddenException(error?.body?.message),
        409: (error) => new ConflictException(error?.body?.message),
        422: (error) => new UnprocessableEntityException(error?.body?.message),
      },
    );

    return json as unknown as BusinessHierarchyInvitation;
  }

  /**
   * List all 'hierarchy' invitations by LBID id.
   *
   * @remarks should be used by parent LBID admins.
   */
  async getManyChildrenInvitation(parentId: Business["id"]) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${parentId}/hierarchies/invitations`;
    const json = await throwExpected(async () => fetch.get(url), {
      403: (error) => new ForbiddenException(error?.body?.message),
    });

    return json as unknown as BusinessHierarchyInvitation[];
  }

  /**
   * List all 'hierarchy' invitations by LBID id.
   *
   * @remarks should be used by child LBID admins.
   */
  async getOneChildrenInvitationByToken(token: BusinessHierarchyInvitation["token"]) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/hierarchies/invitations?token=${token}`;
    const json = await throwExpected(async () => fetch.get(url), {
      404: (error) => new NotFoundException(error?.body?.message),
      403: (error) => new ForbiddenException(error?.body?.message),
    });

    return json as unknown as BusinessHierarchyInvitation & { parentBusinessName: string };
  }

  /**
   * Update 'hierarchy' invitations by the invitation id and the LBID id.
   *
   * @remarks should be used by parent LBID admins.
   */
  async updateOneChildInvitation(
    parentId: Business["id"],
    invitationId: BusinessHierarchyInvitation["id"],
    state: "canceled",
  ) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${parentId}/hierarchies/invitations/${invitationId}`;
    const json = await throwExpected(async () => fetch.patch(url, { state }), {
      401: (error) => new UnauthorizedException(error?.body?.message),
      404: (error) => new NotFoundException(error?.body?.message),
      403: (error) => new ForbiddenException(error?.body?.message),
      422: (error) => new UnprocessableEntityException(error?.body?.message),
    });

    return json as unknown as BusinessHierarchyInvitation;
  }

  /**
   * Accept or reject or confirm the 'hierarchy' invitation by `token`.
   *
   * @remarks should be used by child LBID admins.
   */
  async acceptChildInvitation(
    childId: Business["id"],
    state: "accepted" | "rejected" | "confirmed",
    token: BusinessHierarchyInvitation["token"],
  ) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${childId}/hierarchies/invitations`;
    const json = await throwExpected(async () => fetch.patch(url, { state, token }), {
      400: (error) => new BadRequestException(error?.body?.message),
      403: (error) => new ForbiddenException(error?.body?.message),
      404: (error) => new NotFoundException(error?.body?.message),
      409: (error) => new ConflictException(error?.body?.message),
      422: (error) => new UnprocessableEntityException(error?.body?.message),
    });

    return json as unknown as BusinessHierarchyInvitation & {
      state: "accepted" | "rejected" | "confirmed";
    };
  }

  /**
   * List all invoices for a business
   *
   */
  async getBusinessInvoices(businessId: string): Promise<Invoice[]> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${businessId}/invoices`;
    const json = await throwExpected(async () => fetch.get(url), {
      404: () => new NotFoundException(`Business ${businessId} not found`),
      403: () => new ForbiddenException(`Getting the invoices for ${businessId} is forbidden`),
    });

    return json as unknown as Invoice[];
  }

  /**
   * Get business SSO details
   *
   */
  async getBusinessSSO(businessId: Business["id"]): Promise<BusinessSSOWithIDPDetails> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${businessId}/sso`;
    const json = await throwExpected(async () => fetch.get(url), {
      404: () => new NotFoundException(`Business ${businessId} not found`),
      403: () => new ForbiddenException(`Getting the SSO for ${businessId} is forbidden`),
    });

    return json as unknown as BusinessSSOWithIDPDetails;
  }

  /**
   * Create business SSO
   *
   */
  async createBusinessSSO(
    businessID: Business["id"],
    ssoSettings: BusinessSsoDto,
  ): Promise<BusinessSSOWithIDPDetails> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${businessID}/sso`;
    const json = await throwExpected(async () => fetch.post(url, ssoSettings), {
      403: (error) => new ForbiddenException(error?.body?.message),
      400: (error) => new BadRequestException(error?.body?.message),
      404: (error) => new NotFoundException(error?.body?.message),
      409: (error) => new ConflictException(error?.body?.message),
    });

    return json as unknown as BusinessSSOWithIDPDetails;
  }

  /**
   * Delete business SSO
   *
   */
  async removeBusinessSSO(id: Business["id"]) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${id}/sso`;

    await throwExpected(async () => fetch.delete(url), {
      400: (error) => new BadRequestException(error?.body?.message),
      403: (error) => new ForbiddenException(error?.body?.message),
      404: (error) => new NotFoundException(error?.body?.message),
    });
  }

  /**
   * Send business SSO activation emails
   *
   */
  async sendBusinessSSOActivationEmail(businessID: Business["id"]): Promise<void> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${businessID}/sso/activation-email`;

    await throwExpected(async () => fetch.post(url), {
      403: (error) => new ForbiddenException(error?.body?.message),
      400: (error) => new BadRequestException(error?.body?.message),
      422: (error) => new BadRequestException(error?.body?.message),
      404: (error) => new NotFoundException(error?.body?.message),
    });
  }

  /**
   * Get list of Lens Business ID features
   */
  async getBusinessFeatures(businessID: Business["id"]): Promise<Array<BusinessFeature>> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${businessID}/features`;
    const json = await throwExpected(async () => fetch.get(url), {
      404: (error) => new NotFoundException(error?.body?.message),
      403: (error) => new ForbiddenException(error?.body?.message),
    });

    return json as unknown as Array<BusinessFeature>;
  }

  /**
   * Update Lens Business ID features
   */
  async updateBusinessFeatures(
    businessID: Business["id"],
    features: Array<Pick<BusinessFeature, "key" | "enabled">>,
  ): Promise<Array<BusinessFeature>> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${businessID}/features`;
    const json = await throwExpected(async () => fetch.put(url, features), {
      401: (error) => new UnauthorizedException(error?.body?.message),
      404: (error) => new NotFoundException(error?.body?.message),
      403: (error) => new ForbiddenException(error?.body?.message),
      422: (error) => new UnprocessableEntityException(error?.body?.message),
    });

    return json as unknown as Array<BusinessFeature>;
  }

  /**
   * Get list of Lens Business ID join requests.
   *
   * @remarks should be used by LBID admins.
   */
  async getBusinessJoinRequests(
    businessID: Business["id"],
  ): Promise<Array<BusinessJoinRequestWithCreatedBy>> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${businessID}/join-requests`;
    const json = await throwExpected(async () => fetch.get(url), {
      403: (error) => new ForbiddenException(error?.body?.message),
    });

    return json as unknown as Array<BusinessJoinRequestWithCreatedBy>;
  }

  /**
   * Accept/reject/cancel a Lens Business ID join request.
   *
   * @remarks should be used by LBID admins for accept/reject, and by users for cancel.
   */
  async updateBusinessJoinRequest(
    businessID: Business["id"],
    joinRequestId: BusinessJoinRequest["id"],
    state: "accepted" | "rejected" | "canceled",
  ): Promise<BusinessJoinRequest> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${businessID}/join-requests/${joinRequestId}`;
    const json = await throwExpected(async () => fetch.patch(url, { state }), {
      403: (error) => new ForbiddenException(error?.body?.message),
      404: (error) => new NotFoundException(error?.body?.message),
      422: (error) => new UnprocessableEntityException(error?.body?.message),
    });

    return json as unknown as BusinessJoinRequest;
  }

  /**
   * Create a Lens Business ID join request.
   *
   * @remarks should be used to create the request to join a Lens Business ID.
   */
  async createBusinessJoinRequest(businessID: Business["id"]): Promise<BusinessJoinRequest> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${businessID}/join-requests`;
    const json = await throwExpected(async () => fetch.post(url), {
      403: (error) => new ForbiddenException(error?.body?.message),
      409: (error) => new ConflictException(error?.body?.message),
      422: (error) => new UnprocessableEntityException(error?.body?.message),
    });

    return json as unknown as BusinessJoinRequest;
  }

  /**
   * Get a list of Lens Business ID SCIM tokens.
   *
   * @remarks should be used by LBID admins.
   */
  async getBusinessSCIMTokens(businessID: Business["id"]): Promise<Array<BusinessSCIMToken>> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${businessID}/scimtokens`;
    const json = await throwExpected(async () => fetch.get(url), {
      403: (error) => new ForbiddenException(error?.body?.message),
    });

    return json as unknown as Array<BusinessSCIMToken>;
  }

  /**
   * Delete a Lens Business ID SCIM token.
   *
   * @remarks should be used by LBID admins.
   */
  async deleteBusinessSCIMToken(businessID: Business["id"], tokenId: BusinessSCIMToken["id"]) {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${businessID}/scimtokens/${tokenId}`;

    await throwExpected(async () => fetch.delete(url), {
      400: (error) => new BadRequestException(error?.body?.message),
      403: (error) => new ForbiddenException(error?.body?.message),
      404: (error) => new NotFoundException(error?.body?.message),
    });
  }

  /**
   * Create a Lens Business ID SCIM token.
   *
   * @remarks should be used by LBID admins.
   */
  async createBusinessSCIMToken(businessID: Business["id"]): Promise<BusinessSCIMToken> {
    const { apiEndpointAddress, fetch } = this.lensPlatformClient;
    const url = `${apiEndpointAddress}/businesses/${businessID}/scimtokens`;
    const json = await throwExpected(async () => fetch.post(url), {
      403: (error) => new ForbiddenException(error?.body?.message),
    });

    return json as unknown as BusinessSCIMToken;
  }
}

export { BusinessService };

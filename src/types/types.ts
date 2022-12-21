// Map each property to ToType for any property name in Keys
export type MapPropsToType<Type, Keys extends keyof Type, ToType> = {
  [Property in keyof Type]: Property extends Keys ? ToType : Type[Property];
};

// Map each property to Date for any property name in Keys
export type MapPropsToDate<Type, Keys extends keyof Type> = MapPropsToType<Type, Keys, Date>;

export interface EntityType {
  createdAt?: string;
  updatedAt?: string;
}

export type MapToEntity<Type extends EntityType> = MapPropsToDate<Type, "createdAt" | "updatedAt">;

export type LicenseType = "pro" | "personal" | "pro-trial";

export type License = {
  type: LicenseType;
  subscriptionId: string;
};

export type BillingPageToken = {
  hostedLoginToken: string;
};

// Map each property to ToType for any property name in Keys
export type MapPropsToType<Type, Keys extends keyof Type, ToType> = {
  [Property in keyof Type]: Property extends Keys ? ToType : Type[Property]
};

// Map each property to Date for any property name in Keys
export type MapPropsToDate<Type, Keys extends keyof Type> = MapPropsToType<Type, Keys, Date>;

export interface EntityType {
  createdAt?: string;
  updatedAt?: string;
}

export type MapToEntity<Type extends EntityType> = MapPropsToDate<Type, "createdAt" | "updatedAt">;

export enum LicenseType {
  proTrial = "pro-trial",
  proMonthly = "pro-monthly",
  proYearly = "pro-yearly",
  personal = "personal",
}
export type License = {
  type: LicenseType;
  subscriptionId: string;
};

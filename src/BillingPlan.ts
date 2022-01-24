/**
 *
 * @remarks
 * This interface should be generated using OpenAPI generator in the future.
 *
 * @alpha
 */
export interface BillingPlan {
  code: string;
  name: string;
  description: string;
  price: number;
  support: string;
  maxUsers: number;
  maxCatalogItems: number;
  maxClusters: number;
  maxTeams: number;
  invoicePreview?: {
    nextBillingDate: string;
    total: number;
    couponCredits: number;
    users?: {
      subtotal: number;
      quantity: number;
    };
    devClusters?: {
      standard?: {
        subtotal: number;
        quantity: number;
      };
    };
  };
  billingEnabled: boolean;
  trial?: {
    startedAt: string;
    endsAt: string;
    warningSentAt: string;
  };
}

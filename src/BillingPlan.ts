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
}

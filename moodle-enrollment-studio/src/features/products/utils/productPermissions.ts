export type RoleAccess = "ADMIN" | "MARKETING" | "SALES_REP";
export type TabId = "general" | "marketing" | "commercial";

export const PRODUCT_PERMISSIONS: Record<RoleAccess, {
  canCreateProduct: boolean;
  allowedTabs: TabId[];
  readonly: boolean;
  canEditAll: boolean;
}> = {
  ADMIN: {
    canCreateProduct: true,
    allowedTabs: ["general", "marketing", "commercial"],
    readonly: false,
    canEditAll: true,
  },
  MARKETING: {
    canCreateProduct: false,
    allowedTabs: ["marketing"],
    readonly: false,
    canEditAll: false,
  },
  SALES_REP: {
    canCreateProduct: false,
    allowedTabs: ["general", "marketing", "commercial"],
    readonly: true,
    canEditAll: false,
  },
};

export type UserRole = "ADMIN" | "SALES_SUPERVISOR" | "SALES_REP";

export interface UserAccountProfile {
  fullName: string;
  email: string;
  corporateEmail?: string;
  cellphone?: string;
  corporateCellphone?: string;
  role: UserRole;
  isActive: boolean;
}

export interface SalesSupervisorProfile {
  teamName?: string;
  maxSellers: number;
  discountLimitPercent: string;
  maxManualDiscount?: string;
  canAssignLeads: boolean;
  canReassignLeads: boolean;
  canApproveDiscounts: boolean;
  canCancelOrders: boolean;
  canViewAllTeamSales: boolean;
}

export interface SellerProfile {
  salesTarget: string;
}

export interface MyProfileData {
  role: UserRole;
  account: UserAccountProfile;
  supervisor: SalesSupervisorProfile | null;
  seller: SellerProfile | null;
}


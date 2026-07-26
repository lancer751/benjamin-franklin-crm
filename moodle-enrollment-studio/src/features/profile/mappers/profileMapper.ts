import type {
  SalesSupervisorProfile,
  SellerProfile,
  UserAccountProfile,
  UserRole,
} from "../types/profile.types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const optionalString = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized || undefined;
};

const numberString = (value: unknown, fallback = "0"): string => {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return optionalString(value) ?? fallback;
};

const numberValue = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : 0;
};

const booleanValue = (value: unknown): boolean => value === true;

export const isProfileRole = (value: unknown): value is UserRole =>
  value === "ADMIN" || value === "SALES_SUPERVISOR" || value === "SALES_REP";

export function mapUserAccountProfile(
  raw: unknown,
  authenticatedRole: UserRole,
): UserAccountProfile | null {
  if (!isRecord(raw)) return null;

  const firstName = optionalString(raw.first_name);
  const middleName = optionalString(raw.middle_name);
  const lastName = optionalString(raw.last_name);
  const email = optionalString(raw.email);
  const rawRole = isRecord(raw.role) ? raw.role.name : undefined;
  const role = isProfileRole(rawRole) ? rawRole : authenticatedRole;
  const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");

  if (!fullName || !email) return null;

  return {
    fullName,
    email,
    corporateEmail: optionalString(raw.corporate_email),
    cellphone: optionalString(raw.cellphone),
    corporateCellphone: optionalString(raw.corporate_cellphone),
    role,
    isActive: booleanValue(raw.is_active),
  };
}

export function mapSalesSupervisorProfile(
  raw: unknown,
): SalesSupervisorProfile | null {
  if (!isRecord(raw)) return null;

  return {
    teamName: optionalString(raw.team_name),
    maxSellers: numberValue(raw.max_sellers),
    discountLimitPercent: numberString(raw.discount_limit_percent),
    maxManualDiscount:
      raw.max_manual_discount === null
        ? undefined
        : numberString(raw.max_manual_discount),
    canAssignLeads: booleanValue(raw.can_assign_leads),
    canReassignLeads: booleanValue(raw.can_reassign_leads),
    canApproveDiscounts: booleanValue(raw.can_approve_discounts),
    canCancelOrders: booleanValue(raw.can_cancel_orders),
    canViewAllTeamSales: booleanValue(raw.can_view_all_team_sales),
  };
}

export function mapSellerProfile(raw: unknown): SellerProfile | null {
  if (!isRecord(raw)) return null;

  return {
    salesTarget: numberString(raw.sales_target),
  };
}


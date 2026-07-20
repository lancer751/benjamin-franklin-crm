import { NormalizedLead } from "../adapters/leadAdapter";

export interface DateRangeFilter {
  type: "ALL" | "TODAY" | "YESTERDAY" | "LAST_7_DAYS" | "THIS_MONTH" | "CUSTOM";
  customStartDate?: string;
  customEndDate?: string;
}

export interface SupervisorKPIs {
  activeSellers: number;
  conversionRate: number | null;
  totalSales: number;
  completedOrders: number;
  cancelledOrders: number;
}

export interface SellerInfo {
  id: string;
  name: string;
  email: string;
}

/**
 * Pure function to filter leads list based on UI selection criteria.
 */
export const filterLeads = (
  leads: NormalizedLead[],
  filters: {
    tipification: string;
    gender: string;
    dateRange: DateRangeFilter;
    searchQuery: string;
  }
): NormalizedLead[] => {
  if (!Array.isArray(leads)) return [];

  const { tipification, gender, dateRange, searchQuery } = filters;
  let startLimit: number | null = null;
  let endLimit: number | null = null;
  const now = new Date();

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime();
  const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();

  if (dateRange.type === "TODAY") {
    startLimit = startOfDay(now);
    endLimit = endOfDay(now);
  } else if (dateRange.type === "YESTERDAY") {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    startLimit = startOfDay(yesterday);
    endLimit = endOfDay(yesterday);
  } else if (dateRange.type === "LAST_7_DAYS") {
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    startLimit = startOfDay(sevenDaysAgo);
    endLimit = endOfDay(now);
  } else if (dateRange.type === "THIS_MONTH") {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    startLimit = startOfDay(firstDay);
    endLimit = endOfDay(now);
  } else if (dateRange.type === "CUSTOM") {
    if (filters.dateRange.customStartDate) {
      const parts = filters.dateRange.customStartDate.split("-");
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      startLimit = startOfDay(d);
    }
    if (filters.dateRange.customEndDate) {
      const parts = filters.dateRange.customEndDate.split("-");
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      endLimit = endOfDay(d);
    }
  }

  const query = searchQuery.trim().toLowerCase();

  return leads.filter((lead) => {
    const matchTipification = tipification === "ALL" || lead.lead_status === tipification;
    const matchGender = gender === "ALL" || lead.gender === gender;

    let matchDate = true;
    if (dateRange.type !== "ALL" && lead.created_at) {
      const leadTime = new Date(lead.created_at).getTime();
      if (!isNaN(leadTime)) {
        if (startLimit !== null && leadTime < startLimit) matchDate = false;
        if (endLimit !== null && leadTime > endLimit) matchDate = false;
      } else {
        matchDate = false;
      }
    }

    let matchSearch = true;
    if (query) {
      const fName = lead.first_name?.toLowerCase() || "";
      const mName = lead.middle_name?.toLowerCase() || "";
      const lName = lead.last_name?.toLowerCase() || "";
      const email = lead.email?.toLowerCase() || "";
      const fullName = lead.fullName?.toLowerCase() || "";

      matchSearch = (
        fName.includes(query) ||
        mName.includes(query) ||
        lName.includes(query) ||
        fullName.includes(query) ||
        email.includes(query)
      );
    }

    return matchTipification && matchGender && matchDate && matchSearch;
  });
};

/**
 * Pure function to extract the unique active sellers from leads list.
 */
export const extractSellers = (leads: NormalizedLead[]): SellerInfo[] => {
  const uniqueSellersMap = new Map<string, SellerInfo>();

  // Always pre-populate the virtual "UNASSIGNED" sheet
  uniqueSellersMap.set("UNASSIGNED", {
    id: "UNASSIGNED",
    name: "SIN ASIGNAR ⚠️",
    email: "Prospectos entrantes sin asesor"
  });

  if (!Array.isArray(leads)) return Array.from(uniqueSellersMap.values());

  leads.forEach((lead) => {
    (lead.campaignsEngaging || []).forEach((member) => {
      const uFirstName = member.seller?.user?.first_name;
      const uLastName = member.seller?.user?.last_name;

      if (uFirstName) {
        const sellerName = `${uFirstName} ${uLastName || ""}`.trim();
        const sId = member.assigned_to || sellerName.toLowerCase().replace(/\s+/g, "-");

        if (!uniqueSellersMap.has(sId)) {
          uniqueSellersMap.set(sId, {
            id: sId,
            name: sellerName.toUpperCase(),
            email: member.seller?.user?.email || "Asesor Comercial asignado"
          });
        }
      }
    });
  });

  return Array.from(uniqueSellersMap.values());
};

/**
 * Calculates Team KPIs exclusively from the complete sellers response.
 */
export const calculateSupervisorKPIs = (sellers: any[]): SupervisorKPIs => {
  const toNumber = (value: unknown) => {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  return {
    activeSellers: sellers.filter((seller) => seller.user?.is_active).length,
    conversionRate: null,
    totalSales: sellers.reduce((total, seller) => total + toNumber(seller.total_sales), 0),
    completedOrders: sellers.reduce((total, seller) => total + toNumber(seller.completed_orders), 0),
    cancelledOrders: sellers.reduce((total, seller) => total + toNumber(seller.canceled_orders), 0),
  };
};

// Define una interfaz estricta para el frontend basada en lo que consume tu UI
export interface CleanSellerProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  joinedAt: string;
  totalSales: number;
  // Métricas calculadas
  metrics: {
    calculatedSalesVolume: number;
    totalOrders: number;
    totalLeads: number;
    conversionRate: string;
  };
  // Estructuras de datos crudas pero tipadas
  campaigns: Array<{
    id: string;
    name: string;
    budget: number;
    status: string;
  }>;
  orders: Array<{
    id: string;
    createdAt: string;
    amount: number;
  }>;
}

/**
 * Convierte y limpia la respuesta cruda de los endpoints del backend
 * para que la UI trabaje con una estructura de datos predecible y segura.
 */
export function adaptSellerProfile(
  rawSeller: any,
  rawCampaignsData: any
): CleanSellerProfile {
  const user = rawSeller?.user || {};
  const orders = rawSeller?.orders || [];
  const campaignMembers = rawSeller?.campaignMembers || [];
  
  // Procesamiento seguro de campañas asignadas
  const rawCampaignsList = rawCampaignsData?.assignedCampaing || [];
  const campaigns = rawCampaignsList.map((c: any) => ({
    id: c.campaign?.id || "",
    name: c.campaign?.campaing_name || "Sin nombre",
    budget: Number(c.campaign?.initial_budget) || 0,
    status: c.campaign?.status || "INACTIVE",
  }));

  // Cálculos estadísticos aislados de la UI
  const totalLeads = campaignMembers.length;
  const totalOrders = orders.length;
  const conversionRate = totalLeads > 0 
    ? ((totalOrders / totalLeads) * 100).toFixed(1) 
    : "0.0";

  const calculatedSalesVolume = orders.reduce((acc: number, order: any) => {
    return acc + (Number(order.amount) || 0);
  }, 0);

  return {
    id: rawSeller?.id || "",
    userId: rawSeller?.user_id || "",
    fullName: `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "Vendedor",
    email: user?.email || "Sin correo",
    joinedAt: user?.created_at ? new Date(user.created_at).toLocaleDateString() : "No registrado",
    totalSales: Number(rawSeller?.total_sales) || 0,
    metrics: {
      calculatedSalesVolume,
      totalOrders,
      totalLeads,
      conversionRate,
    },
    campaigns,
    orders: orders.map((order: any) => ({
      id: order.id || "",
      createdAt: order.created_at || "",
      amount: Number(order.amount) || 0,
    })),
  };
}
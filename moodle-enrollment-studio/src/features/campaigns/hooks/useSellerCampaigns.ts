import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { getSellerCampaigns } from "@/features/users/services/userService";

export const useSellerCampaigns = () => {
  const { user } = useAuthStore();
  
  // Extraemos el id del usuario de manera segura (user.id es el user_id de la base de datos)
  const userId = user?.id || "";

  const { data: res, isLoading, isError, refetch } = useQuery({
    queryKey: ["seller-campaigns", userId],
    queryFn: () => getSellerCampaigns(userId),
    enabled: !!userId,
  });

  // Desempaquetado seguro del objeto retornado por Hono/Prisma
  const assignedCampaignList = (res as any)?.success && (res as any)?.data?.assignedCampaing
    ? (res as any).data.assignedCampaing
    : (res as any)?.assignedCampaing || [];

  // Mapeamos los elementos extrayendo la campaña interna
  const campaigns = assignedCampaignList.map((item: any) => {
    return item.campaing || item.campaign || item;
  }).filter(Boolean);

  const activeCampaignsCount = campaigns.filter((c: any) => c.status === "ACTIVE").length;
  
  const totalLeadsCount = campaigns.reduce(
    (acc: number, c: any) => acc + (c._count?.leadsOnCampaign || 0),
    0
  );

  return {
    campaigns,
    isLoading,
    isError,
    activeCampaignsCount,
    totalLeadsCount,
    refetch,
  };
};
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { getSellerCampaigns } from "@/features/users/services/userService";

export const useSellerCampaigns = () => {
  const { user } = useAuthStore();
  
  const sellerId = user?.seller?.id;

  const { data: res, isLoading, isError, refetch } = useQuery({
    queryKey: ["seller-campaigns", sellerId],
    queryFn: () => {
      if (!sellerId) throw new Error("Seller profile ID is required");
      return getSellerCampaigns(sellerId);
    },
    enabled: Boolean(sellerId),
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

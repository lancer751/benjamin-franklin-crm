import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { getSellerCampaigns } from "@/features/users/services/userService";

export const useSellerCampaigns = () => {
  const { user } = useAuthStore();
  
  // Soporte dual para sellerProfile o seller según el tipado
  const sellerId = (user as any)?.sellerProfile?.id || user?.seller?.id || "";

  const { data: res, isLoading, isError, refetch } = useQuery({
    queryKey: ["seller-campaigns", (user as any)?.sellerProfile?.id || user?.seller?.id],
    queryFn: () => getSellerCampaigns(sellerId),
    enabled: !!sellerId,
  });

  // Desempaquetado seguro del objeto retornado por Hono/Prisma
  // La respuesta exitosa suele contener 'success: true' y 'data' con 'assignedCampaing'
  const assignedCampaignList = (res as any)?.success && (res as any)?.data?.assignedCampaing
    ? (res as any).data.assignedCampaing
    : (res as any)?.assignedCampaing || [];

  // Mapeamos los elementos extrayendo la campaña interna ('campaing' debido al typo de la base de datos)
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

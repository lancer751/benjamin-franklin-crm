import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCampaigns, deleteCampaign } from "../services/campaignService";
import { toast } from "sonner";

export const useCampaigns = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [campaignToDelete, setCampaignToDelete] = useState<{ id: string; name: string } | null>(null);

  const itemsPerPage = 5;
  const queryClient = useQueryClient();

  // 1. Fetching de Datos Reales del Backend
  const { data: campaignsRes, isLoading, isError } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => getCampaigns(),
  });

  // CORRECCIÓN CRUCIAL DEL JSON: Intenta leer el array real en base a los formatos posibles
  const campaigns = (campaignsRes as any)?.data?.data?.campaings
    || (campaignsRes as any)?.data?.campaings
    || (campaignsRes as any)?.campaings
    || (campaignsRes as any)?.data
    || [];

  console.log("Data del Hook (campaignsRes):", campaignsRes);
  console.log("Data parseada (campaigns):", campaigns);

  // 2. Mutación de Eliminación
  const deleteMutation = useMutation({
    mutationFn: deleteCampaign,
    onSuccess: () => {
      toast.success("Campaña eliminada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setCampaignToDelete(null);
    },
    onError: (err) => {
      console.error(err);
      toast.error("Hubo un error al eliminar la campaña.");
    },
  });

  // 3. KPIs Dinámicos Calculados en Tiempo Real
  const totalBudget = campaigns.reduce((acc: number, c: any) => acc + (Number(c.initial_budget) || 0), 0);
  const totalSpent = campaigns.reduce((acc: number, c: any) => acc + (Number(c.total_spent) || 0), 0);
  const activeCampaigns = campaigns.filter((c: any) => c.status === "ACTIVE").length;
  const spentPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  // 4. Paginación del lado del Cliente
  const totalPages = Math.ceil(campaigns.length / itemsPerPage);
  const paginatedCampaigns = campaigns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return {
    campaigns,
    paginatedCampaigns,
    isLoading,
    isError,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    campaignToDelete,
    setCampaignToDelete,
    deleteMutation,
    totalBudget,
    totalSpent,
    activeCampaigns,
    spentPercent,
  };
};

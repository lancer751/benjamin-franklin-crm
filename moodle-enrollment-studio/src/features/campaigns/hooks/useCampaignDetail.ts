import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getCampaignById, 
  assignSellersToCampaign, 
  removeSellerFromCampaign, 
  deleteCampaign 
} from "../services/campaignService";
import { toast } from "sonner";

export const useCampaignDetail = (id: string | undefined) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showConfig, setShowConfig] = useState(false);
  const [showAssignSeller, setShowAssignSeller] = useState(false);

  const isMockId = id?.startsWith("camp-mock-");

  // Fetching detail data
  const { data, isLoading, isError } = useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      if (isMockId) {
        const mock = mockCampaigns.find(c => c.id === id);
        return { data: mock };
      }
      return getCampaignById(id!);
    },
    enabled: !!id,
  });

  // CORRECCIÓN DE DESERIALIZACIÓN: Soporte robusto de niveles relacionales
  const campaign = data?.data || data || null;

  // Mutation for assigning sellers
  const assignSellersMutation = useMutation({
    mutationFn: async (sellerIds: string[]) => {
      return assignSellersToCampaign(id!, { seller_ids: sellerIds });
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Asesores asignados con éxito");
        queryClient.invalidateQueries({ queryKey: ["campaign", id] });
        queryClient.invalidateQueries({ queryKey: ["campaigns"] });
        queryClient.invalidateQueries({ queryKey: ["leads"] });
        queryClient.invalidateQueries({ queryKey: ["all-leads"] });
        setShowAssignSeller(false);
      } else {
        toast.error(res.message || "Error al asignar asesores");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Error al asignar asesores");
    }
  });

  // Mutation for removing seller
  const removeSellerMutation = useMutation({
    mutationFn: async (sellerId: string) => {
      return removeSellerFromCampaign(id!, sellerId);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Asesor removido de la campaña correctamente.");
        queryClient.invalidateQueries({ queryKey: ["campaign", id] });
        queryClient.invalidateQueries({ queryKey: ["campaigns"] });
        queryClient.invalidateQueries({ queryKey: ["leads"] });
        queryClient.invalidateQueries({ queryKey: ["all-leads"] });
      } else {
        toast.error(res.message || "Error al remover al asesor.");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Error al remover al asesor.");
    }
  });

  // Mutation for deleting campaign
  const deleteCampaignMutation = useMutation({
    mutationFn: async () => {
      return deleteCampaign(id!);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Campaña eliminada correctamente.");
        navigate("/campanas");
      } else {
        toast.error(res.message || "Error al eliminar la campaña.");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Error al eliminar la campaña.");
    }
  });

  return {
    campaign,
    isLoading,
    isError,
    showConfig,
    setShowConfig,
    showAssignSeller,
    setShowAssignSeller,
    assignSellersMutation,
    removeSellerMutation,
    deleteCampaignMutation,
  };
};

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getCampaignById, 
  assignSellersToCampaign, 
  removeSellerFromCampaign, 
  deleteCampaign,
  getCampaignMembers,
  reassignBulkCampaignMembers
} from "../services/campaignService";
import { toast } from "sonner";

export const useCampaignDetail = (id: string | undefined) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAssignSeller, setShowAssignSeller] = useState(false);

  const isMockId = id?.startsWith("camp-mock-");

  // Fetching detail data
  const { data, isLoading, isError } = useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      if (isMockId) {
        const mock = (globalThis as any).mockCampaigns?.find((c: any) => c.id === id);
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

  // Mutation for retiring and reassigning seller (Compound Flow)
  const retireAndReassignSellerMutation = useMutation({
    mutationFn: async ({ sellerId, targetSellerId }: { sellerId: string; targetSellerId: string }) => {
      const campaignId = id!;

      // PASO 1 — Obtener prospectos asignados al asesor en esta campaña
      // Usamos limit: 100 para no superar la validación max(100) del backend
      const response = await getCampaignMembers(campaignId, {
        assigned_to: sellerId,
        limit: 100,
      });

      // PASO 2 — Extraer la lista de forma defensiva
      // El backend puede devolver: array directo, { data: [] }, { data: { data: [] } }
      let memberList: any[] | null = null;

      if (Array.isArray(response)) {
        // Caso A: la respuesta ES directamente el array
        memberList = response;
      } else if (response && Array.isArray((response as any).data)) {
        // Caso B: { success: true, data: [...] }  ← forma más habitual
        memberList = (response as any).data;
      } else if (response && Array.isArray((response as any)?.data?.data)) {
        // Caso C: { success: true, data: { data: [...], pagination: {} } }  ← paginado anidado
        memberList = (response as any).data.data;
      }

      if (!Array.isArray(memberList)) {
        // No pudimos resolver la lista — detenemos aquí para no avanzar al DELETE
        throw new Error(
          `No se pudo obtener la lista de prospectos del asesor para la reasignación. Respuesta inesperada del servidor: ${JSON.stringify(response)}`
        );
      }

      const memberIds: string[] = memberList.map((m: any) => m.id).filter(Boolean);

      // PASO 3 — Si hay leads, reasignarlos en bloque
      if (memberIds.length > 0) {
        const reassignRes = await reassignBulkCampaignMembers(campaignId, {
          member_ids: memberIds,
          assigned_to: targetSellerId,
        });

        if (!reassignRes || !(reassignRes as any).success) {
          throw new Error(
            (reassignRes as any)?.message ||
              "La reasignación masiva de prospectos falló. El asesor NO ha sido retirado."
          );
        }
      }

      // PASO 4 — Con los leads ya reasignados (o si eran 0), retirar al asesor
      const removeRes = await removeSellerFromCampaign(campaignId, sellerId);
      if (!removeRes || !removeRes.success) {
        throw new Error(
          removeRes?.message || "Error al retirar al asesor de la campaña tras la reasignación."
        );
      }

      return removeRes;
    },
    onSuccess: () => {
      toast.success("Asesor retirado y leads reasignados correctamente.");
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["all-leads"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Error en el proceso de retiro y reasignación.");
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
    showAssignSeller,
    setShowAssignSeller,
    assignSellersMutation,
    retireAndReassignSellerMutation,
    deleteCampaignMutation,
  };
};

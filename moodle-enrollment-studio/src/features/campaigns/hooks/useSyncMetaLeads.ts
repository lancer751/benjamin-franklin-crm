import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CampaignServiceError,
  syncMetaLeads,
  type SyncMetaLeadsResponse,
} from "../services/campaignService";

const getSuccessMessage = (response?: SyncMetaLeadsResponse | null) => {
  const checked = response?.data?.checked;
  const processed = response?.data?.processed;

  if (typeof processed === "number" && processed === 0) {
    return "No se encontraron leads nuevos para importar.";
  }

  if (typeof checked === "number" && typeof processed === "number") {
    return `Sincronización completada: ${checked} registros revisados y ${processed} leads importados.`;
  }

  return "Sincronización completada correctamente.";
};

const getErrorMessage = (error: unknown) => {
  if (!(error instanceof CampaignServiceError)) {
    return "No se pudo completar la sincronización.";
  }

  if (error.status === 401 || error.status === 403) {
    return "No tienes permisos para sincronizar esta campaña.";
  }

  if (error.status === 404) {
    return "No se encontró la campaña o el formulario vinculado.";
  }

  if (error.status === 409) {
    return "La campaña no cumple las condiciones para sincronizar.";
  }

  if (error.status >= 500) {
    return "No se pudieron obtener los leads desde Meta. Revisa la integración y vuelve a intentarlo.";
  }

  return error.safeMessage || "No se pudo completar la sincronización.";
};

export const useSyncMetaLeads = (
  campaignId: string,
  onSuccess?: () => void,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => syncMetaLeads(campaignId),
    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] }),
        queryClient.invalidateQueries({
          queryKey: ["campaign-members", campaignId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["campaign-members-seller", campaignId],
        }),
        queryClient.invalidateQueries({ queryKey: ["leads"] }),
      ]);
      toast.success(getSuccessMessage(response));
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

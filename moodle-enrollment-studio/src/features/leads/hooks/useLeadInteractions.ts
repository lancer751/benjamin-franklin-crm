import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { requireSuccess, unwrapDetailList } from "../adapters/leadDetailAdapter";
import type { LeadInteraction } from "../components/lead-detail/leadDetail.types";
import type { InteractionFormData } from "../schemas/leadDetailActionSchemas";
import { createMemberInteraction, getMemberInteractions } from "../services/leadService";

export function useLeadInteractions(campaignId: string, memberId: string, sellerId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["lead-interactions", campaignId, memberId] as const;
  const query = useQuery({
    queryKey,
    queryFn: () => getMemberInteractions(campaignId, memberId),
    enabled: Boolean(campaignId && memberId),
  });
  const createMutation = useMutation({
    mutationFn: async (data: InteractionFormData) => {
      if (!sellerId) throw new Error("No se encontró un asesor válido para registrar la interacción.");
      const response = await createMemberInteraction(campaignId, memberId, data.notes, data.type, sellerId);
      requireSuccess(response, "No fue posible registrar la interacción.");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
      toast.success("Interacción registrada correctamente.");
    },
  });
  return { query, interactions: unwrapDetailList<LeadInteraction>(query.data, "interactions"), createMutation };
}

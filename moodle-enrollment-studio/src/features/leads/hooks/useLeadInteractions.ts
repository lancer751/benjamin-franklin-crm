import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { requireSuccess, unwrapDetailList } from "../adapters/leadDetailAdapter";
import type { LeadInteraction } from "../components/lead-detail/leadDetail.types";
import type { InteractionFormData } from "../schemas/leadDetailActionSchemas";
import { createMemberInteraction, getMemberInteractions } from "../services/leadService";

export function useLeadInteractions(campaignId: string, memberId: string, creatorUserId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["lead-interactions", campaignId, memberId] as const;
  const query = useQuery({
    queryKey,
    queryFn: () => getMemberInteractions(campaignId, memberId),
    enabled: Boolean(campaignId && memberId),
  });
  const createMutation = useMutation({
    mutationFn: async (data: InteractionFormData) => {
      if (!creatorUserId) throw new Error("No se encontró el identificador del usuario autenticado.");
      const response = await createMemberInteraction(campaignId, memberId, data.notes, data.type, creatorUserId);
      requireSuccess(response, "No fue posible registrar la interacción.");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
      toast.success("Interacción registrada correctamente.");
    },
  });
  return { query, interactions: unwrapDetailList<LeadInteraction>(query.data, "interactions"), createMutation };
}

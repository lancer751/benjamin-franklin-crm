import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CampaignMemberStatus } from "@/core/constants/campaignMemberStatus";
import { requireSuccess } from "../adapters/leadDetailAdapter";
import { updateCampaignMemberStatus } from "../services/leadService";

interface ChangeCampaignStageInput {
  campaignId: string;
  memberId: string;
  status: CampaignMemberStatus;
}

export function useCampaignMemberStatus(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ChangeCampaignStageInput) => {
      let response: unknown;
      try {
        response = await updateCampaignMemberStatus(input);
      } catch {
        throw new Error("No fue posible actualizar la etapa. Inténtalo nuevamente.");
      }
      requireSuccess(response, "No fue posible actualizar la etapa. Inténtalo nuevamente.");
      return input;
    },
    onSuccess: async ({ campaignId, memberId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["lead", leadId] }),
        queryClient.invalidateQueries({ queryKey: ["leads"] }),
        queryClient.invalidateQueries({ queryKey: ["all-leads"] }),
        queryClient.invalidateQueries({ queryKey: ["campaign-members", campaignId] }),
        queryClient.invalidateQueries({ queryKey: ["campaign-members-seller", campaignId] }),
        queryClient.invalidateQueries({ queryKey: ["seller-assigned-campaigns"] }),
        queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] }),
        queryClient.invalidateQueries({ queryKey: ["campaigns"] }),
        queryClient.invalidateQueries({ queryKey: ["lead-interactions", campaignId, memberId] }),
        queryClient.invalidateQueries({ queryKey: ["lead-tasks", campaignId, memberId] }),
        queryClient.invalidateQueries({ queryKey: ["member-interactions", memberId] }),
        queryClient.invalidateQueries({ queryKey: ["member-tasks", memberId] }),
      ]);
      toast.success("Etapa actualizada correctamente.");
    },
  });
}

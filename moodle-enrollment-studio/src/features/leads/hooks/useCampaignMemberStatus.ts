import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CampaignMemberStatus } from "@/core/constants/campaignMemberStatus";
import { requireSuccess } from "../adapters/leadDetailAdapter";
import { updateCampaignMemberStatus } from "../services/leadService";
import { campaignQueryKeys } from "@/features/campaigns/queryKeys";
import { sellerKeys } from "@/features/users/queryKeys";
import { campaignMemberKeys, leadKeys } from "../queryKeys";

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
        queryClient.invalidateQueries({ queryKey: leadKeys.detail(leadId) }),
        queryClient.invalidateQueries({ queryKey: leadKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: campaignMemberKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: sellerKeys.all }),
        queryClient.invalidateQueries({ queryKey: campaignQueryKeys.detail(campaignId) }),
        queryClient.invalidateQueries({ queryKey: campaignQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: campaignMemberKeys.interactions(campaignId, memberId) }),
        queryClient.invalidateQueries({ queryKey: campaignMemberKeys.tasks(campaignId, memberId) }),
      ]);
      toast.success("Etapa actualizada correctamente.");
    },
  });
}

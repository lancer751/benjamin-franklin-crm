import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  reassignBulkCampaignMembers,
  reassignCampaignMember,
  type ReassignCampaignMemberParams,
  type ReassignCampaignMembersBulkParams,
} from "@/features/campaigns/services/campaignService";

const isSuccessResponse = (response: unknown): boolean =>
  typeof response === "object" && response !== null && Reflect.get(response, "success") === true;

const requireSuccess = (response: unknown) => {
  if (isSuccessResponse(response)) return;
  const message = typeof response === "object" && response !== null
    ? Reflect.get(response, "message")
    : undefined;
  throw new Error(typeof message === "string" ? message : "Campaign member reassignment failed");
};

export function useCampaignMemberReassignment() {
  const queryClient = useQueryClient();
  const refresh = async (campaignId: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["team-follow-up", "campaign-members", campaignId] }),
      queryClient.invalidateQueries({ queryKey: ["campaign-members", campaignId] }),
      queryClient.invalidateQueries({ queryKey: ["campaign-members-seller", campaignId] }),
      queryClient.invalidateQueries({ queryKey: ["campaigns", "team-follow-up"] }),
      queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] }),
      queryClient.invalidateQueries({ queryKey: ["campaigns"] }),
    ]);
  };

  const reassignOne = useMutation({
    mutationFn: async (params: ReassignCampaignMemberParams) => {
      const response = await reassignCampaignMember(params);
      requireSuccess(response);
    },
    onSuccess: async (_, params) => refresh(params.campaignId),
  });

  const reassignMany = useMutation({
    mutationFn: async ({ campaignId, memberIds, assignedTo }: ReassignCampaignMembersBulkParams) => {
      const response = await reassignBulkCampaignMembers(campaignId, {
        member_ids: memberIds,
        assigned_to: assignedTo,
      });
      requireSuccess(response);
    },
    onSuccess: async (_, params) => refresh(params.campaignId),
  });

  return { reassignOne, reassignMany };
}

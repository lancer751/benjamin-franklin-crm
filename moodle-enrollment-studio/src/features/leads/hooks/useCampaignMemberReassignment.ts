import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  reassignBulkCampaignMembers,
  reassignCampaignMember,
  type ReassignCampaignMemberParams,
  type ReassignCampaignMembersBulkParams,
} from "@/features/campaigns/services/campaignService";
import { campaignQueryKeys } from "@/features/campaigns/queryKeys";
import { campaignMemberKeys } from "../queryKeys";
import { sellerKeys } from "@/features/users/queryKeys";

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
      queryClient.invalidateQueries({ queryKey: campaignMemberKeys.lists() }),
      queryClient.invalidateQueries({ queryKey: campaignQueryKeys.detail(campaignId) }),
      queryClient.invalidateQueries({ queryKey: campaignQueryKeys.lists() }),
      queryClient.invalidateQueries({ queryKey: sellerKeys.details() }),
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

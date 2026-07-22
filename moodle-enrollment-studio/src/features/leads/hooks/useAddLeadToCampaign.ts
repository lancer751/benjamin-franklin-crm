import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getCampaigns } from "@/features/campaigns/services/campaignService";
import { getSellerCampaigns } from "@/features/users/services/userService";
import { adaptAvailableCampaigns, adaptSellerAvailableCampaigns, createdMemberIdFrom, requireSuccess } from "../adapters/leadDetailAdapter";
import { addLeadToCampaign } from "../services/leadService";

interface AddCampaignInput { campaignId: string; sellerId: string; source: "FACEBOOK" | "INSTAGRAM" | "TIKTOK" | "WHATSAPP" | "WEBSITE" }

export function useAddLeadToCampaign(leadId: string, role: string, authenticatedSellerId: string, associatedCampaignIds: Set<string>, onAdded: (memberId: string) => void) {
  const queryClient = useQueryClient();
  const isSalesRep = role === "SALES_REP";
  const campaignsQuery = useQuery({
    queryKey: ["campaigns", "lead-detail", 1, 100],
    queryFn: () => getCampaigns({ page: "1", limit: "100" }),
    enabled: !isSalesRep,
  });
  const sellerCampaignsQuery = useQuery({
    queryKey: ["seller-campaigns", authenticatedSellerId],
    queryFn: () => getSellerCampaigns(authenticatedSellerId),
    enabled: isSalesRep && Boolean(authenticatedSellerId),
  });
  const campaigns = useMemo(() => {
    const options = isSalesRep
      ? adaptSellerAvailableCampaigns(sellerCampaignsQuery.data, authenticatedSellerId)
      : adaptAvailableCampaigns(campaignsQuery.data);
    return options.filter((campaign) => !associatedCampaignIds.has(campaign.id));
  }, [associatedCampaignIds, authenticatedSellerId, campaignsQuery.data, isSalesRep, sellerCampaignsQuery.data]);

  const mutation = useMutation({
    mutationFn: async (input: AddCampaignInput) => {
      const response = await addLeadToCampaign(input.campaignId, {
        lead_id: leadId,
        campaing_id: input.campaignId,
        assigned_to: isSalesRep ? authenticatedSellerId : input.sellerId,
        source: input.source,
        is_primary: false,
      }, isSalesRep ? authenticatedSellerId : input.sellerId);
      requireSuccess(response, "No fue posible agregar el prospecto a la campaña.");
      return response;
    },
    onSuccess: async (response) => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["lead", leadId] }),
        queryClient.invalidateQueries({ queryKey: ["leads"] }),
      ]);
      toast.success("Prospecto agregado a la campaña correctamente.");
      onAdded(createdMemberIdFrom(response));
    },
  });

  return {
    campaigns,
    isLoading: isSalesRep ? sellerCampaignsQuery.isLoading : campaignsQuery.isLoading,
    isError: isSalesRep ? sellerCampaignsQuery.isError : campaignsQuery.isError,
    mutation,
  };
}

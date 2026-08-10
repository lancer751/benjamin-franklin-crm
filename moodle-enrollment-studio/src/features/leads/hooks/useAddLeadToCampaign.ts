import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getCampaigns } from "@/features/campaigns/services/campaignService";
import { getSellerCampaigns, getSellers } from "@/features/users/services/userService";
import { adaptAvailableCampaigns, adaptSellerAvailableCampaigns, createdMemberIdFrom, requireSuccess } from "../adapters/leadDetailAdapter";
import { addLeadToCampaign } from "../services/leadService";
import { campaignQueryKeys } from "@/features/campaigns/queryKeys";
import { sellerKeys } from "@/features/users/queryKeys";
import { campaignMemberKeys, leadKeys } from "../queryKeys";

interface AddCampaignInput { campaignId: string; sellerId: string; source: "FACEBOOK" | "INSTAGRAM" | "TIKTOK" | "WHATSAPP" | "WEBSITE" }

export function useAddLeadToCampaign(
  leadId: string,
  role: string,
  authenticatedUserId: string,
  authenticatedSellerProfileId: string,
  associatedCampaignIds: Set<string>,
  onAdded: (memberId: string) => void,
) {
  const queryClient = useQueryClient();
  const isSalesRep = role === "SALES_REP";
  const campaignsQuery = useQuery({
    queryKey: campaignQueryKeys.list({ page: "1", limit: "100" }),
    queryFn: () => getCampaigns({ page: "1", limit: "100" }),
    enabled: !isSalesRep,
  });
  const sellerCampaignsQuery = useQuery({
    queryKey: sellerKeys.campaigns(authenticatedSellerProfileId),
    queryFn: () => getSellerCampaigns(authenticatedSellerProfileId),
    enabled: isSalesRep && Boolean(authenticatedSellerProfileId),
  });
  const sellersQuery = useQuery({
    queryKey: sellerKeys.list(),
    queryFn: getSellers,
    enabled: !isSalesRep,
  });
  const campaigns = useMemo(() => {
    const options = isSalesRep
      ? adaptSellerAvailableCampaigns(
          sellerCampaignsQuery.data,
          authenticatedUserId,
          authenticatedSellerProfileId,
        )
      : adaptAvailableCampaigns(campaignsQuery.data, sellersQuery.data);
    return options.filter((campaign) => !associatedCampaignIds.has(campaign.id));
  }, [
    associatedCampaignIds,
    authenticatedSellerProfileId,
    authenticatedUserId,
    campaignsQuery.data,
    isSalesRep,
    sellerCampaignsQuery.data,
    sellersQuery.data,
  ]);

  const mutation = useMutation({
    mutationFn: async (input: AddCampaignInput) => {
      const selectedCampaign = campaigns.find((campaign) => campaign.id === input.campaignId);
      const selectedSeller = selectedCampaign?.sellers.find((seller) => seller.userId === input.sellerId);
      const assignedUserId = isSalesRep ? authenticatedUserId : selectedSeller?.userId || "";
      const sellerProfileId = isSalesRep
        ? authenticatedSellerProfileId
        : selectedSeller?.sellerProfileId || "";
      if (!assignedUserId || !sellerProfileId) {
        throw new Error("Selecciona un asesor asignado a la campaña.");
      }

      const response = await addLeadToCampaign(input.campaignId, {
        lead_id: leadId,
        campaing_id: input.campaignId,
        assigned_to: assignedUserId,
        source: input.source,
        is_primary: false,
      });
      requireSuccess(response, "No fue posible agregar el prospecto a la campaña.");
      return response;
    },
    onSuccess: async (response, input) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: leadKeys.detail(leadId) }),
        queryClient.invalidateQueries({ queryKey: leadKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: campaignMemberKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: campaignQueryKeys.detail(input.campaignId) }),
      ]);
      toast.success("Prospecto agregado a la campaña correctamente.");
      onAdded(createdMemberIdFrom(response));
    },
  });

  return {
    campaigns,
    isLoading: isSalesRep
      ? sellerCampaignsQuery.isLoading
      : campaignsQuery.isLoading || sellersQuery.isLoading,
    isError: isSalesRep
      ? sellerCampaignsQuery.isError
      : campaignsQuery.isError || sellersQuery.isError,
    mutation,
  };
}

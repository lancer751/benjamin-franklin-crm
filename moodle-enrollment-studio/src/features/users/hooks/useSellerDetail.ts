import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSellerCampaigns, getSellerProfileById } from "../services/userService";
import { adaptSellerProfile } from "../adapters/seller.adapter";

export function useSellerDetail(sellerUserId?: string) {
  const { id: routeId } = useParams<{ id: string }>();
  const id = (sellerUserId ?? routeId)?.trim();
  const hasSellerId = Boolean(id);

  const sellerQuery = useQuery({
    queryKey: ["seller-detail", id],
    queryFn: () => {
      if (!id) throw new Error("Seller user ID is required");
      return getSellerProfileById(id);
    },
    enabled: hasSellerId,
  });

  const sellerProfileId = sellerQuery.data?.data?.id;

  const campaignsQuery = useQuery({
    queryKey: ["seller-campaigns", sellerProfileId],
    queryFn: () => {
      if (!sellerProfileId) throw new Error("Seller profile ID is required");
      return getSellerCampaigns(sellerProfileId);
    },
    enabled: Boolean(sellerProfileId),
  });

  const seller = useMemo(() => {
    if (!sellerQuery.data?.data) return null;
    return adaptSellerProfile(sellerQuery.data.data, campaignsQuery.data);
  }, [sellerQuery.data, campaignsQuery.data]);

  return {
    seller,
    isMissingId: !hasSellerId,
    isProfileLoading: sellerQuery.isLoading,
    isProfileError:
      hasSellerId &&
      (sellerQuery.isError || (!sellerQuery.isLoading && !sellerQuery.data?.data)),
    isCampaignsLoading: Boolean(sellerProfileId) && campaignsQuery.isLoading,
    isCampaignsError: campaignsQuery.isError,
    refetch: () => {
      if (!id) return;
      void sellerQuery.refetch();
      if (sellerProfileId) void campaignsQuery.refetch();
    },
    refetchCampaigns: () => {
      if (!sellerProfileId) return;
      void campaignsQuery.refetch();
    },
  };
}

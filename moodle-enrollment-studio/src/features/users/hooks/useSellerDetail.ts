import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSellerProfileById } from "../services/userService";
import { adaptSellerProfile } from "../adapters/seller.adapter";
import { sellerKeys } from "../queryKeys";

export function useSellerDetail(sellerUserId?: string) {
  const { id: routeId } = useParams<{ id: string }>();
  const id = (sellerUserId ?? routeId)?.trim();
  const hasSellerId = Boolean(id);

  const sellerQuery = useQuery({
    queryKey: sellerKeys.detail(id ?? ""),
    queryFn: () => {
      if (!id) throw new Error("Seller user ID is required");
      return getSellerProfileById(id);
    },
    enabled: hasSellerId,
  });

  const seller = useMemo(() => {
    if (!sellerQuery.data) return null;
    return adaptSellerProfile(sellerQuery.data);
  }, [sellerQuery.data]);

  return {
    seller,
    isMissingId: !hasSellerId,
    isProfileLoading: sellerQuery.isLoading,
    isProfileError:
      hasSellerId &&
      (sellerQuery.isError || (!sellerQuery.isLoading && !sellerQuery.data)),
    isCampaignsLoading: false,
    isCampaignsError: false,
    refetch: () => {
      if (!id) return;
      void sellerQuery.refetch();
    },
    refetchCampaigns: () => {
      if (!id) return;
      void sellerQuery.refetch();
    },
  };
}

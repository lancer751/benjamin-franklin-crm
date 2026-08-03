import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSellerProfileById } from "@/features/users/services/userService";
import { getLeadById } from "../services/leadService";
import { resolveActiveCampaign, sellerProfileIdFrom, unwrapLeadDetail } from "../adapters/leadDetailAdapter";

interface DetailUser { id?: string; role?: { name?: string }; seller?: { id: string } | null }

export function useLeadDetail(leadId: string, user: DetailUser | null) {
  const isSalesRep = user?.role?.name === "SALES_REP";
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const profileQuery = useQuery({
    queryKey: ["seller-profile", user?.id],
    queryFn: () => getSellerProfileById(user!.id!),
    enabled: isSalesRep && Boolean(user?.id) && !user?.seller?.id,
  });
  const sellerProfileId = user?.seller?.id || sellerProfileIdFrom(profileQuery.data);
  const authenticatedUserId = user?.id || "";
  const leadQuery = useQuery({ queryKey: ["lead", leadId], queryFn: () => getLeadById(leadId), enabled: Boolean(leadId) });
  const lead = unwrapLeadDetail(leadQuery.data);
  const allMembers = useMemo(() => lead?.campaigns ?? [], [lead]);
  const members = useMemo(() => isSalesRep
    ? allMembers.filter((member) => member.assignedUser?.id === authenticatedUserId)
    : allMembers,
  [allMembers, authenticatedUserId, isSalesRep]);

  useEffect(() => {
    const resolvedCampaign = resolveActiveCampaign(members, selectedMemberId);
    if ((resolvedCampaign?.id ?? "") !== selectedMemberId) setSelectedMemberId(resolvedCampaign?.id ?? "");
  }, [members, selectedMemberId]);

  const activeCampaign = resolveActiveCampaign(members, selectedMemberId);
  return {
    lead,
    leadQuery,
    profileQuery,
    sellerProfileId,
    isSalesRep,
    allMembers,
    members,
    activeCampaign,
    selectedMemberId,
    selectedCampaignId: activeCampaign?.campaignId ?? "",
    setSelectedMemberId,
  };
}

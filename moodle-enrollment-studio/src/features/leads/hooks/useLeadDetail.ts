import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSellerProfileById } from "@/features/users/services/userService";
import { getLeadById } from "../services/leadService";
import { resolveActiveCampaignMember, sellerProfileIdFrom, unwrapLeadDetail } from "../adapters/leadDetailAdapter";

interface DetailUser { id?: string; role?: { name?: string }; seller?: { id: string } | null }

export function useLeadDetail(leadId: string, user: DetailUser | null, initialMemberId = "") {
  const isSalesRep = user?.role?.name === "SALES_REP";
  const [activeCampaignMemberId, setActiveCampaignMemberId] = useState(initialMemberId);
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
    const resolvedCampaign = resolveActiveCampaignMember(members, activeCampaignMemberId);
    if ((resolvedCampaign?.id ?? "") !== activeCampaignMemberId) setActiveCampaignMemberId(resolvedCampaign?.id ?? "");
  }, [activeCampaignMemberId, members]);

  const activeCampaignMember = resolveActiveCampaignMember(members, activeCampaignMemberId);
  return {
    lead,
    leadQuery,
    profileQuery,
    sellerProfileId,
    isSalesRep,
    allMembers,
    members,
    activeCampaignMember,
    activeCampaignMemberId,
    setActiveCampaignMemberId,
  };
}

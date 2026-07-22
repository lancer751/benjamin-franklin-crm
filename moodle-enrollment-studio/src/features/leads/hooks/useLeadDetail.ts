import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSellerProfileById } from "@/features/users/services/userService";
import { getLeadById } from "../services/leadService";
import { sellerProfileIdFrom, unwrapLeadDetail } from "../adapters/leadDetailAdapter";
import type { LeadCampaignMember } from "../components/lead-detail/leadDetail.types";
import { campaignIdFor } from "../components/lead-detail/leadDetail.formatters";

interface DetailUser { id?: string; role?: { name?: string }; seller?: { id: string } | null }

export function useLeadDetail(leadId: string, user: DetailUser | null) {
  const isSalesRep = user?.role?.name === "SALES_REP";
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const profileQuery = useQuery({
    queryKey: ["seller-profile", user?.id],
    queryFn: () => getSellerProfileById(user!.id!),
    enabled: isSalesRep && Boolean(user?.id) && !user?.seller?.id,
  });
  const sellerId = user?.seller?.id || sellerProfileIdFrom(profileQuery.data);
  const leadQuery = useQuery({ queryKey: ["lead", leadId], queryFn: () => getLeadById(leadId), enabled: Boolean(leadId) });
  const lead = unwrapLeadDetail(leadQuery.data);
  const allMembers = useMemo<LeadCampaignMember[]>(() => Array.isArray(lead?.campaignsEngaging) ? lead.campaignsEngaging : [], [lead]);
  const members = useMemo(() => isSalesRep
    ? allMembers.filter((member) => member.assigned_to === sellerId || member.seller?.id === sellerId)
    : allMembers,
  [allMembers, isSalesRep, sellerId]);

  useEffect(() => {
    if (members.some((member) => member.id === selectedMemberId)) return;
    setSelectedMemberId((members.find((member) => member.is_primary) ?? members[0])?.id ?? "");
  }, [members, selectedMemberId]);

  const selectedMember = members.find((member) => member.id === selectedMemberId) ?? null;
  return {
    lead,
    leadQuery,
    profileQuery,
    sellerId,
    isSalesRep,
    allMembers,
    members,
    selectedMember,
    selectedMemberId,
    selectedCampaignId: campaignIdFor(selectedMember),
    setSelectedMemberId,
  };
}

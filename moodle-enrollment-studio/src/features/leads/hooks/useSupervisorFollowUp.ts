import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getCampaignMembers,
  getCampaigns,
  type CampaignMembersQueryReq,
} from "@/features/campaigns/services/campaignService";
import { getSellers } from "@/features/users/services/userService";
import type { CampaignMemberStatus } from "@/core/constants/campaignMemberStatus";
import { adaptCampaignAssignments, adaptAdvisorFilterOptions } from "../adapters/campaignAssignmentAdapter";
import { adaptLeads, adaptProspectRows, unpackLeadPage } from "../adapters/leadAdapter";
import { adaptTeamFollowUpMemberPage } from "../adapters/teamFollowUpAdapter";
import { getAllLeads, type LeadListQuery } from "../services/leadService";
import { calculateSupervisorKPIs } from "../utils/leadLogic";
import type { LeadStatus } from "../utils/prospectDisplay";

export type TeamFollowUpMode = "ALL" | "UNASSIGNED" | "CAMPAIGN";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;

const recordsFromResponse = (response: unknown): unknown[] => {
  if (Array.isArray(response)) return response;
  if (typeof response !== "object" || response === null) return [];
  const data = Reflect.get(response, "data");
  return Array.isArray(data) ? data : [];
};

export const useSupervisorFollowUp = () => {
  const user = useAuthStore((state) => state.user);
  const role = user?.role?.name ?? "";
  const isSalesRep = role === "SALES_REP";
  const canFilterByAdvisor = role === "ADMIN" || role === "SALES_SUPERVISOR" || role === "SUPERVISOR" || role === "MARKETING";
  const authenticatedUserId = user?.id ?? "";

  const [mode, setMode] = useState<TeamFollowUpMode>("ALL");
  const [leadSearch, setLeadSearchValue] = useState("");
  const [debouncedLeadSearch, setDebouncedLeadSearch] = useState("");
  const [leadStatus, setLeadStatusValue] = useState<LeadStatus | "ALL">("ALL");
  const [leadAdvisorUserId, setLeadAdvisorUserIdValue] = useState("ALL");
  const [leadPage, setLeadPage] = useState(1);
  const [selectedCampaignId, setSelectedCampaignIdValue] = useState("");
  const [campaignAdvisorUserId, setCampaignAdvisorUserIdValue] = useState("ALL");
  const [campaignMemberStatus, setCampaignMemberStatusValue] = useState<CampaignMemberStatus | "ALL">("ALL");
  const [campaignPage, setCampaignPage] = useState(1);

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setDebouncedLeadSearch(leadSearch.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timeoutId);
  }, [leadSearch]);

  const campaignsQuery = useQuery({
    queryKey: ["campaigns", "team-follow-up", "ACTIVE", 1, 100],
    queryFn: () => getCampaigns({ page: "1", limit: "100", status: "ACTIVE" }),
    enabled: Boolean(user),
    staleTime: 5 * 60 * 1000,
  });

  const sellersQuery = useQuery({
    queryKey: ["users", "sellers", "team-follow-up"],
    queryFn: getSellers,
    enabled: Boolean(user),
    staleTime: 10 * 60 * 1000,
  });

  const campaigns = useMemo(
    () => adaptCampaignAssignments(campaignsQuery.data, sellersQuery.data),
    [campaignsQuery.data, sellersQuery.data],
  );
  const allAdvisors = useMemo(
    () => adaptAdvisorFilterOptions(campaignsQuery.data, sellersQuery.data),
    [campaignsQuery.data, sellersQuery.data],
  );
  const selectedCampaign = campaigns.find((campaign) => campaign.id === selectedCampaignId) ?? null;
  const campaignAdvisors = selectedCampaign?.sellers ?? [];

  useEffect(() => {
    if (campaigns.length === 1 && !selectedCampaignId) {
      setSelectedCampaignIdValue(campaigns[0].id);
    }
  }, [campaigns, selectedCampaignId]);

  const effectiveLeadAdvisorId = mode === "UNASSIGNED"
    ? "unassigned"
    : isSalesRep
      ? authenticatedUserId
      : canFilterByAdvisor && leadAdvisorUserId !== "ALL"
        ? leadAdvisorUserId
        : "";

  const leadQuery = useMemo<LeadListQuery>(() => ({
    page: String(leadPage),
    limit: String(PAGE_SIZE),
    ...(debouncedLeadSearch && { search: debouncedLeadSearch }),
    ...(leadStatus !== "ALL" && { status: leadStatus }),
    ...(effectiveLeadAdvisorId && { assigned_to: effectiveLeadAdvisorId }),
  }), [debouncedLeadSearch, effectiveLeadAdvisorId, leadPage, leadStatus]);

  const leadsQuery = useQuery({
    queryKey: [
      "team-follow-up",
      "leads",
      mode,
      effectiveLeadAdvisorId || "all-advisors",
      debouncedLeadSearch,
      leadStatus,
      leadPage,
      PAGE_SIZE,
    ],
    queryFn: () => getAllLeads(leadQuery),
    enabled: Boolean(user) && mode !== "CAMPAIGN",
    placeholderData: keepPreviousData,
  });

  const leadPageData = useMemo(() => unpackLeadPage(leadsQuery.data), [leadsQuery.data]);
  const leadRows = useMemo(
    () => adaptProspectRows(adaptLeads(leadPageData.leads)),
    [leadPageData.leads],
  );
  const leadTotalPages = Math.max(1, Math.ceil(leadPageData.total / Math.max(1, leadPageData.limit)));

  const effectiveCampaignAdvisorId = isSalesRep
    ? authenticatedUserId
    : campaignAdvisorUserId !== "ALL"
      ? campaignAdvisorUserId
      : "";
  const memberQuery = useMemo<CampaignMembersQueryReq>(() => ({
    page: String(campaignPage),
    limit: String(PAGE_SIZE),
    ...(effectiveCampaignAdvisorId && { assigned_to: effectiveCampaignAdvisorId }),
    ...(campaignMemberStatus !== "ALL" && { campaign_member_status: campaignMemberStatus }),
  }), [campaignMemberStatus, campaignPage, effectiveCampaignAdvisorId]);

  const membersQuery = useQuery({
    queryKey: [
      "team-follow-up",
      "campaign-members",
      selectedCampaignId || "no-campaign",
      effectiveCampaignAdvisorId || "all-advisors",
      campaignMemberStatus,
      campaignPage,
      PAGE_SIZE,
    ],
    queryFn: () => getCampaignMembers(selectedCampaignId, memberQuery),
    enabled: Boolean(user) && mode === "CAMPAIGN" && Boolean(selectedCampaign),
  });

  const memberPageData = useMemo(
    () => adaptTeamFollowUpMemberPage(
      membersQuery.data,
      selectedCampaignId,
      selectedCampaign?.name ?? "",
    ),
    [membersQuery.data, selectedCampaign?.name, selectedCampaignId],
  );
  const memberTotalPages = Math.max(1, Math.ceil(memberPageData.total / Math.max(1, memberPageData.limit)));

  const rawSellers = useMemo(() => recordsFromResponse(sellersQuery.data), [sellersQuery.data]);
  const kpis = useMemo(() => calculateSupervisorKPIs(rawSellers), [rawSellers]);

  const selectMode = (nextMode: TeamFollowUpMode) => {
    setMode(nextMode);
    setLeadPage(1);
    setCampaignPage(1);
  };
  const selectCampaign = (campaignId: string) => {
    setSelectedCampaignIdValue(campaignId);
    setCampaignAdvisorUserIdValue("ALL");
    setCampaignMemberStatusValue("ALL");
    setCampaignPage(1);
  };

  return {
    mode,
    selectMode,
    leadSearch,
    setLeadSearch: (value: string) => { setLeadSearchValue(value); setLeadPage(1); },
    leadStatus,
    setLeadStatus: (value: LeadStatus | "ALL") => { setLeadStatusValue(value); setLeadPage(1); },
    leadAdvisorUserId,
    setLeadAdvisorUserId: (value: string) => { setLeadAdvisorUserIdValue(value); setLeadPage(1); },
    leadRows,
    leadPage: leadPageData.page || leadPage,
    setLeadPage,
    leadTotal: leadPageData.total,
    leadTotalPages,
    isLoadingLeads: leadsQuery.isLoading,
    isFetchingLeads: leadsQuery.isFetching,
    isErrorLeads: leadsQuery.isError,
    retryLeads: leadsQuery.refetch,
    campaigns,
    selectedCampaign,
    selectedCampaignId,
    selectCampaign,
    isLoadingCampaigns: campaignsQuery.isLoading,
    isErrorCampaigns: campaignsQuery.isError || sellersQuery.isError,
    retryCampaigns: () => Promise.all([campaignsQuery.refetch(), sellersQuery.refetch()]),
    allAdvisors,
    campaignAdvisors,
    campaignAdvisorUserId,
    setCampaignAdvisorUserId: (value: string) => { setCampaignAdvisorUserIdValue(value); setCampaignPage(1); },
    campaignMemberStatus,
    setCampaignMemberStatus: (value: CampaignMemberStatus | "ALL") => { setCampaignMemberStatusValue(value); setCampaignPage(1); },
    memberRows: memberPageData.members,
    campaignPage: memberPageData.page || campaignPage,
    setCampaignPage,
    memberTotal: memberPageData.total,
    memberTotalPages,
    isLoadingMembers: membersQuery.isLoading,
    isFetchingMembers: membersQuery.isFetching,
    isErrorMembers: membersQuery.isError,
    retryMembers: membersQuery.refetch,
    canFilterByAdvisor,
    isSalesRep,
    role,
    kpis,
    isLoadingSellers: sellersQuery.isLoading,
    isErrorSellers: sellersQuery.isError,
  };
};

export type SupervisorFollowUpController = ReturnType<typeof useSupervisorFollowUp>;

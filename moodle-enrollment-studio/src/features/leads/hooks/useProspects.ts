import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { getCampaigns } from "@/features/campaigns/services/campaignService";
import { getSellerCampaigns } from "@/features/users/services/userService";
import { getAllLeads, type LeadListQuery } from "../services/leadService";
import {
  adaptLeads,
  adaptProspectRows,
  normalizeAssignedCampaigns,
  normalizeCampaignOptions,
  normalizeSellerOptionsFromCampaigns,
  unpackLeadPage,
} from "../adapters/leadAdapter";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;

export function useProspects() {
  const user = useAuthStore((state) => state.user);
  const role = user?.role?.name ?? "";
  const isSalesRep = role === "SALES_REP";
  const canViewSeller = role === "ADMIN" || role === "SALES_SUPERVISOR" || role === "MARKETING";
  const sellerId = user?.seller?.id ?? "";
  const [requestedPage, setRequestedPage] = useState(1);
  const [search, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [leadStatus, setLeadStatusValue] = useState("ALL");
  const [memberStatus, setMemberStatusValue] = useState("ALL");
  const [campaignId, setCampaignIdValue] = useState("ALL");
  const [advisorId, setAdvisorIdValue] = useState("ALL");
  const [registeredOn, setRegisteredOnValue] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const createdFrom = registeredOn ? `${registeredOn}T00:00:00.000` : "";
  const createdTo = registeredOn ? `${registeredOn}T23:59:59.999` : "";

  const leadQuery = useMemo<LeadListQuery>(() => ({
    page: String(requestedPage),
    limit: String(PAGE_SIZE),
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(leadStatus !== "ALL" && { status: leadStatus as "ACTIVE" | "INACTIVE" }),
    ...(memberStatus !== "ALL" && { member_status: memberStatus }),
    ...(campaignId !== "ALL" && { campaign_id: campaignId }),
    ...(createdFrom && createdTo && { created_from: createdFrom, created_to: createdTo }),
    ...(canViewSeller && advisorId !== "ALL" && { assigned_to: advisorId }),
  }), [advisorId, campaignId, canViewSeller, createdFrom, createdTo, debouncedSearch, leadStatus, memberStatus, requestedPage]);

  const sellerCampaignsQuery = useQuery({
    queryKey: ["seller-campaigns", sellerId],
    queryFn: () => getSellerCampaigns(sellerId),
    enabled: isSalesRep && Boolean(sellerId),
  });

  const allowedCampaignsQuery = useQuery({
    queryKey: ["campaigns", "prospects-selector", 1, 100],
    queryFn: () => getCampaigns({ page: 1, limit: 100 }),
    enabled: Boolean(user) && !isSalesRep,
  });

  const leadsQuery = useQuery({
    queryKey: [
      "leads",
      "crm",
      requestedPage,
      PAGE_SIZE,
      debouncedSearch,
      campaignId,
      memberStatus,
      leadStatus,
      createdFrom,
      createdTo,
      canViewSeller ? advisorId : "self-or-all",
    ],
    queryFn: () => getAllLeads(leadQuery),
    enabled: Boolean(user),
    placeholderData: keepPreviousData,
  });

  const pageData = useMemo(() => unpackLeadPage(leadsQuery.data), [leadsQuery.data]);
  const leads = useMemo(() => adaptLeads(pageData.leads), [pageData.leads]);
  const rows = useMemo(
    () => adaptProspectRows(leads, campaignId === "ALL" ? undefined : campaignId),
    [campaignId, leads],
  );
  const campaigns = useMemo(
    () => isSalesRep
      ? normalizeAssignedCampaigns(sellerCampaignsQuery.data)
      : normalizeCampaignOptions(allowedCampaignsQuery.data),
    [allowedCampaignsQuery.data, isSalesRep, sellerCampaignsQuery.data],
  );
  const sellers = useMemo(
    () => canViewSeller ? normalizeSellerOptionsFromCampaigns(allowedCampaignsQuery.data) : [],
    [allowedCampaignsQuery.data, canViewSeller],
  );
  const totalPages = Math.max(1, Math.ceil(pageData.total / Math.max(1, pageData.limit)));
  const hasActiveFilters = Boolean(
    search.trim()
    || leadStatus !== "ALL"
    || memberStatus !== "ALL"
    || campaignId !== "ALL"
    || registeredOn
    || (canViewSeller && advisorId !== "ALL"),
  );
  const description = isSalesRep
    ? "Consulta, filtra y da seguimiento a tus prospectos asignados."
    : role === "ADMIN" || role === "SALES_SUPERVISOR"
      ? "Consulta, filtra y supervisa los prospectos y su asignación comercial."
      : "Consulta, filtra y da seguimiento a los prospectos registrados.";

  const resetPage = () => setRequestedPage(1);
  const clearFilters = () => {
    setSearchValue("");
    setDebouncedSearch("");
    setLeadStatusValue("ALL");
    setMemberStatusValue("ALL");
    setCampaignIdValue("ALL");
    setAdvisorIdValue("ALL");
    setRegisteredOnValue("");
    resetPage();
  };

  return {
    role,
    isSalesRep,
    canViewSeller,
    description,
    campaigns,
    sellers,
    rows,
    page: pageData.page || requestedPage,
    total: pageData.total,
    limit: pageData.limit,
    totalPages,
    search,
    leadStatus,
    memberStatus,
    campaignId,
    advisorId,
    registeredOn,
    hasActiveFilters,
    setPage: setRequestedPage,
    setSearch: (value: string) => {
      setSearchValue(value);
      if (!value.trim()) setDebouncedSearch("");
      resetPage();
    },
    setLeadStatus: (value: string) => { setLeadStatusValue(value); resetPage(); },
    setMemberStatus: (value: string) => { setMemberStatusValue(value); resetPage(); },
    setCampaignId: (value: string) => { setCampaignIdValue(value); resetPage(); },
    setAdvisorId: (value: string) => { setAdvisorIdValue(value); resetPage(); },
    setRegisteredOn: (value: string) => { setRegisteredOnValue(value); resetPage(); },
    clearFilters,
    retryLeads: () => leadsQuery.refetch(),
    isLoading: leadsQuery.isLoading,
    isFetching: leadsQuery.isFetching,
    isError: leadsQuery.isError,
    areCampaignsLoading: isSalesRep ? sellerCampaignsQuery.isLoading : allowedCampaignsQuery.isLoading,
    campaignsError: isSalesRep ? sellerCampaignsQuery.isError : allowedCampaignsQuery.isError,
  };
}

export type ProspectsController = ReturnType<typeof useProspects>;

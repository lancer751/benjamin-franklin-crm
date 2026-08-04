import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { getCampaigns } from "@/features/campaigns/services/campaignService";
import { getSellers } from "@/features/users/services/userService";
import { getAllLeads, type LeadListQuery } from "../services/leadService";
import {
  adaptLeads,
  adaptProspectRows,
  unpackLeadPage,
} from "../adapters/leadAdapter";
import { adaptAdvisorFilterOptions } from "../adapters/campaignAssignmentAdapter";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;

export function useProspects() {
  const user = useAuthStore((state) => state.user);
  const role = user?.role?.name ?? "";
  const isSalesRep = role === "SALES_REP";
  const canViewSeller = role === "ADMIN" || role === "SALES_SUPERVISOR" || role === "MARKETING";
  const authenticatedUserId = user?.id ?? "";
  const [requestedPage, setRequestedPage] = useState(1);
  const [search, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [leadStatus, setLeadStatusValue] = useState("ALL");
  const [advisorId, setAdvisorIdValue] = useState("ALL");

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const assignedTo = isSalesRep
    ? authenticatedUserId
    : canViewSeller && advisorId !== "ALL"
      ? advisorId
      : "";

  const leadQuery = useMemo<LeadListQuery>(() => ({
    page: String(requestedPage),
    limit: String(PAGE_SIZE),
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(leadStatus !== "ALL" && { status: leadStatus as "ACTIVE" | "INACTIVE" }),
    ...(assignedTo && { assigned_to: assignedTo }),
  }), [assignedTo, debouncedSearch, leadStatus, requestedPage]);

  const allowedCampaignsQuery = useQuery({
    queryKey: ["campaigns", "prospects-selector", 1, 100],
    queryFn: () => getCampaigns({ page: "1", limit: "100" }),
    enabled: Boolean(user) && canViewSeller,
  });

  const sellersQuery = useQuery({
    queryKey: ["users", "sellers", "prospects-selector"],
    queryFn: getSellers,
    enabled: Boolean(user) && canViewSeller,
  });

  const leadsQuery = useQuery({
    queryKey: [
      "leads",
      "crm",
      requestedPage,
      PAGE_SIZE,
      debouncedSearch,
      leadStatus,
      assignedTo || "all-advisors",
    ],
    queryFn: () => getAllLeads(leadQuery),
    enabled: Boolean(user),
    placeholderData: keepPreviousData,
  });

  const pageData = useMemo(() => unpackLeadPage(leadsQuery.data), [leadsQuery.data]);
  const leads = useMemo(() => adaptLeads(pageData.leads), [pageData.leads]);
  const rows = useMemo(
    () => adaptProspectRows(leads, undefined, assignedTo || undefined, undefined),
    [assignedTo, leads],
  );
  const sellers = useMemo(
    () => canViewSeller
      ? adaptAdvisorFilterOptions(allowedCampaignsQuery.data, sellersQuery.data)
      : [],
    [allowedCampaignsQuery.data, canViewSeller, sellersQuery.data],
  );
  const totalPages = Math.max(1, Math.ceil(pageData.total / Math.max(1, pageData.limit)));
  const hasActiveFilters = Boolean(
    search.trim()
    || leadStatus !== "ALL"
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
    setAdvisorIdValue("ALL");
    resetPage();
  };

  return {
    role,
    isSalesRep,
    canViewSeller,
    description,
    sellers,
    rows,
    page: pageData.page || requestedPage,
    total: pageData.total,
    limit: pageData.limit,
    totalPages,
    search,
    leadStatus,
    advisorId,
    hasActiveFilters,
    setPage: setRequestedPage,
    setSearch: (value: string) => {
      setSearchValue(value);
      if (!value.trim()) setDebouncedSearch("");
      resetPage();
    },
    setLeadStatus: (value: string) => { setLeadStatusValue(value); resetPage(); },
    setAdvisorId: (value: string) => { setAdvisorIdValue(value); resetPage(); },
    clearFilters,
    retryLeads: () => leadsQuery.refetch(),
    isLoading: leadsQuery.isLoading,
    isFetching: leadsQuery.isFetching,
    isError: leadsQuery.isError,
  };
}

export type ProspectsController = ReturnType<typeof useProspects>;

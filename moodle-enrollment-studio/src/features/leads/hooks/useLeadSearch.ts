import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adaptLeads, unpackLeadPage } from "../adapters/leadAdapter";
import { leadKeys } from "../queryKeys";
import { searchLeads, type LeadListQuery } from "../services/leadService";

const SEARCH_DEBOUNCE_MS = 350;
const MIN_SEARCH_LENGTH = 2;

export interface UseLeadSearchOptions {
  search: string;
  campaignId: string;
  assignedTo?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useLeadSearch({
  search,
  campaignId,
  assignedTo,
  page = 1,
  limit = 20,
  enabled = true,
}: UseLeadSearchOptions) {
  const normalizedSearch = search.trim();
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (normalizedSearch.length < MIN_SEARCH_LENGTH) {
      setDebouncedSearch(normalizedSearch);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(normalizedSearch);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [normalizedSearch]);

  const filters = useMemo<LeadListQuery>(() => ({
    page: String(page),
    limit: String(limit),
    search: debouncedSearch,
    campaign_id: campaignId,
    ...(assignedTo && { assigned_to: assignedTo }),
  }), [assignedTo, campaignId, debouncedSearch, limit, page]);

  const query = useQuery({
    queryKey: leadKeys.list(filters),
    queryFn: ({ signal }) => searchLeads(filters, signal),
    enabled: Boolean(
      enabled
      && campaignId
      && debouncedSearch.length >= MIN_SEARCH_LENGTH
    ),
  });

  const pageData = useMemo(() => unpackLeadPage(query.data), [query.data]);
  const leads = useMemo(() => adaptLeads(pageData.leads), [pageData.leads]);
  const isSearchActive = normalizedSearch.length >= MIN_SEARCH_LENGTH;
  const isDebouncing = isSearchActive && normalizedSearch !== debouncedSearch;

  return {
    data: leads,
    total: pageData.total,
    page: pageData.page,
    limit: pageData.limit,
    debouncedSearch,
    isSearchActive,
    isDebouncing,
    isLoading: isDebouncing || query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}

import { useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { getAllLeads, type LeadListQuery } from "../services/leadService";
import { adaptLeads, unpackLeadPage } from "../adapters/leadAdapter";

const PAGE_SIZE = 20;
const LEAD_STATUSES = new Set(["ACTIVE", "INACTIVE"]);

export function useProspects() {
  const user = useAuthStore((state) => state.user);
  const role = user?.role?.name ?? "";
  const isSalesRep = role === "SALES_REP";
  const canSeeAdvisors = role === "ADMIN" || role === "SALES_SUPERVISOR";
  const sellerId = user?.seller?.id ?? "";
  const [requestedPage, setRequestedPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [campaignId, setCampaignId] = useState("ALL");
  const [advisorId, setAdvisorId] = useState("ALL");
  const [registeredOn, setRegisteredOn] = useState("");
  const deferredSearch = useDeferredValue(search.trim());

  const query = useMemo<LeadListQuery>(() => ({
    page: String(requestedPage),
    limit: String(PAGE_SIZE),
    ...(deferredSearch && { search: deferredSearch }),
    ...(status !== "ALL" && LEAD_STATUSES.has(status) && { status: status as "ACTIVE" | "INACTIVE" }),
    ...(status !== "ALL" && !LEAD_STATUSES.has(status) && { member_status: status }),
    ...(campaignId !== "ALL" && { campaign_id: campaignId }),
    ...(registeredOn && {
      created_from: `${registeredOn}T00:00:00.000`,
      created_to: `${registeredOn}T23:59:59.999`,
    }),
    ...(isSalesRep && sellerId && { assigned_to: sellerId }),
    ...(!isSalesRep && advisorId !== "ALL" && { assigned_to: advisorId }),
  }), [advisorId, campaignId, deferredSearch, isSalesRep, registeredOn, requestedPage, sellerId, status]);

  const leadsQuery = useQuery({
    queryKey: ["leads", "crm", query],
    queryFn: () => getAllLeads(query),
    enabled: !isSalesRep || Boolean(sellerId),
  });

  const pageData = useMemo(() => unpackLeadPage(leadsQuery.data), [leadsQuery.data]);
  const leads = useMemo(() => adaptLeads(pageData.leads), [pageData.leads]);
  const campaigns = useMemo(() => {
    const values = new Map<string, string>();
    leads.forEach((lead) => lead.campaignsEngaging.forEach((member) => {
      if (member.campaign_id) values.set(member.campaign_id, member.campaign.name || "Sin campaña");
    }));
    if (campaignId !== "ALL" && !values.has(campaignId)) values.set(campaignId, "Campaña seleccionada");
    return Array.from(values, ([id, name]) => ({ id, name }));
  }, [campaignId, leads]);
  const sellers = useMemo(() => {
    const values = new Map<string, { id: string; user: { first_name: string; last_name: string } }>();
    leads.forEach((lead) => lead.campaignsEngaging.forEach((member) => {
      if (member.seller?.id) values.set(member.seller.id, {
        id: member.seller.id,
        user: {
          first_name: member.seller.user?.first_name || "",
          last_name: member.seller.user?.last_name || "",
        },
      });
    }));
    return Array.from(values.values());
  }, [leads]);
  const totalPages = Math.max(1, Math.ceil(pageData.total / Math.max(1, pageData.limit)));

  return {
    role,
    isSalesRep,
    canSeeAdvisors,
    sellerId,
    campaigns,
    sellers,
    leads,
    page: pageData.page || requestedPage,
    total: pageData.total,
    limit: pageData.limit,
    totalPages,
    search,
    status,
    campaignId,
    advisorId,
    registeredOn,
    setPage: setRequestedPage,
    setSearch: (value: string) => { setSearch(value); setRequestedPage(1); },
    setStatus: (value: string) => { setStatus(value); setRequestedPage(1); },
    setCampaignId: (value: string) => { setCampaignId(value); setRequestedPage(1); },
    setAdvisorId: (value: string) => { setAdvisorId(value); setRequestedPage(1); },
    setRegisteredOn: (value: string) => { setRegisteredOn(value); setRequestedPage(1); },
    isLoading: leadsQuery.isLoading || (isSalesRep && !sellerId),
    isError: leadsQuery.isError,
  };
}

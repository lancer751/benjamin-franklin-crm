import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/core/components/ui/button";
import { Card } from "@/core/components/ui/card";
import { Skeleton } from "@/core/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import { useAuthStore } from "@/store/useAuthStore";
import { getSellerProfileById } from "@/features/users/services/userService";
import { getLeadById, getMemberInteractions, getMemberTasks } from "../services/leadService";
import { LeadDetailHeader } from "../components/lead-detail/LeadDetailHeader";
import { LeadCommercialSummary } from "../components/lead-detail/LeadCommercialSummary";
import { LeadInformationTab } from "../components/lead-detail/LeadInformationTab";
import { LeadCampaignsTab } from "../components/lead-detail/LeadCampaignsTab";
import { LeadInteractionsTab, LeadTasksTab } from "../components/lead-detail/LeadActivityTabs";
import { principalPhoneFrom } from "../components/lead-detail/leadDetail.formatters";
import type { LeadCampaignMember, LeadDetail, LeadInteraction, LeadTask } from "../components/lead-detail/leadDetail.types";

type DetailTab = "information" | "campaigns" | "interactions" | "tasks";

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;
const unwrapLead = (response: unknown): LeadDetail | null => {
  if (!isRecord(response)) return null;
  const candidate = isRecord(response.data) ? response.data : response;
  return typeof candidate.id === "string" ? candidate as unknown as LeadDetail : null;
};
const unwrapList = <T,>(response: unknown, key: string): T[] => {
  if (Array.isArray(response)) return response as T[];
  if (!isRecord(response)) return [];
  if (Array.isArray(response.data)) return response.data as T[];
  if (isRecord(response.data) && Array.isArray(response.data[key])) return response.data[key] as T[];
  return Array.isArray(response[key]) ? response[key] as T[] : [];
};
const profileIdFrom = (response: unknown) => {
  if (!isRecord(response)) return "";
  if (isRecord(response.data) && typeof response.data.id === "string") return response.data.id;
  return typeof response.id === "string" ? response.id : "";
};

const DetailSkeleton = () => <div className="space-y-5"><Skeleton className="h-9 w-28" /><Skeleton className="h-36 w-full rounded-xl" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-24 rounded-xl" />)}</div><div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-64 rounded-xl" />)}</div></div>;

export default function LeadDetailView() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isSalesRep = user?.role?.name === "SALES_REP";
  const [activeTab, setActiveTab] = useState<DetailTab>("information");
  const [selectedMemberId, setSelectedMemberId] = useState("");

  const profileQuery = useQuery({
    queryKey: ["seller-profile", user?.id],
    queryFn: () => getSellerProfileById(user!.id),
    enabled: isSalesRep && Boolean(user?.id) && !user?.seller?.id,
  });
  const sellerId = user?.seller?.id || profileIdFrom(profileQuery.data);
  const leadQuery = useQuery({ queryKey: ["lead", id], queryFn: () => getLeadById(id), enabled: Boolean(id) });
  const lead = unwrapLead(leadQuery.data);
  const allMembers = useMemo<LeadCampaignMember[]>(() => Array.isArray(lead?.campaignsEngaging) ? lead.campaignsEngaging : [], [lead]);
  const members = useMemo(() => isSalesRep
    ? allMembers.filter((member) => member.assigned_to === sellerId || member.seller?.id === sellerId)
    : allMembers,
  [allMembers, isSalesRep, sellerId]);

  useEffect(() => {
    if (members.some((member) => member.id === selectedMemberId)) return;
    const preferredMember = members.find((member) => member.is_primary) ?? members[0];
    setSelectedMemberId(preferredMember?.id ?? "");
  }, [members, selectedMemberId]);

  const selectedMember = members.find((member) => member.id === selectedMemberId) ?? null;
  const selectedCampaignId = selectedMember?.campaing?.id ?? selectedMember?.campaign?.id ?? selectedMember?.campaing_id ?? selectedMember?.campaign_id ?? "";
  const interactionsQuery = useQuery({
    queryKey: ["lead-interactions", selectedCampaignId, selectedMemberId],
    queryFn: () => getMemberInteractions(selectedCampaignId, selectedMemberId),
    enabled: Boolean(selectedCampaignId && selectedMemberId),
  });
  const tasksQuery = useQuery({
    queryKey: ["lead-tasks", selectedCampaignId, selectedMemberId],
    queryFn: () => getMemberTasks(selectedCampaignId, selectedMemberId),
    enabled: Boolean(selectedCampaignId && selectedMemberId),
  });
  const interactions = unwrapList<LeadInteraction>(interactionsQuery.data, "interactions");
  const tasks = unwrapList<LeadTask>(tasksQuery.data, "tasks");

  if (leadQuery.isLoading || profileQuery.isLoading) return <DetailSkeleton />;
  if (leadQuery.isError || !lead || (isSalesRep && !sellerId)) return <Card className="p-10 text-center"><p className="font-semibold text-destructive">No fue posible cargar este prospecto.</p><div className="mt-4 flex justify-center gap-2"><Button variant="outline" onClick={() => navigate(-1)}>Volver</Button><Button onClick={() => void leadQuery.refetch()}>Reintentar</Button></div></Card>;
  if (isSalesRep && allMembers.length > 0 && members.length === 0) return <Card className="p-10 text-center"><p className="font-semibold text-destructive">No tienes acceso a este prospecto.</p><p className="mt-1 text-sm text-muted-foreground">No está asignado a tu perfil de vendedor.</p><Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Volver</Button></Card>;

  const phones = Array.isArray(lead.phones) ? lead.phones : [];
  const principalPhone = principalPhoneFrom(phones);
  const additionalPhones = phones.filter((phone) => phone !== principalPhone);
  const showActivity = (memberId: string) => { setSelectedMemberId(memberId); setActiveTab("interactions"); };

  return <div className="space-y-5">
    <Button variant="ghost" className="gap-2 px-0" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" />Volver</Button>
    <LeadDetailHeader lead={lead} phone={principalPhone?.number} onEdit={() => navigate(`/prospectos/${id}/editar`)} />
    <LeadCommercialSummary member={selectedMember} />
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DetailTab)}>
      <div className="overflow-x-auto pb-1"><TabsList className="inline-flex h-11 min-w-full justify-start sm:grid sm:grid-cols-4"><TabsTrigger className="min-w-32" value="information">Información</TabsTrigger><TabsTrigger className="min-w-32" value="campaigns">Campañas ({members.length})</TabsTrigger><TabsTrigger className="min-w-32" value="interactions">Interacciones</TabsTrigger><TabsTrigger className="min-w-32" value="tasks">Tareas</TabsTrigger></TabsList></div>
      <TabsContent value="information" className="mt-4"><LeadInformationTab lead={lead} principalPhone={principalPhone} additionalPhones={additionalPhones} /></TabsContent>
      <TabsContent value="campaigns" className="mt-4"><LeadCampaignsTab members={members} selectedMemberId={selectedMemberId} onViewActivity={showActivity} /></TabsContent>
      <TabsContent value="interactions" className="mt-4"><LeadInteractionsTab members={members} selectedMemberId={selectedMemberId} onChange={setSelectedMemberId} interactions={interactions} isLoading={interactionsQuery.isLoading} isError={interactionsQuery.isError} onRetry={() => void interactionsQuery.refetch()} /></TabsContent>
      <TabsContent value="tasks" className="mt-4"><LeadTasksTab members={members} selectedMemberId={selectedMemberId} onChange={setSelectedMemberId} tasks={tasks} isLoading={tasksQuery.isLoading} isError={tasksQuery.isError} onRetry={() => void tasksQuery.refetch()} /></TabsContent>
    </Tabs>
  </div>;
}

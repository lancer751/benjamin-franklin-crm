import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/core/components/ui/button";
import { Card } from "@/core/components/ui/card";
import { Skeleton } from "@/core/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import { useAuthStore } from "@/store/useAuthStore";
import { campaignIdsFromMembers } from "../adapters/leadDetailAdapter";
import { AddLeadToCampaignDialog } from "../components/lead-detail/AddLeadToCampaignDialog";
import { DeleteLeadDialog } from "../components/lead-detail/DeleteLeadDialog";
import { LeadInteractionsTab, LeadTasksTab } from "../components/lead-detail/LeadActivityTabs";
import { LeadCampaignsTab } from "../components/lead-detail/LeadCampaignsTab";
import { LeadCommercialSummary } from "../components/lead-detail/LeadCommercialSummary";
import { leadDetailCapabilities } from "../components/lead-detail/leadDetail.capabilities";
import { LeadDetailHeader } from "../components/lead-detail/LeadDetailHeader";
import { LeadInformationTab } from "../components/lead-detail/LeadInformationTab";
import { principalPhoneFrom } from "../components/lead-detail/leadDetail.formatters";
import { useDeleteLead } from "../hooks/useDeleteLead";
import { useLeadDetail } from "../hooks/useLeadDetail";

type DetailTab = "information" | "campaigns" | "interactions" | "tasks";
const DetailSkeleton = () => <div className="space-y-5"><Skeleton className="h-9 w-28" /><Skeleton className="h-36 w-full rounded-xl" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-24 rounded-xl" />)}</div><div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-64 rounded-xl" />)}</div></div>;

export default function LeadDetailView() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = user?.role?.name || "";
  const capabilities = useMemo(() => leadDetailCapabilities(role), [role]);
  const detail = useLeadDetail(id, user);
  const deleteMutation = useDeleteLead(id);
  const [activeTab, setActiveTab] = useState<DetailTab>("information");
  const [addCampaignOpen, setAddCampaignOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (detail.leadQuery.isLoading || detail.profileQuery.isLoading) return <DetailSkeleton />;
  if (detail.leadQuery.isError || !detail.lead || (detail.isSalesRep && !detail.sellerId)) return <Card className="p-10 text-center"><p className="font-semibold text-destructive">No fue posible cargar este prospecto.</p><div className="mt-4 flex justify-center gap-2"><Button variant="outline" onClick={() => navigate(-1)}>Volver</Button><Button onClick={() => void detail.leadQuery.refetch()}>Reintentar</Button></div></Card>;
  if (detail.isSalesRep && detail.allMembers.length > 0 && detail.members.length === 0) return <Card className="p-10 text-center"><p className="font-semibold text-destructive">No tienes acceso a este prospecto.</p><p className="mt-1 text-sm text-muted-foreground">No está asignado a tu perfil de vendedor.</p><Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Volver</Button></Card>;

  const phones = Array.isArray(detail.lead.phones) ? detail.lead.phones : [];
  const principalPhone = principalPhoneFrom(phones);
  const additionalPhones = phones.filter((phone) => phone !== principalPhone);
  const activitySellerId = detail.sellerId || detail.selectedMember?.assigned_to || detail.selectedMember?.seller?.id || "";
  const showActivity = (memberId: string) => { detail.setSelectedMemberId(memberId); setActiveTab("interactions"); };
  const selectAddedMember = (memberId: string) => { if (memberId) detail.setSelectedMemberId(memberId); };
  const deleteError = deleteMutation.error instanceof Error ? deleteMutation.error.message : "";

  return <div className="space-y-5">
    <Button variant="ghost" className="gap-2 px-0" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" />Volver</Button>
    <LeadDetailHeader lead={detail.lead} phone={principalPhone?.number} capabilities={capabilities} onEdit={() => navigate(`/prospectos/${id}/editar`)} onAddCampaign={() => setAddCampaignOpen(true)} onDelete={() => { deleteMutation.reset(); setDeleteOpen(true); }} />
    <LeadCommercialSummary member={detail.selectedMember} />
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DetailTab)}>
      <div className="overflow-x-auto pb-1"><TabsList className="inline-flex h-11 min-w-full justify-start sm:grid sm:grid-cols-4"><TabsTrigger className="min-w-32" value="information">Información</TabsTrigger><TabsTrigger className="min-w-32" value="campaigns">Campañas ({detail.members.length})</TabsTrigger><TabsTrigger className="min-w-32" value="interactions">Interacciones</TabsTrigger><TabsTrigger className="min-w-32" value="tasks">Tareas</TabsTrigger></TabsList></div>
      <TabsContent value="information" className="mt-4"><LeadInformationTab lead={detail.lead} principalPhone={principalPhone} additionalPhones={additionalPhones} /></TabsContent>
      <TabsContent value="campaigns" className="mt-4"><LeadCampaignsTab members={detail.members} selectedMemberId={detail.selectedMemberId} canAddCampaign={capabilities.canAddCampaign} onAddCampaign={() => setAddCampaignOpen(true)} onViewActivity={showActivity} /></TabsContent>
      <TabsContent value="interactions" className="mt-4"><LeadInteractionsTab members={detail.members} selectedMemberId={detail.selectedMemberId} campaignId={detail.selectedCampaignId} sellerId={activitySellerId} onChange={detail.setSelectedMemberId} canCreate={capabilities.canCreateInteraction} /></TabsContent>
      <TabsContent value="tasks" className="mt-4"><LeadTasksTab members={detail.members} selectedMemberId={detail.selectedMemberId} campaignId={detail.selectedCampaignId} sellerId={activitySellerId} onChange={detail.setSelectedMemberId} canManage={capabilities.canManageTasks} /></TabsContent>
    </Tabs>
    <AddLeadToCampaignDialog open={addCampaignOpen} onOpenChange={setAddCampaignOpen} leadId={id} role={role} sellerId={detail.sellerId} associatedCampaignIds={campaignIdsFromMembers(detail.allMembers)} onAdded={selectAddedMember} />
    <DeleteLeadDialog open={deleteOpen} onOpenChange={setDeleteOpen} isPending={deleteMutation.isPending} error={deleteError} onConfirm={() => deleteMutation.mutate()} />
  </div>;
}

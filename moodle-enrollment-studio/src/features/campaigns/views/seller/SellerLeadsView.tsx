import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { getCampaigns } from "@/features/campaigns/services/campaignService";
import { getCampaignMembers, updateMemberStatus } from "@/features/leads/services/leadService";
import { adaptCampaignMembers, unpackLeads } from "@/features/leads/adapters/leadAdapter";
import { Button } from "@/core/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Card } from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { Input } from "@/core/components/ui/input";
import { Skeleton } from "@/core/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/core/lib/utils";
import { 
  Users, 
  Search, 
  Calendar, 
  Phone, 
  Mail, 
  Eye, 
  Edit, 
  MessageSquare, 
  ChevronRight, 
  Loader2, 
  RefreshCw,
  Sparkles,
  UserCheck
} from "lucide-react";
import { format } from "date-fns";

// Mapeo de columnas y configuraciones de estilo
const STAGES = [
  { id: "ACTIVE", label: "Nuevo / Activo", color: "border-blue-200 bg-blue-50/20 text-blue-700 dark:text-blue-400 dark:bg-blue-950/10", dotColor: "bg-blue-500" },
  { id: "stage_Volver_a_llamar", label: "Volver a Llamar", color: "border-amber-200 bg-amber-50/20 text-amber-700 dark:text-amber-400 dark:bg-amber-950/10", dotColor: "bg-amber-500" },
  { id: "stage_Muy_interesado", label: "Muy Interesado", color: "border-purple-200 bg-purple-50/20 text-purple-700 dark:text-purple-400 dark:bg-purple-950/10", dotColor: "bg-purple-500" },
  { id: "stage_No_contesta", label: "No Contesta", color: "border-orange-200 bg-orange-50/20 text-orange-700 dark:text-orange-400 dark:bg-orange-950/10", dotColor: "bg-orange-500" },
  { id: "stage_No_interesado", label: "No Interesado", color: "border-rose-200 bg-rose-50/20 text-rose-700 dark:text-rose-400 dark:bg-rose-950/10", dotColor: "bg-rose-500" }
];

const getPhone = (lead: any) => {
  if (lead.cellphone) return lead.cellphone;
  if (lead.phone) return lead.phone;
  if (lead.phones?.[0]?.number) return lead.phones[0].number;
  return null;
};

const SellerLeadsView = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const sellerId = user?.seller?.id || user?.id;

  const { campaignId: routeCampaignId } = useParams<{ campaignId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCampaignId = routeCampaignId || searchParams.get("campaignId") || "";
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Obtener campañas asignadas al vendedor
  const { data: campaignsRes, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ["campaigns-list-seller", sellerId],
    queryFn: () => getCampaigns(),
    enabled: !!sellerId,
  });

  const campaigns = (campaignsRes as any)?.data?.data?.campaings
    || (campaignsRes as any)?.data?.campaings
    || (campaignsRes as any)?.campaings
    || (campaignsRes as any)?.data
    || [];

  const sellerCampaigns = useMemo(() => {
    return campaigns.filter((c: any) => {
      const sellersList = c.sellers || [];
      return sellersList.some(
        (s: any) =>
          s.seller_id === sellerId ||
          s.seller?.id === sellerId ||
          s.id === sellerId
      );
    });
  }, [campaigns, sellerId]);

  // Preseleccionar la primera campaña si no hay seleccionada en los query params
  useEffect(() => {
    if (sellerCampaigns.length > 0 && !selectedCampaignId) {
      setSearchParams({ campaignId: sellerCampaigns[0].id });
    }
  }, [sellerCampaigns, selectedCampaignId, setSearchParams]);

  // 2. Obtener los leads de la campaña seleccionada asignados a este asesor
  const { data: membersRes, isLoading: isLoadingLeads, isError: isErrorLeads } = useQuery({
    queryKey: ["campaign-members-seller", selectedCampaignId, sellerId],
    queryFn: () => getCampaignMembers(selectedCampaignId, { assigned_to: sellerId }),
    enabled: !!selectedCampaignId && !!sellerId,
  });

  const leads = useMemo(() => {
    const rawData = unpackLeads(membersRes);
    return adaptCampaignMembers(rawData);
  }, [membersRes]);

  // Mutación para actualizar la tipificación (status)
  const updateStatusMutation = useMutation({
    mutationFn: ({ memberId, status }: { memberId: string; status: string }) =>
      updateMemberStatus(selectedCampaignId, memberId, status),
    onSuccess: () => {
      toast.success("Tipificación de lead actualizada exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["campaign-members-seller"] });
      queryClient.invalidateQueries({ queryKey: ["campaign-members"] });
    },
    onError: () => {
      toast.error("Ocurrió un error al actualizar el estado del lead.");
    }
  });

  const handleStatusChange = (memberId: string, newStatus: string) => {
    updateStatusMutation.mutate({ memberId, status: newStatus });
  };

  const handleCampaignChange = (val: string) => {
    setSearchParams({ campaignId: val });
  };

  // Filtrado de leads por la barra de búsqueda (nombre, email o celular)
  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    return leads.filter((l: any) => {
      const fullName = `${l.first_name || ""} ${l.last_name || ""}`.toLowerCase();
      const email = (l.email || "").toLowerCase();
      const phone = (getPhone(l) || "").toLowerCase();
      const query = searchQuery.toLowerCase();
      return fullName.includes(query) || email.includes(query) || phone.includes(query);
    });
  }, [leads, searchQuery]);

  // Agrupamiento por etapa
  const leadsByStage = useMemo(() => {
    const groups: Record<string, any[]> = {
      ACTIVE: [],
      stage_Volver_a_llamar: [],
      stage_Muy_interesado: [],
      stage_No_contesta: [],
      stage_No_interesado: []
    };

    filteredLeads.forEach((lead: any) => {
      const status = lead.lead_status || "ACTIVE";
      if (groups[status]) {
        groups[status].push(lead);
      } else {
        // Fallback o mapeo
        groups["ACTIVE"].push(lead);
      }
    });

    return groups;
  }, [filteredLeads]);

  const selectedCampaignName = useMemo(() => {
    const camp = sellerCampaigns.find((c: any) => c.id === selectedCampaignId);
    return camp?.name || "Campaña";
  }, [sellerCampaigns, selectedCampaignId]);

  return (
    <div className="space-y-6 fade-in">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <UserCheck className="text-primary h-6 w-6" /> Funnel de Tipificación
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualiza tu pipeline de leads en {selectedCampaignName} y actualiza sus estados en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Selector de Campaña */}
          <div className="min-w-[200px]">
            <Select value={selectedCampaignId} onValueChange={handleCampaignChange}>
              <SelectTrigger className="w-full h-9 bg-card rounded-xl border-border shadow-sm">
                <SelectValue placeholder="Seleccionar campaña" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCampaigns ? (
                  <SelectItem value="loading" disabled>Cargando campañas...</SelectItem>
                ) : sellerCampaigns.length === 0 ? (
                  <SelectItem value="empty" disabled>Sin campañas</SelectItem>
                ) : (
                  sellerCampaigns.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["campaign-members-seller"] })}
            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
            title="Refrescar leads"
            disabled={isLoadingLeads}
          >
            <RefreshCw className={cn("h-4 w-4", isLoadingLeads && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Control Bar: Search and Filter Info */}
      <div className="flex items-center gap-3 rounded-xl bg-card border border-border p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar prospecto por nombre, email o celular..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-slate-50/20 focus:bg-card border-border rounded-xl text-xs"
          />
        </div>
        <div className="text-xs text-muted-foreground font-semibold ml-auto flex items-center gap-1.5">
          <Users size={14} className="text-primary/70" />
          Total leads en pantalla: <span className="font-extrabold text-foreground">{filteredLeads.length}</span>
        </div>
      </div>

      {/* Kanban Board Funnel Lanes */}
      {isLoadingLeads ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {STAGES.map((stage) => (
            <div key={stage.id} className="rounded-2xl border border-border p-4 bg-slate-50/20 space-y-4">
              <Skeleton className="h-6 w-2/3 mb-4" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : isErrorLeads ? (
        <div className="rounded-2xl border border-dashed border-destructive/30 p-12 text-center text-destructive bg-destructive/5">
          <p className="font-bold">Error al conectar con el servidor para obtener los miembros de la campaña.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
          {STAGES.map((stage) => {
            const laneLeads = leadsByStage[stage.id] || [];

            return (
              <div
                key={stage.id}
                className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-sm h-[70vh] hover:shadow transition-all duration-300"
              >
                {/* Lane Header */}
                <div className={cn("px-4 py-3.5 border-b flex items-center justify-between font-bold text-xs tracking-wider uppercase", stage.color)}>
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", stage.dotColor)} />
                    {stage.label}
                  </div>
                  <span className="bg-white/40 dark:bg-black/20 text-foreground px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                    {laneLeads.length}
                  </span>
                </div>

                {/* Lane Body Scrollable */}
                <div className="p-3 overflow-y-auto flex-1 space-y-3 bg-slate-50/30 dark:bg-slate-900/10">
                  {laneLeads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4 text-muted-foreground/60 select-none">
                      <Users size={28} className="opacity-20 mb-2" />
                      <p className="text-[10px] font-medium">Sin prospectos en esta etapa</p>
                    </div>
                  ) : (
                    laneLeads.map((lead: any) => {
                      const phone = getPhone(lead);
                      const formattedPhone = phone ? phone.replace(/\D/g, "") : "";
                      const whatsappUrl = formattedPhone ? `https://wa.me/${formattedPhone}` : "";
                      const displayDate = lead.created_at ? format(new Date(lead.created_at), "dd/MM/yy HH:mm") : "-";

                      return (
                        <div
                          key={lead.id}
                          className="bg-card border border-border rounded-xl p-3.5 shadow-sm hover:border-primary/50 transition-all duration-200 group relative space-y-3"
                        >
                          {/* Top Lead Info */}
                          <div className="space-y-1">
                            <h4 className="font-bold text-foreground text-xs leading-snug group-hover:text-primary transition-colors">
                              {lead.first_name} {lead.last_name}
                            </h4>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Calendar size={11} /> {displayDate}
                            </p>
                          </div>

                          {/* Contact Details */}
                          <div className="space-y-1 text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                            {phone && (
                              <p className="flex items-center gap-1.5 font-medium text-foreground">
                                <Phone size={10} className="text-muted-foreground/80" /> {phone}
                              </p>
                            )}
                            {lead.email && (
                              <p className="flex items-center gap-1.5 truncate" title={lead.email}>
                                <Mail size={10} className="text-muted-foreground/80" /> {lead.email}
                              </p>
                            )}
                          </div>

                          {/* Action Bar / Dropdown to change stage */}
                          <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                            <div className="w-full">
                              <select
                                value={lead.lead_status || "ACTIVE"}
                                onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                className="w-full h-7 px-1.5 rounded-lg border border-border bg-slate-50 dark:bg-slate-900 text-[10px] font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer shadow-sm"
                                disabled={updateStatusMutation.isPending}
                              >
                                {STAGES.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    Mover a: {s.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Quick External Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              {whatsappUrl && (
                                <a
                                  href={whatsappUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-7 w-7 rounded-lg border border-border hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-muted-foreground hover:text-emerald-600 flex items-center justify-center transition-all shadow-sm"
                                  title="Enviar WhatsApp"
                                >
                                  <MessageSquare size={13} />
                                </a>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/prospectos/${lead.id}/editar`)}
                                className="h-7 w-7 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all shadow-sm"
                                title="Editar Prospecto"
                              >
                                <Edit size={12} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SellerLeadsView;

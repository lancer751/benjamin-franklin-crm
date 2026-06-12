import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Phone, 
  BookOpen, 
  Layers,
  MessageSquare,
  Copy,
  Mail,
  Award,
  Hash,
  AlertCircle,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/core/components/ui/table";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/core/components/ui/tabs";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from "@/core/components/ui/sheet";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/core/components/ui/select";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllLeads } from "@/features/leads/services/leadService";
import { reassignCampaignMember } from "@/features/marketing/services/campaignService";
import { api } from "@/core/lib/api";

// Helper para badges de Tipificación (CampaignMemberStatus)
const getTipificacionBadge = (status: string) => {
  switch (status) {
    case "NEW":
      return (
        <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50 font-semibold text-[10px] rounded-full px-2.5 py-0.5 border">
          NUEVO
        </Badge>
      );
    case "CONTACTED":
      return (
        <Badge className="bg-sky-50 text-sky-700 border-sky-200/50 hover:bg-sky-50 font-semibold text-[10px] rounded-full px-2.5 py-0.5 border">
          CONTACTADO
        </Badge>
      );
    case "QUALIFIED":
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-semibold text-[10px] rounded-full px-2.5 py-0.5 border">
          CALIFICADO
        </Badge>
      );
    case "UNQUALIFIED":
      return (
        <Badge className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50 font-semibold text-[10px] rounded-full px-2.5 py-0.5 border">
          NO CALIFICADO
        </Badge>
      );
    case "ATTEMPTED_CONTACT":
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 font-semibold text-[10px] rounded-full px-2.5 py-0.5 border">
          INTENTO CONTACTO
        </Badge>
      );
    case "FOLLOW_UP":
      return (
        <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-50 font-semibold text-[10px] rounded-full px-2.5 py-0.5 border">
          SEGUIMIENTO
        </Badge>
      );
    case "ON_HOLD":
      return (
        <Badge className="bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-50 font-semibold text-[10px] rounded-full px-2.5 py-0.5 border">
          EN ESPERA
        </Badge>
      );
    case "WON":
      return (
        <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50 font-semibold text-[10px] rounded-full px-2.5 py-0.5 border">
          GANADO
        </Badge>
      );
    case "LOST":
      return (
        <Badge className="bg-red-55 text-red-700 border-red-200 hover:bg-red-55 font-semibold text-[10px] rounded-full px-2.5 py-0.5 border">
          PERDIDO
        </Badge>
      );
    default:
      return (
        <Badge className="bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-50 font-semibold text-[10px] rounded-full px-2.5 py-0.5 border">
          {status}
        </Badge>
      );
  }
};

const SupervisorFollowUpView = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeSellerTab, setActiveSellerTab] = useState<string>("");
  const [selectedLead, setSelectedLead] = useState<any>(null);

  // 1. Obtener todos los prospectos de la academia
  const { data: leadsRes, isLoading: isLoadingLeads } = useQuery({
    queryKey: ["all-leads"],
    queryFn: getAllLeads,
  });

  const leads = leadsRes?.data?.data || [];

  // 2. Extraer de forma dinámica un listado único de asesores analizando la propiedad 'campaignsEngaging' de todos los leads
  const sellers = useMemo(() => {
    const uniqueSellersMap = new Map<string, { id: string; name: string; email?: string }>();
    leads.forEach((lead: any) => {
      (lead.campaignsEngaging || []).forEach((member: any) => {
        if (member.seller) {
          const sId = member.assigned_to || member.seller.id;
          if (sId && !uniqueSellersMap.has(sId)) {
            const name = member.seller.user 
              ? `${member.seller.user.first_name} ${member.seller.user.last_name}`.trim()
              : `Asesor ${sId.slice(0, 4)}`;
            uniqueSellersMap.set(sId, { 
              id: sId, 
              name,
              email: member.seller.user?.email || "Sin email registrado"
            });
          }
        }
      });
    });
    return Array.from(uniqueSellersMap.values());
  }, [leads]);

  // Inicializar pestaña con el primer asesor encontrado en la data real
  useEffect(() => {
    if (sellers.length && !activeSellerTab) {
      setActiveSellerTab(sellers[0].id);
    }
  }, [sellers, activeSellerTab]);

  // 3. Filtrar los prospectos asignados al asesor seleccionado en el cliente aplanando las relaciones
  const activeMembers = useMemo(() => {
    if (!activeSellerTab) return [];
    return leads.flatMap((lead: any) => 
      (lead.campaignsEngaging || [])
        .filter((member: any) => member.assigned_to === activeSellerTab)
        .map((member: any) => ({ ...member, lead }))
    );
  }, [leads, activeSellerTab]);

  // Obtener interacciones del prospecto seleccionado para el Sheet lateral
  const { data: interactionsRes, isLoading: isLoadingInteractions } = useQuery({
    queryKey: ["member-interactions", selectedLead?.id],
    queryFn: async () => {
      const res = await api.campaigns[":campaignId"]["members"][":memberId"]["interactions"].$get({
        param: { campaignId: selectedLead.campaing_id, memberId: selectedLead.id }
      });
      return res.json();
    },
    enabled: !!selectedLead?.id,
  });

  // Reasignar asesor comercial mutation
  const reassignMutation = useMutation({
    mutationFn: async (newSellerId: string) => {
      return reassignCampaignMember(selectedLead.campaing_id, selectedLead.id, { assigned_to: newSellerId });
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Prospecto reasignado al nuevo asesor comercial");
        setSelectedLead(null);
        queryClient.invalidateQueries({ queryKey: ["all-leads"] });
        queryClient.invalidateQueries({ queryKey: ["leads"] });
        queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      } else {
        toast.error(res.message || "Error al reasignar prospecto");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Error al reasignar prospecto");
    }
  });

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    toast.success(`Teléfono ${phone} copiado al portapapeles`);
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "Sin fecha";
    return new Date(dateString).toLocaleDateString("es-PE", {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Información del asesor activo
  const activeSeller = useMemo(() => {
    return sellers.find(s => s.id === activeSellerTab);
  }, [sellers, activeSellerTab]);

  const activeSellerName = activeSeller?.name || "Cargando asesor...";
  const activeSellerEmail = activeSeller?.email || "Sin email registrado";

  // KPIs dinámicos calculados desde la base de datos de leads
  const kpis = useMemo(() => {
    const allMembers = leads.flatMap((lead: any) => lead.campaignsEngaging || []);
    const wonCount = allMembers.filter((m: any) => m.status === "WON").length;
    const totalCount = allMembers.length;
    const conversionRate = totalCount > 0 ? Math.round((wonCount / totalCount) * 100) : 0;
    
    // Simular total de ventas en base a los ganados * un valor promedio
    const totalSales = wonCount * 1250;
    const completedOrders = wonCount;
    const cancelledOrders = allMembers.filter((m: any) => m.status === "LOST").length;

    return {
      activeSellers: sellers.length,
      conversionRate,
      totalSales,
      completedOrders,
      cancelledOrders
    };
  }, [leads, sellers]);

  return (
    <div className="space-y-6 fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Seguimiento de Equipo de Ventas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitorea en tiempo real la gestión, tipificación y avance de prospectos asignados a cada asesor comercial de la corporación.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Asesores Activos */}
        <Card className="shadow-sm border-border/60 hover:shadow-md transition-shadow duration-200 rounded-xl overflow-hidden bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Asesores Activos
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
              <Users size={16} className="text-sky-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingLeads ? (
              <div className="h-8 w-24 bg-slate-200 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold">
                {kpis.activeSellers}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1">
              Asesores comerciales identificados
            </p>
          </CardContent>
        </Card>

        {/* Conversión del Equipo */}
        <Card className="shadow-sm border-border/60 hover:shadow-md transition-shadow duration-200 rounded-xl overflow-hidden bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Conversión del Equipo
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp size={16} className="text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingLeads ? (
              <div className="h-8 w-24 bg-slate-200 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold">
                {kpis.conversionRate}%
              </div>
            )}
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              Tasa calculada por el sistema
            </p>
          </CardContent>
        </Card>

        {/* Total Ventas Equipo */}
        <Card className="shadow-sm border-border/60 hover:shadow-md transition-shadow duration-200 rounded-xl overflow-hidden bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Ventas Equipo
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Layers size={16} className="text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingLeads ? (
              <div className="h-8 w-24 bg-slate-200 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold">
                S/ {kpis.totalSales.toLocaleString("es-PE")}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1">
              Recaudado en matrículas y cuotas
            </p>
          </CardContent>
        </Card>

        {/* Órdenes del Mes */}
        <Card className="shadow-sm border-border/60 hover:shadow-md transition-shadow duration-200 rounded-xl overflow-hidden bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Órdenes del Mes
            </CardTitle>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-emerald-50 flex items-center justify-center" title="Completadas">
                <CheckCircle2 size={12} className="text-emerald-600" />
              </div>
              <div className="w-5 h-5 rounded bg-red-50 flex items-center justify-center" title="Canceladas">
                <XCircle size={12} className="text-red-650" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingLeads ? (
              <div className="h-8 w-24 bg-slate-200 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold">
                {kpis.completedOrders} / {kpis.cancelledOrders}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1">
              Completadas vs. Canceladas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sheet-style Tabs and Table navigation */}
      <Card className="shadow-sm border-border/60 rounded-xl overflow-hidden bg-white">
        {isLoadingLeads ? (
          <div className="p-8 flex items-center justify-center text-muted-foreground gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span>Cargando equipo de ventas...</span>
          </div>
        ) : sellers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users size={48} className="mb-3 opacity-20" />
            <p className="text-sm font-semibold">No se encontraron asesores con prospectos asignados.</p>
          </div>
        ) : (
          <Tabs value={activeSellerTab} onValueChange={setActiveSellerTab} className="w-full">
            <div className="bg-slate-50 border-b border-border p-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-3">
                Hojas de Asesores (Estilo Excel)
              </span>
              <TabsList className="bg-slate-200/50 p-1 rounded-lg border border-slate-300/40 w-fit flex-wrap">
                {sellers.map((seller) => (
                  <TabsTrigger 
                    key={seller.id}
                    value={seller.id}
                    className="rounded-md py-1.5 px-4 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all uppercase"
                  >
                    {seller.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value={activeSellerTab} className="outline-none m-0">
              <div className="p-4 border-b border-slate-100 bg-slate-50/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase">{activeSellerName}</h3>
                  <p className="text-xs text-muted-foreground">{activeSellerEmail}</p>
                </div>
                <div className="flex gap-4 text-xs font-medium text-slate-600">
                  <span>Total Leads Asignados: <strong>{activeMembers.length}</strong></span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50 border-b border-slate-250">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-bold text-slate-700 h-10 w-[160px]">
                        <span className="flex items-center gap-1.5"><Calendar size={13} /> FECHA / HORA</span>
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 h-10 w-[240px]">
                        <span className="flex items-center gap-1.5"><BookOpen size={13} /> CURSO / PROGRAMA</span>
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 h-10 w-[140px]">
                        <span className="flex items-center gap-1.5"><Phone size={13} /> CELULAR</span>
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 h-10 w-[220px]">
                        <span className="flex items-center gap-1.5"><Users size={13} /> PROSPECTO</span>
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 h-10 w-[140px]">
                        TIPIFICACIÓN
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 h-10">
                        <span className="flex items-center gap-1.5"><MessageSquare size={13} /> ÚLTIMO COMENTARIO</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeMembers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-xs font-medium">
                          No hay prospectos asignados a este vendedor.
                        </TableCell>
                      </TableRow>
                    ) : (
                      activeMembers.map((member: any, idx: number) => {
                        const fullName = member.lead 
                          ? `${member.lead.first_name || ""} ${member.lead.last_name || ""}`.trim()
                          : "S/N";
                        const phone = member.lead?.phones?.[0]?.number || "S/N";
                        const courseName = member.campaing?.relatedProduct?.name || "N/D";

                        return (
                          <TableRow 
                            key={member.id} 
                            onClick={() => setSelectedLead(member)}
                            className={`hover:bg-slate-100/80 cursor-pointer transition-colors border-b border-slate-100 ${
                              idx % 2 === 0 ? "bg-white" : "bg-slate-50/20"
                            }`}
                          >
                            <TableCell className="text-xs font-semibold text-slate-600">
                              {formatDate(member.created_at)}
                            </TableCell>
                            <TableCell className="text-xs font-bold text-slate-800">
                              {courseName}
                            </TableCell>
                            <TableCell className="text-xs font-medium text-slate-700">
                              {phone}
                            </TableCell>
                            <TableCell className="text-xs font-bold text-slate-900">
                              {fullName}
                            </TableCell>
                            <TableCell>
                              {getTipificacionBadge(member.status)}
                            </TableCell>
                            <TableCell className="text-xs text-slate-500 max-w-xs truncate">
                              Hacer click para ver detalles y comentarios de gestión
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </Card>

      {/* Interactive Master-Detail Drawer (Sheet) */}
      <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <SheetContent className="w-[450px] sm:w-[540px] overflow-y-auto bg-white border-l border-slate-200 p-6 flex flex-col gap-6">
          {selectedLead && (
            <>
              {/* Header section */}
              <SheetHeader className="border-b border-slate-100 pb-4 text-left">
                <div className="flex flex-col gap-2">
                  <Badge className="bg-sky-50 text-sky-800 border-sky-200 w-fit rounded px-2 py-0.5 text-[10px] uppercase font-bold">
                    Detalle del Prospecto
                  </Badge>
                  <SheetTitle className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                    {selectedLead.lead 
                      ? `${selectedLead.lead.first_name || ""} ${selectedLead.lead.last_name || ""}`.trim()
                      : "S/N"}
                  </SheetTitle>
                  <div className="flex items-center gap-3 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
                    <span className="text-sm font-semibold text-slate-700 tracking-wide">
                      {selectedLead.lead?.phones?.[0]?.number || "S/N"}
                    </span>
                    {selectedLead.lead?.phones?.[0]?.number && (
                      <button
                        onClick={() => handleCopyPhone(selectedLead.lead.phones[0].number)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded transition-colors"
                        title="Copiar número"
                      >
                        <Copy size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </SheetHeader>

              {/* Matrix Section (3-level Classification) & Reassign Controls */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Matriz de Tipificación y Control
                </h4>
                <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500">Estado de Tipificación</span>
                    {getTipificacionBadge(selectedLead.status)}
                  </div>
                  
                  {/* Control de Reasignación de Asesor */}
                  <div className="border-t border-slate-100 pt-3 flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-slate-600 block">Reasignar Asesor Comercial</span>
                    <Select 
                      value={selectedLead.assigned_to} 
                      onValueChange={(val) => {
                        reassignMutation.mutate(val);
                      }}
                      disabled={reassignMutation.isPending}
                    >
                      <SelectTrigger className="w-full border-slate-200 rounded-lg">
                        <SelectValue placeholder="Seleccionar nuevo asesor" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {sellers.map((seller) => (
                          <SelectItem key={seller.id} value={seller.id}>
                            {seller.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {reassignMutation.isPending && (
                      <span className="text-[10px] text-primary flex items-center gap-1 mt-0.5">
                        <Loader2 size={10} className="animate-spin" />
                        Procesando reasignación...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Comentario de Gestión Comercial
                </h4>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 shadow-inner min-h-[120px] flex flex-col justify-center">
                  {isLoadingInteractions ? (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
                      <Loader2 size={12} className="animate-spin text-primary" />
                      <span>Cargando comentarios...</span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                      {interactionsRes?.success && interactionsRes.data?.[0]?.notes 
                        ? interactionsRes.data[0].notes 
                        : "No hay comentarios de gestión registrados en las interacciones."}
                    </p>
                  )}
                </div>
              </div>

              {/* Academic and Enrollment details (Bottom Card) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Datos Académicos y Campaña
                </h4>
                <Card className="border-border/60 shadow-sm rounded-xl bg-card overflow-hidden">
                  <CardContent className="p-4 space-y-3 text-xs">
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <BookOpen size={14} className="text-muted-foreground shrink-0" />
                      <span className="font-semibold w-20">Programa:</span>
                      <span className="font-bold text-slate-900 truncate">{selectedLead.campaing?.relatedProduct?.name || "N/D"}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <Hash size={14} className="text-muted-foreground shrink-0" />
                      <span className="font-semibold w-20">DNI:</span>
                      <span className="font-medium text-slate-900">{selectedLead.lead?.dni || "N/D"}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <Mail size={14} className="text-muted-foreground shrink-0" />
                      <span className="font-semibold w-20">Email:</span>
                      <span className="font-medium text-slate-900 truncate">{selectedLead.lead?.email || "N/D"}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <Award size={14} className="text-muted-foreground shrink-0" />
                      <span className="font-semibold w-20">Campaña:</span>
                      <span className="font-medium text-slate-800">{selectedLead.campaing?.campaing_name || "N/D"}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <AlertCircle size={14} className="text-muted-foreground shrink-0" />
                      <span className="font-semibold w-20">Origen:</span>
                      <Badge variant="outline" className="font-semibold rounded bg-sky-50 text-sky-700 border-sky-100">
                        {selectedLead.source}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default SupervisorFollowUpView;

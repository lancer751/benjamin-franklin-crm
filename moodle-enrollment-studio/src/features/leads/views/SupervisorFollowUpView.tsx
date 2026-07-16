import { useState, useEffect } from "react";
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
import { Checkbox } from "@/core/components/ui/checkbox";
import { Button } from "@/core/components/ui/button";
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
import { useSupervisorFollowUp } from "../hooks/useSupervisorFollowUp";

// Helper para mapear estados a español
const mapStatusToSpanish = (status: string): string => {
  const normalized = status?.toUpperCase() || "";
  if (normalized === "NEW") return "NUEVO";
  if (normalized === "CONTACTED" || normalized === "FOLLOW_UP") return "CONTACTADO";
  if (normalized === "ATTEMPTED_CONTACT") return "NO CONTACTADO";
  if (normalized === "QUALIFIED" || normalized === "ON_HOLD") return "PREVENTA - CITA";
  if (normalized === "WON") return "MATRICULADO";
  if (normalized === "LOST" || normalized === "UNQUALIFIED") return "DESCARTADO";
  return normalized;
};

// Helper para badges de Tipificación (CampaignMemberStatus)
const getTipificacionBadge = (status: string) => {
  const spanishStage = mapStatusToSpanish(status);
  let classes = "font-semibold text-[10px] rounded-full px-2.5 py-0.5 border shadow-none ";

  if (spanishStage === "MATRICULADO") {
    classes += "border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50/50";
  } else if (spanishStage === "PREVENTA - CITA") {
    classes += "border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50/50";
  } else if (spanishStage === "NO CONTACTADO") {
    classes += "border-purple-200 text-purple-700 bg-purple-50/50 hover:bg-purple-50/50";
  } else if (spanishStage === "CONTACTADO") {
    classes += "border-amber-200 text-amber-700 bg-amber-50/50 hover:bg-amber-50/50";
  } else if (spanishStage === "NUEVO") {
    classes += "border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-50/50";
  } else if (spanishStage === "DESCARTADO") {
    classes += "border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-50/50";
  } else {
    classes += "border-slate-200 text-slate-700 bg-slate-50/50 hover:bg-slate-50/50";
  }

  return (
    <Badge className={classes} variant="outline">
      {spanishStage}
    </Badge>
  );
};

const SupervisorFollowUpView = () => {
  const navigate = useNavigate();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetSellerId, setTargetSellerId] = useState<string>("");

  const {
    sellers,
    activeSellerTab,
    setActiveSellerTab,
    activeSeller,
    activeMembers,
    isLoadingLeads,
    selectedLead,
    setSelectedLead,
    interactionsRes,
    isLoadingInteractions,
    reassignMutation,
    bulkReassignMutation,
    kpis,
    realSellers,
  } = useSupervisorFollowUp();

  useEffect(() => {
    setSelectedIds([]);
    setTargetSellerId("");
  }, [activeSellerTab]);

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

  const activeSellerName = activeSeller?.name || "Cargando asesor...";
  const activeSellerEmail = activeSeller?.email || "Sin email registrado";

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
        ) : (
          <Tabs value={activeSellerTab} onValueChange={setActiveSellerTab} className="w-full">
            <div className="bg-slate-50 border-b border-border p-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-3">
                Hojas de Asesores (Estilo Excel)
              </span>
              <TabsList className="bg-slate-200/50 p-1 rounded-lg border border-slate-300/40 w-fit flex-wrap gap-1">
                {sellers.map((seller: any) => {
                  const isAll = seller.id === "ALL";
                  return (
                    <TabsTrigger 
                      key={seller.id}
                      value={seller.id}
                      className={`rounded-md py-1.5 px-4 text-xs font-semibold transition-all uppercase ${
                        isAll
                          ? "data-[state=active]:bg-sky-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 hover:text-slate-950"
                          : "data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-slate-600 hover:text-slate-950"
                      }`}
                    >
                      {seller.name}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            <TabsContent value={activeSellerTab} className="outline-none m-0">
              <div className="p-4 border-b border-slate-100 bg-slate-50/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase">{activeSellerName}</h3>
                  <p className="text-xs text-muted-foreground">
                    {activeSellerTab === "ALL" 
                      ? "Vista global de prospectos de la corporación" 
                      : activeSellerEmail}
                  </p>
                </div>
                <div className="flex gap-4 text-xs font-medium text-slate-600">
                  <span>
                    {activeSellerTab === "ALL" ? "Total Leads" : "Total Leads Asignados"}: <strong>{activeMembers.length}</strong>
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50 border-b border-slate-250">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[50px] text-center">
                        {activeSellerTab !== "UNASSIGNED" && (
                          <Checkbox 
                            checked={
                              activeMembers.length > 0 && 
                              activeMembers.filter(m => !m.id.startsWith("unassigned-")).length > 0 &&
                              activeMembers
                                .filter(m => !m.id.startsWith("unassigned-"))
                                .every(m => selectedIds.includes(m.id))
                            }
                            onCheckedChange={(checked) => {
                              if (checked) {
                                const idsToAdd = activeMembers
                                  .filter(m => !m.id.startsWith("unassigned-"))
                                  .map(m => m.id);
                                setSelectedIds(prev => Array.from(new Set([...prev, ...idsToAdd])));
                              } else {
                                const idsToRemove = activeMembers
                                  .filter(m => !m.id.startsWith("unassigned-"))
                                  .map(m => m.id);
                                setSelectedIds(prev => prev.filter(id => !idsToRemove.includes(id)));
                              }
                            }}
                          />
                        )}
                      </TableHead>
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
                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-xs font-medium">
                          No hay prospectos asignados a este vendedor.
                        </TableCell>
                      </TableRow>
                    ) : (
                      activeMembers.map((member: any, idx: number) => {
                        const fullName = member.lead 
                          ? `${member.lead.first_name || ""} ${member.lead.last_name || ""}`.trim()
                          : "S/N";
                        const phone = member.lead?.phones?.[0]?.number || "S/N";
                        const courseName = member.campaign?.name || member.campaing?.name || "Sin campaña";

                        return (
                          <TableRow 
                            key={member.id} 
                            onClick={() => setSelectedLead(member)}
                            className={`hover:bg-slate-100/80 cursor-pointer transition-colors border-b border-slate-100 ${
                              idx % 2 === 0 ? "bg-white" : "bg-slate-50/20"
                            }`}
                          >
                            <TableCell className="w-[50px] text-center" onClick={(e) => e.stopPropagation()}>
                              {activeSellerTab !== "UNASSIGNED" && !member.id.startsWith("unassigned-") ? (
                                <Checkbox
                                  checked={selectedIds.includes(member.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedIds((prev) => [...prev, member.id]);
                                    } else {
                                      setSelectedIds((prev) => prev.filter((x) => x !== member.id));
                                    }
                                  }}
                                />
                              ) : null}
                            </TableCell>
                            <TableCell className="text-xs font-semibold text-slate-600">
                              {formatDate(member.lead?.created_at || member.created_at)}
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
        <SheetContent className="w-full sm:max-w-xl bg-white border-l border-slate-200 p-6 flex flex-col gap-6 h-full">
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

              {/* Scrollable Body Container */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-6">
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
                      <span className="text-xs font-semibold text-slate-600 block">Reassignar Asesor Comercial</span>
                      <Select 
                        value={selectedLead.assigned_to === "UNASSIGNED" ? undefined : selectedLead.assigned_to} 
                        onValueChange={(val) => {
                          reassignMutation.mutate(val);
                        }}
                        disabled={reassignMutation.isPending}
                      >
                        <SelectTrigger className="w-full border-slate-200 rounded-lg">
                          <SelectValue placeholder="Seleccionar nuevo asesor" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {realSellers.map((seller: any) => (
                          <SelectItem key={seller.id} value={seller.id}>
                            {`${seller.user?.first_name || ""} ${seller.user?.last_name || ""}`.trim() || "Vendedor"}
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
                  <div className="min-h-[120px] flex flex-col justify-start">
                    {isLoadingInteractions ? (
                      <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs py-8 bg-slate-50 border border-slate-100 rounded-xl shadow-inner">
                        <Loader2 size={12} className="animate-spin text-primary" />
                        <span>Cargando comentarios...</span>
                      </div>
                    ) : !(interactionsRes?.success && Array.isArray(interactionsRes.data) && interactionsRes.data.length > 0) ? (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-1.5 bg-slate-50 border border-slate-100 rounded-xl shadow-inner">
                        <BookOpen size={24} className="opacity-40 mb-1" />
                        <p className="text-xs font-medium">No hay bitácoras de llamadas aún para este período.</p>
                      </div>
                    ) : (
                      <div className="relative border-l border-slate-200 ml-4 pl-6 space-y-6">
                        {interactionsRes.data.map((interaction: any) => {
                          const isWhatsapp = interaction.type === "WHATSAPP";
                          const isCall = interaction.type === "CALL";
                          const dotBorderColor = isWhatsapp 
                            ? "border-green-500" 
                            : isCall 
                              ? "border-blue-500" 
                              : "border-slate-300";
                          const dotInnerBg = isWhatsapp
                            ? "bg-green-500"
                            : isCall
                              ? "bg-blue-500"
                              : "bg-slate-300";

                          return (
                            <div key={interaction.id} className="relative">
                              {/* absolute dot marker */}
                              <div className={`absolute -left-[33px] top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${dotBorderColor}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${dotInnerBg}`} />
                              </div>
                              {/* content globe */}
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-normal">
                                {interaction.notes}
                              </div>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                Por: {interaction.seller?.user?.first_name ? `${interaction.seller.user.first_name} ${interaction.seller.user.last_name || ""}`.trim() : "Sistema"} • Canal: {interaction.type || "N/A"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
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
                        <span className="font-bold text-slate-900 truncate">{selectedLead.campaign?.name || selectedLead.campaing?.name || "Sin campaña"}</span>
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
                        <span className="font-medium text-slate-800">{selectedLead.campaign?.name || selectedLead.campaing?.name || "N/D"}</span>
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
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Floating Action Bar for Bulk Reassignment */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border border-slate-200 shadow-xl rounded-full px-6 py-3 flex items-center gap-4 z-50 animate-in fade-in slide-in-from-bottom-4">
          <span className="text-sm font-semibold text-slate-700">
            {selectedIds.length} leads seleccionados
          </span>
          <Select value={targetSellerId} onValueChange={setTargetSellerId}>
            <SelectTrigger className="w-[200px] border-slate-200 rounded-full h-9 bg-white">
              <SelectValue placeholder="Seleccionar asesor" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {realSellers.map((seller: any) => (
                <SelectItem key={seller.id} value={seller.id}>
                  {`${seller.user?.first_name || ""} ${seller.user?.last_name || ""}`.trim() || "Vendedor"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="default"
            size="sm"
            className="rounded-full bg-primary text-white hover:bg-primary/90"
            disabled={!targetSellerId || bulkReassignMutation.isPending}
            onClick={() => {
              const firstSelectedId = selectedIds[0];
              const member = activeMembers.find(
                m => m.id === firstSelectedId
              );
              const campaignId = member?.campaing_id || member?.campaign_id || member?.campaign?.id || member?.campaing?.id;
              
              if (!campaignId) {
                toast.error("No se pudo determinar la campaña asociada.");
                return;
              }

              bulkReassignMutation.mutate({
                campaignId,
                memberIds: selectedIds,
                assignedTo: targetSellerId
              }, {
                onSuccess: () => {
                  setSelectedIds([]);
                  setTargetSellerId("");
                }
              });
            }}
          >
            {bulkReassignMutation.isPending ? "Reasignando..." : "Reasignar Asesor"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SupervisorFollowUpView;

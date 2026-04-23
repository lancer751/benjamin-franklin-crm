import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, UserPlus, Calendar, Monitor, Users, DollarSign, TrendingUp, BarChart3, Loader2 } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getCampaignById } from "../services/campaignService";

const CampaignDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => getCampaignById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p>Cargando detalles de la campaña...</p>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-destructive">
        <p className="font-bold text-lg">No se pudo cargar la campaña o no existe.</p>
        <button onClick={() => navigate("/campanas")} className="btn-secondary mt-4">Volver a Campañas</button>
      </div>
    );
  }

  const campaign = data.data;

  const initialBudget = Number(campaign.initial_budget) || 0;
  const totalSpent = Number(campaign.total_spent) || 0;
  const spentPercent = initialBudget > 0 ? Math.round((totalSpent / initialBudget) * 100) : 0;

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "Sin fecha de fin";
    return new Date(dateString).toLocaleDateString("es-PE", { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/campanas")}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{campaign.campaing_name}</h1>
            <Badge className={campaign.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-muted text-muted-foreground"}>
              {campaign.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">ID: {campaign.id} • Plataforma: {campaign.platform}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><UserPlus size={16} className="mr-1" /> Asignar Vendedor</Button>
          <Button variant="outline" size="sm"><Edit size={16} className="mr-1" /> Editar Campaña</Button>
          <Button variant="destructive" size="sm"><Trash2 size={16} className="mr-1" /> Eliminar</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: "Presupuesto", value: `$${initialBudget.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: DollarSign, sub: "Total asignado" },
          { label: "Gastado", value: `$${totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: BarChart3, sub: `${spentPercent}% utilizado` },
          { label: "Estado", value: campaign.status, icon: TrendingUp, sub: campaign.platform },
          { label: "Inicio", value: formatDate(campaign.start_date), icon: Calendar, sub: "Fecha de inicio" },
          { label: "Fin", value: formatDate(campaign.end_date), icon: Calendar, sub: "Fecha de cierre" },
        ].map((kpi, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
                <kpi.icon size={16} className="text-primary" />
              </div>
              <p className="text-xl font-bold text-foreground mt-2">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edition Info */}
      <Card>
        <CardHeader className="flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg">Edición del Curso</CardTitle>
          <Button variant="outline" size="sm"><Edit size={14} className="mr-1" /> Editar Edición</Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Curso</p>
              <p className="font-semibold text-foreground">{campaign.edition?.course?.name || "N/D"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Modalidad</p>
              <div className="flex items-center gap-2">
                <Monitor size={14} className="text-primary" />
                <p className="text-foreground">{campaign.edition?.modality?.name || "N/D"}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Horario</p>
              <p className="text-foreground text-muted-foreground">N/D</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Capacidad</p>
              <div className="flex items-center gap-2">
                <Users size={14} className="text-primary" />
                <p className="text-foreground text-muted-foreground">-</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Inicio de Clases</p>
              <p className="text-foreground">
                {campaign.edition?.start_date ? formatDate(campaign.edition.start_date) : "N/D"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sellers Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Vendedores Asignados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Vendedor</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Leads Asignados</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Conversiones</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tasa</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground/70">
                  No hay datos de vendedores disponibles desde el servidor
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignDetailView;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, SlidersHorizontal, Download, TrendingUp, BarChart3, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import CampaignForm from "@/marketing/components/CampaignForm";
import { useQuery } from "@tanstack/react-query";
import { getCampaigns } from "../services/campaignService";

const platformColors: Record<string, string> = {
  FACEBOOK: "bg-blue-500",
  INSTAGRAM: "bg-pink-500",
  TIKTOK: "bg-foreground",
  WEBSITE: "bg-emerald-500",
};

const formatCurrency = (value: number) => {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
};

const CampaignsView = () => {
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  // 1. Fetching de Datos
  const { data: campaignsRes, isLoading, isError } = useQuery({
    queryKey: ["campaigns"],
    queryFn: getCampaigns,
  });

  const campaigns = Array.isArray(campaignsRes) ? campaignsRes : (campaignsRes as any)?.data || [];

  // 2. KPIs Dinámicos
  const totalBudget = campaigns.reduce((acc: number, c: any) => acc + (Number(c.initial_budget) || 0), 0);
  const totalSpent = campaigns.reduce((acc: number, c: any) => acc + (Number(c.total_spent) || 0), 0);
  const activeCampaigns = campaigns.filter((c: any) => c.status === "ACTIVE").length;
  const spentPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  // 3. Paginación del lado del Cliente
  const totalPages = Math.ceil(campaigns.length / itemsPerPage);
  const paginatedCampaigns = campaigns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campañas</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona y analiza el rendimiento de tus campañas de captación.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={18} /> Nueva Campaña
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Presupuesto Total</p>
            <BarChart3 size={18} className="text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{formatCurrency(totalBudget)}</p>
          <span className="inline-flex mt-2 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Calculado en vivo</span>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total Gastado</p>
            <BarChart3 size={18} className="text-muted-foreground" />
          </div>
          <div className="flex items-baseline gap-3 mt-2">
            <span className="text-2xl font-bold text-foreground">{formatCurrency(totalSpent)}</span>
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-foreground" style={{ width: `${spentPercent}%` }} />
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Campañas Activas</p>
            <TrendingUp size={18} className="text-muted-foreground" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-foreground">{activeCampaigns}</span>
            <span className="text-sm text-muted-foreground">de {campaigns.length} totales</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-bold text-foreground">Listado de Campañas</h2>
          <div className="flex items-center gap-2">
            <button className="btn-secondary text-xs px-3 py-2"><SlidersHorizontal size={14} /> Filtrar</button>
            <button className="btn-secondary text-xs px-3 py-2"><Download size={14} /> Exportar</button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
            <p>Cargando campañas...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-destructive">
            <p className="font-bold">Error al conectar con el servidor.</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p>No hay campañas registradas aún.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Nombre de Campaña</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Curso Asociado</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Plataforma</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Presupuesto</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Gastado</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCampaigns.map((c: any) => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/campanas/${c.id}`)}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">{c.campaing_name}</p>
                      <p className="text-xs text-muted-foreground">ID: {c.id}</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground/70 italic">Ver detalle</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-2 text-foreground">
                        <span className={`h-2 w-2 rounded-full ${platformColors[c.platform] || "bg-gray-400"}`} />
                        {c.platform || "N/E"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-foreground font-medium">{formatCurrency(Number(c.initial_budget) || 0)}</td>
                    <td className="px-6 py-4 text-foreground font-medium">{formatCurrency(Number(c.total_spent) || 0)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide border ${
                        c.status === "ACTIVE" ? "border-emerald-200 text-emerald-700 bg-emerald-50" : "border-border text-muted-foreground bg-muted"
                      }`}>{c.status || "UNKNOWN"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="flex items-center justify-between border-t border-border px-6 py-3 bg-muted/20">
              <span className="text-sm text-muted-foreground">
                Mostrando {paginatedCampaigns.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a {Math.min(currentPage * itemsPerPage, campaigns.length)} de {campaigns.length} campañas
              </span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.max(1, prev - 1)); }}
                  disabled={currentPage === 1}
                  className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <button className="h-8 w-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {currentPage}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.min(totalPages, prev + 1)); }}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Eliminamos temporalmente el onSubmit de CampaignForm si no se usa directamente aquí, o lo mantenemos para no romper props */}
      <CampaignForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
};

export default CampaignsView;

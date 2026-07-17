import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  Megaphone,
  Phone,
  RefreshCw,
  Shield,
  Target,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { useSellerDetail } from "../hooks/useSellerDetail";
import type { LeadSource, LeadStatus } from "../adapters/seller.adapter";

const integerFormatter = new Intl.NumberFormat("es-PE", {
  maximumFractionDigits: 0,
});

const moneyFormatter = new Intl.NumberFormat("es-PE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const formatInteger = (value: number) => integerFormatter.format(value);
const formatMoney = (value: number) => `S/ ${moneyFormatter.format(value)}`;
const formatPercentage = (value: number) =>
  `${new Intl.NumberFormat("es-PE", { maximumFractionDigits: 2 }).format(value)}%`;

const formatDuration = (totalSeconds: number): string => {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const parts: string[] = [];

  if (hours > 0) parts.push(`${hours} h`);
  if (minutes > 0) parts.push(`${minutes} min`);
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds} s`);

  return parts.join(" ");
};

const formatDate = (value: string | null, fallback: string): string => {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : dateFormatter.format(date);
};

const leadStatusLabels: Array<{ status: LeadStatus; label: string }> = [
  { status: "NEW", label: "Nuevos" },
  { status: "ATTEMPTED_CONTACT", label: "Contacto intentado" },
  { status: "CONTACTED", label: "Contactados" },
  { status: "QUALIFIED", label: "Calificados" },
  { status: "FOLLOW_UP", label: "Seguimiento" },
  { status: "WON", label: "Ganados" },
  { status: "LOST", label: "Perdidos" },
];

const leadSourceLabels: Array<{ source: LeadSource; label: string }> = [
  { source: "FACEBOOK", label: "Facebook" },
  { source: "INSTAGRAM", label: "Instagram" },
  { source: "TIKTOK", label: "TikTok" },
  { source: "WHATSAPP", label: "WhatsApp" },
  { source: "WEBSITE", label: "Sitio web" },
];

interface SellerDetailViewProps {
  sellerUserId?: string;
}

export default function SellerDetailView({ sellerUserId }: SellerDetailViewProps) {
  const navigate = useNavigate();
  const {
    seller,
    isMissingId,
    isProfileLoading,
    isProfileError,
    isCampaignsLoading,
    isCampaignsError,
    refetch,
  } = useSellerDetail(sellerUserId);

  if (isProfileLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-sm font-medium text-slate-500">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          Cargando perfil del asesor comercial...
        </div>
      </div>
    );
  }

  if (isMissingId || isProfileError || !seller) {
    return (
      <div className="mx-auto mt-16 max-w-lg space-y-4 rounded-2xl border border-rose-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
          <AlertTriangle className="h-7 w-7 text-rose-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">No se pudo cargar el perfil</h2>
        <p className="text-sm leading-relaxed text-slate-500">
          {isMissingId
            ? "No se pudo identificar al usuario vendedor autenticado."
            : "No se encontró el perfil comercial solicitado o ocurrió un error al consultarlo."}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button onClick={() => navigate(-1)} variant="outline" size="sm">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Volver atrás
          </Button>
          <Button onClick={refetch} size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const goalCompletion = seller.salesTarget > 0
    ? (seller.totalSales / seller.salesTarget) * 100
    : 0;
  const activeCampaigns = seller.campaigns.filter(
    (campaign) => campaign.status === "ACTIVE",
  ).length;

  const mainIndicators = [
    {
      label: "Meta de ventas",
      value: formatInteger(seller.salesTarget),
      helper: "Ventas esperadas",
      icon: Target,
      tone: "bg-blue-50 text-blue-600",
    },
    {
      label: "Ventas realizadas",
      value: formatInteger(seller.totalSales),
      helper: "Ventas acumuladas",
      icon: TrendingUp,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Cumplimiento de meta",
      value: formatPercentage(goalCompletion),
      helper: seller.salesTarget === 0 ? "Sin meta asignada" : "Avance del objetivo",
      icon: BarChart3,
      tone: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Leads asignados",
      value: formatInteger(seller.campaignMembers.length),
      helper: "Leads bajo gestión",
      icon: Users,
      tone: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 fade-in">
      <Link
        to="/comercial/seguimiento-equipo"
        className="inline-flex items-center text-xs font-semibold text-slate-500 transition-colors hover:text-slate-800"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Volver al Seguimiento de Equipo
      </Link>

      <section className="flex flex-col justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center">
        <div className="flex items-start gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-2xl font-black text-white shadow-md">
            {(seller.fullName[0] || "V").toUpperCase()}
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">{seller.fullName}</h1>
              <Badge className={seller.isActive
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-none"
                : "border border-slate-200 bg-slate-100 text-slate-500 shadow-none"}
              >
                <Shield className="mr-1 h-3 w-3" />
                {seller.isActive ? "Activo" : "Inactivo"}
              </Badge>
              <Badge variant="outline">Asesor de ventas</Badge>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{seller.email}</span>
              <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{seller.phone ?? "Sin teléfono registrado"}</span>
            </div>
          </div>
        </div>
        <Button onClick={refetch} variant="outline" size="sm" className="self-end lg:self-auto">
          <RefreshCw className="mr-2 h-4 w-4" /> Actualizar
        </Button>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mainIndicators.map((indicator) => (
          <div key={indicator.label} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{indicator.label}</span>
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${indicator.tone}`}>
                <indicator.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="text-2xl font-black leading-none text-slate-900">{indicator.value}</p>
            {indicator.label === "Cumplimiento de meta" && (
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: `${Math.min(Math.max(goalCompletion, 0), 100)}%` }} />
              </div>
            )}
            <p className="text-[11px] text-slate-400">{indicator.helper}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
          <h2 className="font-bold text-slate-900">Resumen de órdenes</h2>
        </div>
        <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            ["Órdenes totales", seller.totalOrders],
            ["Completadas", seller.completedOrders],
            ["Canceladas", seller.canceledOrders],
          ].map(([label, value]) => (
            <div key={String(label)} className="px-4 py-3 text-center first:pl-0 last:pr-0">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <p className="mt-1 text-xl font-black text-slate-900">{formatInteger(Number(value))}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 flex items-center gap-2 font-bold text-slate-900">
            <Activity className="h-4 w-4 text-blue-600" /> Gestión de leads por estado
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {leadStatusLabels.map(({ status, label }) => (
              <div key={status} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                <p className="mt-1 text-xl font-black text-slate-800">{seller.leadStatusCounts[status]}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 flex items-center gap-2 font-bold text-slate-900">
            <Megaphone className="h-4 w-4 text-blue-600" /> Leads por origen
          </h2>
          <div className="space-y-2">
            {leadSourceLabels.map(({ source, label }) => (
              <div key={source} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5 text-sm">
                <span className="font-medium text-slate-600">{label}</span>
                <span className="font-black text-slate-900">{seller.leadSourceCounts[source]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 flex items-center gap-2 font-bold text-slate-900">
          <Megaphone className="h-4 w-4 text-blue-600" /> Campañas asignadas
        </h2>
        {isCampaignsLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando campañas...
          </div>
        ) : isCampaignsError ? (
          <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-6 text-center text-sm text-rose-600">
            No fue posible cargar las campañas asignadas. Puedes intentar actualizar la vista.
          </div>
        ) : seller.campaigns.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">El asesor no tiene campañas asignadas.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {seller.campaigns.map((campaign) => (
              <article key={campaign.id} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900">{campaign.name}</h3>
                    <p className="mt-1 text-xs font-medium text-slate-500">{campaign.platform}</p>
                  </div>
                  <Badge variant="outline" className={campaign.status === "ACTIVE"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"}
                  >
                    {campaign.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-500">
                  <div><span className="block text-[10px] font-bold uppercase text-slate-400">Presupuesto</span><strong className="text-slate-800">{formatMoney(campaign.initialBudget)}</strong></div>
                  <div><span className="block text-[10px] font-bold uppercase text-slate-400">Modalidad</span><strong className="text-slate-800">{campaign.isOrganic ? "Orgánica" : "Pagada"}</strong></div>
                  <div className="flex gap-2"><CalendarDays className="h-4 w-4 shrink-0" /><span>Inicio: {formatDate(campaign.startDate, "Sin fecha de inicio")}</span></div>
                  <div className="flex gap-2"><CalendarDays className="h-4 w-4 shrink-0" /><span>Fin: {formatDate(campaign.endDate, "Sin fecha de término")}</span></div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-xs">
                  <span className="font-medium text-slate-500">Leads asignados a esta campaña</span>
                  <strong className="text-base text-slate-900">{campaign.assignedLeads}</strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 flex items-center gap-2 font-bold text-slate-900">
          <BarChart3 className="h-4 w-4 text-blue-600" /> Eficiencia comercial
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[
            { label: "Respuesta promedio", value: formatDuration(seller.responseTimeAvgSeconds), icon: Clock3 },
            { label: "Tasa de devolución", value: formatPercentage(seller.returnRate), icon: XCircle },
            { label: "Cumplimiento", value: formatPercentage(goalCompletion), icon: Target },
            {
              label: "Campañas activas",
              value: isCampaignsLoading || isCampaignsError ? "—" : formatInteger(activeCampaigns),
              icon: Megaphone,
            },
            { label: "Leads asignados", value: formatInteger(seller.campaignMembers.length), icon: Users },
          ].map((metric) => (
            <div key={metric.label} className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
              <metric.icon className="mx-auto mb-2 h-5 w-5 text-blue-600" />
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{metric.label}</p>
              <p className="mt-1 text-lg font-black text-slate-900">{metric.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

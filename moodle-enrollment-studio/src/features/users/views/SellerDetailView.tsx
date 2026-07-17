import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSellerProfileById, getSellerCampaigns } from "../services/userService";
import { 
  ArrowLeft, RefreshCw, Shield, Mail, Target, Loader2,
  AlertTriangle, DollarSign, Briefcase, CheckCircle2, XCircle,
  Activity, Clock, TrendingUp, BarChart2
} from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";

// ─────────────────────────────────────────
// Tipos del raw data del backend
// ─────────────────────────────────────────
interface RawSeller {
  id: string;
  user_id: string;
  sales_target: number;
  total_sales: number;
  total_orders: number;
  completed_orders: number;
  canceled_orders: number;
  return_rate: string;
  response_time_avg: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    corporate_email: string;
    is_active: boolean;
  };
  orders?: any[];
  campaignMembers?: any[];
}

// ─────────────────────────────────────────
// Helpers de formato
// ─────────────────────────────────────────
const formatSoles = (value: number) =>
  `S/ ${value.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;

const parseReturnRate = (rate: string): number => parseFloat(rate) || 0;

// ─────────────────────────────────────────
// Componente Principal
// ─────────────────────────────────────────
export default function SellerDetailView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Query 1: Perfil del vendedor
  const sellerQuery = useQuery({
    queryKey: ["seller-detail", id],
    queryFn: () => getSellerProfileById(id!),
    enabled: !!id,
  });

  // Query 2: Campañas asignadas
  const campaignsQuery = useQuery({
    queryKey: ["seller-campaigns", id],
    queryFn: () => getSellerCampaigns(id!),
    enabled: !!id,
  });

  const isLoading = sellerQuery.isLoading;
  const isError = sellerQuery.isError || (!sellerQuery.isLoading && !sellerQuery.data?.data);

  // ── ESTADO DE CARGA ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <span className="text-sm font-medium text-slate-500">
            Cargando perfil del asesor comercial...
          </span>
        </div>
      </div>
    );
  }

  // ── ESTADO DE ERROR ──
  if (isError) {
    return (
      <div className="p-8 max-w-lg mx-auto mt-16 bg-white border border-rose-100 rounded-2xl shadow-sm text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7 text-rose-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">
          No se pudo cargar el perfil
        </h2>
        <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
          El identificador del asesor no fue encontrado en el sistema. Verifica
          que el enlace sea correcto e intenta de nuevo.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button onClick={() => navigate(-1)} variant="outline" size="sm">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Volver atrás
          </Button>
          <Button
            onClick={() => sellerQuery.refetch()}
            size="sm"
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const seller = sellerQuery.data!.data as unknown as RawSeller;
  const { user } = seller;
  const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Asesor";
  const numReturnRate = parseReturnRate(seller.return_rate);
  const isHighReturnRate = numReturnRate > 10;

  // Campañas del endpoint de campañas
  const rawCampaigns = (campaignsQuery.data as any)?.assignedCampaing || [];
  const campaigns = rawCampaigns.map((c: any) => ({
    id: c.campaign?.id || c.id || "",
    name: c.campaign?.campaing_name || c.campaign?.name || "Sin nombre",
    budget: Number(c.campaign?.initial_budget) || 0,
    status: c.campaign?.status || "INACTIVE",
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 fade-in">

      {/* ══════════════════════════════════════════════════
          A) CABECERA CON BOTÓN VOLVER
      ══════════════════════════════════════════════════ */}

      <div className="space-y-4">
        {/* Breadcrumb / Back link */}
        <Link
          to="/comercial/seguimiento-equipo"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Volver al Seguimiento de Equipo
        </Link>

        {/* Hero Card del perfil */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Avatar + Info */}
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-md shrink-0">
              {(user.first_name?.[0] || "V").toUpperCase()}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center flex-wrap gap-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {fullName}
                </h1>
                <Badge
                  className={`font-bold px-3 py-1 text-[11px] rounded-full uppercase border shadow-none flex items-center gap-1.5 ${
                    user.is_active
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  {user.is_active ? "Asesor Activo" : "Inactivo"}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {user.corporate_email || user.email}
                </span>
                <span className="hidden sm:inline text-slate-300">•</span>
                <span className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-slate-400" />
                  Meta Asignada:{" "}
                  <strong className="text-slate-800 ml-0.5">
                    {formatSoles(seller.sales_target)}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="flex items-center gap-3 self-end lg:self-center">
            <button
              onClick={() => {
                sellerQuery.refetch();
                campaignsQuery.refetch();
              }}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              title="Recargar datos"
            >
              <RefreshCw className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          B) FILA DE KPI CARDS REALES
      ══════════════════════════════════════════════════ */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1: Ventas Totales */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Ventas Totales
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 leading-none">
            {formatSoles(seller.total_sales)}
          </div>
          <p className="text-[11px] text-slate-400">Monto total acumulado</p>
        </div>

        {/* Card 2: Meta de Ventas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Meta de Ventas
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 leading-none">
            {formatSoles(seller.sales_target)}
          </div>
          {/* Barra de progreso */}
          <div className="space-y-1">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full"
                style={{
                  width: `${Math.min(
                    seller.sales_target > 0
                      ? (seller.total_sales / seller.sales_target) * 100
                      : 0,
                    100
                  )}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              {seller.sales_target > 0
                ? `${Math.round((seller.total_sales / seller.sales_target) * 100)}% completado`
                : "Sin meta asignada"}
            </p>
          </div>
        </div>

        {/* Card 3: Órdenes Completadas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Órdenes Completadas
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 leading-none">
            {seller.completed_orders}
          </div>
          <p className="text-[11px] text-slate-400">
            de {seller.total_orders} órdenes totales
          </p>
        </div>

        {/* Card 4: Órdenes Canceladas */}
        <div className={`p-5 rounded-xl border shadow-sm space-y-3 ${
          seller.canceled_orders > 0
            ? "bg-rose-50/20 border-rose-200/70"
            : "bg-white border-slate-200"
        }`}>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Órdenes Canceladas
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              seller.canceled_orders > 0 ? "bg-rose-50" : "bg-slate-50"
            }`}>
              <XCircle className={`w-4 h-4 ${
                seller.canceled_orders > 0 ? "text-rose-500" : "text-slate-400"
              }`} />
            </div>
          </div>
          <div className={`text-2xl font-black leading-none ${
            seller.canceled_orders > 0 ? "text-rose-600" : "text-slate-900"
          }`}>
            {seller.canceled_orders}
          </div>
          <p className="text-[11px] text-slate-400">
            {seller.canceled_orders === 0 ? "Sin cancelaciones registradas" : "Órdenes que no se concretaron"}
          </p>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════
          C) INFORMACIÓN Y DESEMPEÑO (DOS COLUMNAS)
      ══════════════════════════════════════════════════ */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Columna Izquierda: Campañas del Vendedor */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Campañas Asignadas al Asesor
          </h2>
          <hr className="border-slate-100" />

          {campaignsQuery.isLoading ? (
            <div className="flex items-center gap-2 text-slate-400 text-xs py-6 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Cargando campañas...</span>
            </div>
          ) : campaigns.length === 0 ? (
            <p className="text-sm text-slate-400 py-10 text-center">
              Sin campañas activas vinculadas actualmente.
            </p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {campaigns.map((c: any) => (
                <div
                  key={c.id}
                  className="p-4 bg-slate-50 hover:bg-slate-100/70 rounded-xl transition-colors border border-slate-200/60 flex justify-between items-center gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="font-bold text-sm text-slate-800 truncate">
                      {c.name}
                    </p>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Presupuesto: S/ {c.budget.toLocaleString("es-PE")}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-none border ${
                      c.status === "ACTIVE"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {c.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna Derecha: Eficiencia del Vendedor */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            Eficiencia Comercial
          </h2>
          <hr className="border-slate-100" />

          {/* Tiempo de Respuesta Promedio */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 rounded-xl p-5 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Tiempo Promedio de Respuesta
              </span>
              <div className="text-3xl font-black text-slate-800 mt-1 tracking-tight">
                {seller.response_time_avg || "N/A"}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Velocidad con la que el asesor atiende y tipifica un nuevo lead asignado.
            </p>
          </div>

          {/* Tasa de Devolución / Rebote */}
          <div
            className={`border rounded-xl p-4 space-y-2 ${
              isHighReturnRate
                ? "bg-rose-50/30 border-rose-200"
                : "bg-slate-50/50 border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                Tasa de Devolución / Rebote
              </span>
              {isHighReturnRate && (
                <Badge
                  variant="destructive"
                  className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow-none border-none"
                >
                  Alto
                </Badge>
              )}
            </div>
            <div
              className={`text-2xl font-black ${
                isHighReturnRate ? "text-rose-700" : "text-slate-800"
              }`}
            >
              {seller.return_rate}
            </div>
            <p className="text-[11px] text-slate-400">
              {isHighReturnRate
                ? "Supera el límite recomendado del 10%"
                : "Dentro del margen normal esperado"}
            </p>
          </div>

          {/* Indicador de Conversión rápida */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Resumen de Efectividad
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <TrendingUp className="w-4 h-4 text-sky-500 shrink-0" />
              <span className="font-medium">Órdenes Totales</span>
              <span className="font-black text-slate-900 ml-auto">
                {seller.total_orders}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-medium">Completadas</span>
              <span className="font-black text-emerald-700 ml-auto">
                {seller.completed_orders}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="font-medium">Canceladas</span>
              <span className="font-black text-rose-700 ml-auto">
                {seller.canceled_orders}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
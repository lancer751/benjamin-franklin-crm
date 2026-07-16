import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSellerDetail } from "../hooks/useSellerDetail";
import { 
  TrendingUp, DollarSign, Users, Briefcase, ArrowLeft, 
  Calendar, Mail, Shield, Activity, RefreshCw, Clock, Percent,
  Target, AlertTriangle, CheckCircle2, XCircle, Loader2
} from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent } from "@/core/components/ui/card";

export default function SellerDetailView() {
  const navigate = useNavigate();
  const { seller, isLoading, isError, refetch } = useSellerDetail();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50/50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <span className="text-sm font-medium text-slate-500">Cargando perfil de asesor comercial...</span>
        </div>
      </div>
    );
  }

  if (isError || !seller) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center space-y-4 py-20 bg-white border border-slate-150 rounded-xl shadow-sm mt-10">
        <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto text-rose-500">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Error al cargar perfil</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">No pudimos recuperar la información del asesor solicitado. Por favor verifica el ID o intenta de nuevo.</p>
        <div className="flex justify-center gap-3 pt-2">
          <Button onClick={() => navigate(-1)} variant="outline" className="text-xs">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Volver atrás
          </Button>
          <Button onClick={refetch} className="text-xs bg-blue-600 text-white hover:bg-blue-700">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // Parsear la tasa de retorno para determinar alertas
  const numReturnRate = parseFloat(seller.returnRate) || 0;
  const isHighReturnRate = numReturnRate > 10;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 fade-in">
      
      {/* A) CABECERA CON BOTÓN VOLVER */}
      <div className="space-y-4">
        <div>
          <Link 
            to="/comercial/seguimiento-equipo" 
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Volver al Seguimiento de Equipo
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {seller.fullName?.[0]?.toUpperCase() || "V"}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{seller.fullName}</h1>
                <Badge className={`font-bold px-3 py-1 text-xs rounded-full uppercase border shadow-none flex items-center gap-1.5 ${
                  seller.isActive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200/50"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}>
                  <Shield className="w-3.5 h-3.5" /> {seller.isActive ? "Asesor Activo" : "Inactivo"}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Correo: {seller.corporateEmail}
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-slate-400" /> Meta Asignada: S/ {seller.salesTarget.toLocaleString("es-PE")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-slate-650 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 shrink-0">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Miembro desde</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                {seller.joinedAt}
              </span>
            </div>
            <button 
              onClick={refetch}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors self-center"
              title="Recargar datos"
            >
              <RefreshCw className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* B) TARJETAS DE MÉTRICAS INDIVIDUALES (KPIs en Grid de 4 columnas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Ventas Acumuladas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-450">Total Ventas Acumuladas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <DollarSign className="w-4.5 h-4.5 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            S/ {seller.totalSales.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400">Monto total histórico acumulado</p>
        </div>

        {/* Card 2: Órdenes Totales */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-450">Órdenes Totales</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Briefcase className="w-4.5 h-4.5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {seller.metrics.totalOrders}
          </div>
          <p className="text-[11px] text-slate-400">Total de transacciones registradas</p>
        </div>

        {/* Card 3: Órdenes Completadas vs Canceladas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-450">Completadas vs Canceladas</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
              <CheckCircle2 className="w-4.5 h-4.5 text-sky-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 flex items-center gap-1.5">
            <span className="text-emerald-600">{seller.completedOrders}</span>
            <span className="text-slate-350 font-normal">/</span>
            <span className="text-rose-600">{seller.canceledOrders}</span>
          </div>
          <p className="text-[11px] text-slate-400">Estructura del embudo de cierre</p>
        </div>

        {/* Card 4: Tasa de Devolución / Rebote */}
        <div className={`p-5 rounded-xl border shadow-sm space-y-2 ${
          isHighReturnRate 
            ? "bg-rose-50/30 border-rose-200" 
            : "bg-white border-slate-200"
        }`}>
          <div className="flex justify-between items-center text-slate-450">
            <span className="text-xs font-bold uppercase tracking-wider">Tasa de Devolución / Rebote</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isHighReturnRate ? "bg-rose-50" : "bg-purple-50"
            }`}>
              <Percent className={`w-4.5 h-4.5 ${isHighReturnRate ? "text-rose-600" : "text-purple-650"}`} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span className={isHighReturnRate ? "text-rose-700" : ""}>{seller.returnRate}</span>
            {isHighReturnRate && (
              <Badge variant="destructive" className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow-none border-none">
                Alto
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            {isHighReturnRate 
              ? "Supera el límite recomendado de devolución" 
              : "Dentro del margen normal esperado"}
          </p>
        </div>

      </div>

      {/* C) SECCIÓN DE DESEMPEÑO Y CAMPAÑAS (Layout de dos columnas) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Campañas del Vendedor */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 lg:col-span-2">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Campañas Asignadas al Asesor
          </h2>
          <hr className="border-slate-100" />

          {seller.campaigns.length === 0 ? (
            <p className="text-sm text-slate-400 py-10 text-center">Sin campañas activas vinculadas actualmente.</p>
          ) : (
            <div className="space-y-3">
              {seller.campaigns.map((c) => (
                <div key={c.id} className="p-4 bg-slate-50 hover:bg-slate-100/70 rounded-xl transition-colors border border-slate-200/50 flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-slate-800">{c.name}</p>
                    <span className="text-[11px] text-slate-500 font-medium block">Presupuesto inicial: S/ {c.budget.toLocaleString("es-PE")}</span>
                  </div>
                  <Badge variant="outline" className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-none border ${
                    c.status === "ACTIVE" 
                      ? "bg-green-50 text-green-700 border-green-250/50" 
                      : "bg-amber-50 text-amber-700 border-amber-250/50"
                  }`}>
                    {c.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna Derecha: Eficiencia Comercial */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5 lg:col-span-1">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4.5 h-4.5 text-blue-600" />
            Eficiencia Comercial del Asesor
          </h2>
          <hr className="border-slate-100" />

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100/60 rounded-xl p-5 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto text-blue-600 shadow-sm">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tiempo Promedio de Respuesta</span>
              <div className="text-3xl font-black text-slate-800 tracking-tight">
                {seller.responseTimeAvg}
              </div>
            </div>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Mide la velocidad con la que el asesor responde y tipifica un nuevo prospecto asignado a su bandeja comercial.
            </p>
          </div>

          <div className="border border-slate-150 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2.5 text-xs text-slate-650">
              <Activity className="w-4 h-4 text-sky-600" />
              <span className="font-medium text-slate-700">Tasa de Conversión:</span>
              <span className="font-bold text-slate-900 ml-auto">{seller.metrics.conversionRate}%</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-650">
              <Users className="w-4 h-4 text-indigo-600" />
              <span className="font-medium text-slate-700">Leads Asignados:</span>
              <span className="font-bold text-slate-900 ml-auto">{seller.metrics.totalLeads}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Historial de Órdenes (Abajo, para mantener compatibilidad) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-blue-600" />
          Historial de Órdenes Cerradas
        </h2>
        <hr className="border-slate-100" />

        {seller.orders.length === 0 ? (
          <p className="text-sm text-slate-450 py-10 text-center">No se registran transacciones concretadas para este asesor.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-500">
              <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                <tr>
                  <th className="py-3 px-4 font-bold">ID de Orden</th>
                  <th className="py-3 px-4 font-bold">Fecha / Hora de Registro</th>
                  <th className="py-3 px-4 text-right font-bold">Monto Transacción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {seller.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-slate-650">
                      #{order.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {new Date(order.createdAt).toLocaleDateString("es-PE", {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      S/ {order.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
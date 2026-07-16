import React from "react";
import { Link } from "react-router-dom";
import { useSellerDetail } from "../hooks/useSellerDetail";
import { 
  TrendingUp, DollarSign, Users, Briefcase, ArrowLeft, 
  Calendar, Mail, Shield, Activity, RefreshCw 
} from "lucide-react";

export default function SellerDetailView() {
  const { seller, isLoading, isError, refetch } = useSellerDetail();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError || !seller) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <p className="text-red-500 font-medium">Error al cargar el perfil del vendedor.</p>
        <Link to="/users" className="mt-4 inline-flex items-center text-blue-600 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver a usuarios
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Cabecera superior */}
      <div className="flex items-center justify-between">
        <Link 
          to="/users" 
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Volver a la lista
        </Link>
        <div className="flex items-center gap-3">
          <button 
            onClick={refetch}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
            title="Recargar datos"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> Vendedor Activo
          </span>
        </div>
      </div>

      {/* Perfil del Vendedor */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {seller.fullName[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{seller.fullName}</h1>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <Mail className="w-3.5 h-3.5" /> {seller.email}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
          <div className="space-y-1">
            <span className="text-xs text-gray-400 block uppercase">Miembro desde</span>
            <span className="font-medium flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              {seller.joinedAt}
            </span>
          </div>
        </div>
      </div>

      {/* Cartas de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Volumen de Ventas */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-sm font-medium">Volumen de Ventas</span>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-2xl font-bold text-gray-900">
            S/ {seller.metrics.calculatedSalesVolume.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
          </span>
          <p className="text-xs text-gray-400">Monto total histórico acumulado</p>
        </div>

        {/* Órdenes */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-sm font-medium">Órdenes Cerradas</span>
            <Briefcase className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-2xl font-bold text-gray-900">{seller.metrics.totalOrders}</span>
          <p className="text-xs text-gray-400">Transacciones completadas</p>
        </div>

        {/* Leads */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-sm font-medium">Leads Asignados</span>
            <Users className="w-5 h-5 text-indigo-500" />
          </div>
          <span className="text-2xl font-bold text-gray-900">{seller.metrics.totalLeads}</span>
          <p className="text-xs text-gray-400">Leads en su embudo de ventas</p>
        </div>

        {/* Tasa de conversión */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-sm font-medium">Tasa de Conversión</span>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <span className="text-2xl font-bold text-gray-900">{seller.metrics.conversionRate}%</span>
          <p className="text-xs text-gray-400">Leads convertidos a clientes</p>
        </div>

      </div>

      {/* Detalle inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Campañas */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4 lg:col-span-1">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Campañas Asignadas
          </h2>
          <hr className="border-gray-100" />

          {seller.campaigns.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Sin campañas activas asignadas.</p>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {seller.campaigns.map((c) => (
                <div key={c.id} className="p-3 bg-gray-50 hover:bg-gray-100/70 rounded-lg transition border border-gray-100">
                  <p className="font-semibold text-sm text-gray-800 line-clamp-1">{c.name}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-400">Presupuesto: S/ {c.budget}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      c.status === "ACTIVE" 
                        ? "bg-green-50 text-green-700 border border-green-100" 
                        : "bg-amber-50 text-amber-700 border border-amber-100"
                    }`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Órdenes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4 lg:col-span-2">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            Órdenes Cerradas
          </h2>
          <hr className="border-gray-100" />

          {seller.metrics.totalOrders === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No se registran transacciones concretadas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="text-xs text-gray-400 uppercase bg-gray-50">
                  <tr>
                    <th className="py-3 px-4">ID de Orden</th>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {seller.orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-3 px-4 font-mono text-xs text-gray-600">
                        {order.id.substring(0, 8)}...
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">
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
    </div>
  );
}
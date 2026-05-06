import { BarChart3, Users, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const revenueData = [
  { month: "Ene", ingresos: 42000 },
  { month: "Feb", ingresos: 38000 },
  { month: "Mar", ingresos: 55000 },
  { month: "Abr", ingresos: 47000 },
  { month: "May", ingresos: 62000 },
  { month: "Jun", ingresos: 71000 },
];

const conversionData = [
  { month: "Ene", tasa: 18 },
  { month: "Feb", tasa: 20 },
  { month: "Mar", tasa: 19 },
  { month: "Abr", tasa: 22 },
  { month: "May", tasa: 21 },
  { month: "Jun", tasa: 24 },
];

const recentActivity = [
  { action: "Nuevo prospecto registrado", name: "Carlos Mendoza", time: "Hace 5 min" },
  { action: "Pago confirmado", name: "Ana García - S/ 1,200", time: "Hace 12 min" },
  { action: "Orden creada", name: "#ORD-3012 - Data Science", time: "Hace 25 min" },
  { action: "Lead convertido", name: "Roberto Díaz → Cliente", time: "Hace 1 hora" },
  { action: "Campaña activada", name: "Summer Enrollment 2024", time: "Hace 2 horas" },
];

const kpis = [
  { label: "Prospectos Totales", value: "1,284", icon: Users, change: "+8.2%", positive: true },
  { label: "Órdenes del Mes", value: "342", icon: BarChart3, change: "+12%", positive: true },
  { label: "Ingresos del Mes", value: "S/ 128,450", icon: CreditCard, change: "+15.3%", positive: true },
  { label: "Tasa de Conversión", value: "22.4%", icon: TrendingUp, change: "-1.2%", positive: false },
];

const DashboardView = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Administrativo</h1>
        <p className="text-sm text-muted-foreground mt-1">Resumen general del sistema de inscripciones.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((s, i) => (
          <div key={i} className="rounded-xl bg-card border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <s.icon size={18} className="text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className={`text-xs font-semibold mt-1 flex items-center gap-1 ${s.positive ? "text-emerald-500" : "text-destructive"}`}>
              {s.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {s.change} vs mes anterior
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-xl bg-card border border-border p-6">
          <h3 className="font-bold text-foreground mb-1">Ingresos Mensuales</h3>
          <p className="text-xs text-muted-foreground mb-4">Últimos 6 meses (S/)</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 13%, 91%)", borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="ingresos" fill="hsl(224, 76%, 48%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl bg-card border border-border p-6">
          <h3 className="font-bold text-foreground mb-1">Tasa de Conversión</h3>
          <p className="text-xs text-muted-foreground mb-4">Evolución mensual (%)</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 13%, 91%)", borderRadius: 8, fontSize: 12 }}
              />
              <Line type="monotone" dataKey="tasa" stroke="hsl(224, 76%, 48%)" strokeWidth={2} dot={{ r: 4, fill: "hsl(224, 76%, 48%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl bg-card border border-border p-6">
        <h3 className="font-bold text-foreground mb-4">Actividad Reciente</h3>
        <div className="space-y-3">
          {recentActivity.map((a, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{a.action}</p>
                <p className="text-xs text-muted-foreground">{a.name}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;

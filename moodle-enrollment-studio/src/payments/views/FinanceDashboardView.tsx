import { DollarSign, TrendingUp, AlertTriangle, CreditCard, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const monthlyRevenue = [
  { month: "Ene", cobrado: 45000, pendiente: 12000 },
  { month: "Feb", cobrado: 38000, pendiente: 15000 },
  { month: "Mar", cobrado: 52000, pendiente: 8000 },
  { month: "Abr", cobrado: 48000, pendiente: 11000 },
  { month: "May", cobrado: 61000, pendiente: 9000 },
  { month: "Jun", cobrado: 72000, pendiente: 7000 },
];

const paymentMethods = [
  { name: "Yape", value: 35, color: "hsl(270, 60%, 55%)" },
  { name: "Transferencia", value: 28, color: "hsl(224, 76%, 48%)" },
  { name: "Efectivo", value: 20, color: "hsl(142, 71%, 45%)" },
  { name: "POS", value: 12, color: "hsl(38, 92%, 50%)" },
  { name: "Otros", value: 5, color: "hsl(215, 16%, 47%)" },
];

const recentPayments = [
  { name: "Jorge Castillo", amount: "S/ 1,200", method: "Yape", status: "Confirmado", confirmed: true },
  { name: "Ana Mendoza", amount: "S/ 450", method: "Transferencia", status: "Pendiente", confirmed: false },
  { name: "Roberto Sánchez", amount: "S/ 2,100", method: "POS", status: "Confirmado", confirmed: true },
  { name: "Lucía Paredes", amount: "S/ 500", method: "Efectivo", status: "Confirmado", confirmed: true },
];

const FinanceDashboardView = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Financiero</h1>
        <p className="text-sm text-muted-foreground mt-1">Control integral de ingresos, cobros y deuda del sistema.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Ingresos del Mes", value: "S/ 72,000", icon: DollarSign, change: "+18%", positive: true },
          { label: "Cobros Pendientes", value: "S/ 7,000", icon: CreditCard, change: "-22%", positive: true },
          { label: "Deuda Morosa", value: "S/ 15,400", icon: AlertTriangle, change: "+5%", positive: false },
          { label: "Tasa de Cobro", value: "91.2%", icon: TrendingUp, change: "+3.1%", positive: true },
        ].map((k, i) => (
          <div key={i} className="rounded-xl bg-card border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{k.label}</p>
              <k.icon size={18} className="text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{k.value}</p>
            <p className={`text-xs font-semibold mt-1 flex items-center gap-1 ${k.positive ? "text-emerald-500" : "text-destructive"}`}>
              <ArrowUpRight size={14} /> {k.change}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 rounded-xl bg-card border border-border p-6">
          <h3 className="font-bold text-foreground mb-1">Cobrado vs Pendiente</h3>
          <p className="text-xs text-muted-foreground mb-4">Últimos 6 meses (S/)</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 13%, 91%)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="cobrado" fill="hsl(224, 76%, 48%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pendiente" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl bg-card border border-border p-6">
          <h3 className="font-bold text-foreground mb-1">Métodos de Pago</h3>
          <p className="text-xs text-muted-foreground mb-4">Distribución actual</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={paymentMethods} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                {paymentMethods.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 13%, 91%)", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {paymentMethods.map((m, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: m.color }} /> {m.name}</span>
                <span className="font-semibold text-foreground">{m.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent */}
      <div className="rounded-xl bg-card border border-border p-6">
        <h3 className="font-bold text-foreground mb-4">Últimos Pagos Registrados</h3>
        <div className="space-y-3">
          {recentPayments.map((p, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {p.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.method}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">{p.amount}</p>
                <p className={`text-xs font-semibold ${p.confirmed ? "text-emerald-500" : "text-yellow-500"}`}>{p.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboardView;

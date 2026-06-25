import { Megaphone, Users, TrendingUp, DollarSign, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const leadsByMonth = [
  { month: "Ene", leads: 120, converted: 22 },
  { month: "Feb", leads: 145, converted: 29 },
  { month: "Mar", leads: 180, converted: 34 },
  { month: "Abr", leads: 160, converted: 35 },
  { month: "May", leads: 210, converted: 42 },
  { month: "Jun", leads: 245, converted: 54 },
];

const cacTrend = [
  { month: "Ene", cac: 85 },
  { month: "Feb", cac: 78 },
  { month: "Mar", cac: 72 },
  { month: "Abr", cac: 68 },
  { month: "May", cac: 62 },
  { month: "Jun", cac: 55 },
];

const channelData = [
  { name: "Facebook", value: 35, color: "hsl(224, 76%, 48%)" },
  { name: "WhatsApp", value: 28, color: "hsl(142, 71%, 45%)" },
  { name: "Instagram", value: 20, color: "hsl(330, 65%, 55%)" },
  { name: "Web Orgánico", value: 12, color: "hsl(38, 92%, 50%)" },
  { name: "TikTok", value: 5, color: "hsl(270, 60%, 55%)" },
];

const topCampaigns = [
  { name: "Summer Enrollment 2024", leads: 89, conversions: 18, roi: "+240%" },
  { name: "Gen Z Skills Push", leads: 67, conversions: 14, roi: "+180%" },
  { name: "Remarketing Core", leads: 54, conversions: 12, roi: "+160%" },
];

const MarketingDashboardView = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard de Marketing</h1>
        <p className="text-sm text-muted-foreground mt-1">Análisis de campañas, canales y costo de adquisición.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Leads este Mes", value: "245", icon: Users, change: "+16.7%" },
          { label: "CAC Promedio", value: "S/ 55", icon: DollarSign, change: "-11.3%" },
          { label: "Conversión Mkt", value: "22.0%", icon: TrendingUp, change: "+4.8%" },
          { label: "Campañas Activas", value: "12", icon: Megaphone, change: "+3" },
        ].map((k, i) => (
          <div key={i} className="rounded-xl bg-card border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{k.label}</p>
              <k.icon size={18} className="text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{k.value}</p>
            <p className="text-xs font-semibold text-emerald-500 mt-1 flex items-center gap-1"><ArrowUpRight size={14} /> {k.change}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 rounded-xl bg-card border border-border p-6">
          <h3 className="font-bold text-foreground mb-1">Leads Generados vs Convertidos</h3>
          <p className="text-xs text-muted-foreground mb-4">Últimos 6 meses</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={leadsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 13%, 91%)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="leads" fill="hsl(224, 76%, 48%)" radius={[4, 4, 0, 0]} name="Leads" />
              <Bar dataKey="converted" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} name="Convertidos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl bg-card border border-border p-6">
          <h3 className="font-bold text-foreground mb-1">Canales de Origen</h3>
          <p className="text-xs text-muted-foreground mb-4">Distribución de leads</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={channelData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" stroke="none">
                {channelData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 13%, 91%)", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {channelData.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} /> {c.name}</span>
                <span className="font-semibold text-foreground">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CAC + Top Campaigns */}
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-xl bg-card border border-border p-6">
          <h3 className="font-bold text-foreground mb-1">Tendencia CAC</h3>
          <p className="text-xs text-muted-foreground mb-4">Costo de Adquisición por Cliente (S/)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={cacTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 13%, 91%)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="cac" stroke="hsl(0, 72%, 51%)" strokeWidth={2} dot={{ r: 4, fill: "hsl(0, 72%, 51%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl bg-card border border-border p-6">
          <h3 className="font-bold text-foreground mb-4">Top Campañas</h3>
          <div className="space-y-4">
            {topCampaigns.map((c, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-semibold text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.leads} leads • {c.conversions} conversiones</p>
                </div>
                <span className="text-sm font-bold text-emerald-500">{c.roi}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingDashboardView;

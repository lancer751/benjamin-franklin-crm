import { Target, TrendingUp, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const sources = [
  { name: "Facebook Ads", leads: 342, converted: 68, cac: 45, spend: 15390, color: "hsl(224, 76%, 48%)" },
  { name: "WhatsApp Referral", leads: 280, converted: 78, cac: 12, spend: 3360, color: "hsl(142, 71%, 45%)" },
  { name: "Instagram Ads", leads: 195, converted: 39, cac: 62, spend: 12090, color: "hsl(330, 65%, 55%)" },
  { name: "Google Orgánico", leads: 156, converted: 42, cac: 0, spend: 0, color: "hsl(38, 92%, 50%)" },
  { name: "TikTok Ads", leads: 120, converted: 30, cac: 38, spend: 4560, color: "hsl(270, 60%, 55%)" },
  { name: "Referidos", leads: 98, converted: 45, cac: 8, spend: 784, color: "hsl(200, 70%, 50%)" },
  { name: "Landing Pages", leads: 85, converted: 22, cac: 28, spend: 2380, color: "hsl(15, 80%, 55%)" },
];

const channelComparison = sources.map(s => ({
  name: s.name.split(" ")[0],
  leads: s.leads,
  conversiones: s.converted,
}));

const LeadSourcesView = () => {
  const totalLeads = sources.reduce((s, src) => s + src.leads, 0);
  const totalConverted = sources.reduce((s, src) => s + src.converted, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target size={24} className="text-primary" />
            Origen de Leads
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Análisis detallado de rendimiento por canal de adquisición.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl bg-card border border-border p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total Leads</p>
          <p className="text-2xl font-bold text-foreground mt-2">{totalLeads.toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Convertidos</p>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{totalConverted}</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tasa Global</p>
          <p className="text-2xl font-bold text-foreground mt-2">{((totalConverted / totalLeads) * 100).toFixed(1)}%</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Mejor Canal</p>
          <p className="text-2xl font-bold text-primary mt-2">WhatsApp</p>
          <p className="text-xs text-muted-foreground">27.9% conversión</p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl bg-card border border-border p-6">
        <h3 className="font-bold text-foreground mb-1">Comparativa por Canal</h3>
        <p className="text-xs text-muted-foreground mb-4">Leads generados vs conversiones</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={channelComparison}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} />
            <YAxis tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 13%, 91%)", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="leads" fill="hsl(224, 76%, 48%)" radius={[4, 4, 0, 0]} name="Leads" />
            <Bar dataKey="conversiones" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} name="Conversiones" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Source Table */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Canal</th>
              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Leads</th>
              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Convertidos</th>
              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tasa Conv.</th>
              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">CAC</th>
              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Inversión</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="flex items-center gap-2 font-semibold text-foreground">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </span>
                </td>
                <td className="px-6 py-4 text-foreground">{s.leads}</td>
                <td className="px-6 py-4 text-foreground">{s.converted}</td>
                <td className="px-6 py-4">
                  <span className="text-emerald-600 font-semibold">{((s.converted / s.leads) * 100).toFixed(1)}%</span>
                </td>
                <td className="px-6 py-4 text-foreground">{s.cac > 0 ? `S/ ${s.cac}` : "Orgánico"}</td>
                <td className="px-6 py-4 text-foreground">{s.spend > 0 ? `S/ ${s.spend.toLocaleString()}` : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadSourcesView;

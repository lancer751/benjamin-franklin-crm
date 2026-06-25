import { Calendar, MapPin, Monitor, Users, X, BarChart3 } from "lucide-react";
import ModalWrapper from "@/core/components/ModalWrapper";

interface Campaign {
  name: string;
  id: string;
  course: string;
  platform: string;
  platformColor: string;
  budget: string;
  spent: string;
  status: string;
}

interface CampaignDetailModalProps {
  open: boolean;
  onClose: () => void;
  campaign: Campaign | null;
}

const editionData: Record<string, { startDate: string; endDate: string; modality: string; schedule: string; maxStudents: number; enrolled: number }> = {
  "CAMP-9231": { startDate: "15 Jul 2024", endDate: "15 Oct 2024", modality: "Virtual en Vivo", schedule: "Lun/Mié/Vie 7pm-9pm", maxStudents: 40, enrolled: 28 },
  "CAMP-8842": { startDate: "01 Ago 2024", endDate: "30 Sep 2024", modality: "Presencial", schedule: "Sáb 9am-1pm", maxStudents: 25, enrolled: 25 },
  "CAMP-1042": { startDate: "20 Jul 2024", endDate: "20 Dic 2024", modality: "Virtual Asíncrono", schedule: "Autogestión", maxStudents: 100, enrolled: 42 },
  "CAMP-0955": { startDate: "01 Sep 2024", endDate: "01 Dic 2024", modality: "Híbrido", schedule: "Mar/Jue 6pm-9pm", maxStudents: 30, enrolled: 18 },
  "CAMP-7721": { startDate: "10 Ago 2024", endDate: "10 Nov 2024", modality: "Virtual en Vivo", schedule: "Lun/Mié 8pm-10pm", maxStudents: 50, enrolled: 35 },
};

const sellersData: Record<string, { name: string; role: string; leads: number; conversions: number }[]> = {
  "CAMP-9231": [
    { name: "Juan Pérez", role: "Senior Sales", leads: 45, conversions: 12 },
    { name: "María García", role: "Sales Executive", leads: 32, conversions: 8 },
    { name: "Carlos Ruiz", role: "Junior Sales", leads: 18, conversions: 4 },
  ],
  "CAMP-8842": [
    { name: "Ana Torres", role: "Account Manager", leads: 28, conversions: 10 },
    { name: "Juan Pérez", role: "Senior Sales", leads: 15, conversions: 6 },
  ],
  "CAMP-1042": [
    { name: "María García", role: "Sales Executive", leads: 52, conversions: 15 },
    { name: "Carlos Ruiz", role: "Junior Sales", leads: 30, conversions: 8 },
  ],
  "CAMP-0955": [
    { name: "Ana Torres", role: "Account Manager", leads: 40, conversions: 11 },
    { name: "Juan Pérez", role: "Senior Sales", leads: 22, conversions: 7 },
    { name: "María García", role: "Sales Executive", leads: 19, conversions: 5 },
  ],
  "CAMP-7721": [
    { name: "Carlos Ruiz", role: "Junior Sales", leads: 25, conversions: 6 },
  ],
};

const CampaignDetailModal = ({ open, onClose, campaign }: CampaignDetailModalProps) => {
  if (!campaign) return null;

  const edition = editionData[campaign.id] || editionData["CAMP-9231"];
  const sellers = sellersData[campaign.id] || sellersData["CAMP-9231"];

  const budgetNum = parseFloat(campaign.budget.replace(/[$,]/g, ""));
  const spentNum = parseFloat(campaign.spent.replace(/[$,]/g, ""));
  const spentPct = budgetNum > 0 ? Math.round((spentNum / budgetNum) * 100) : 0;

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={campaign.name}
      subtitle={`${campaign.id} • ${campaign.course}`}
      maxWidth="max-w-2xl"
      footer={<button className="btn-secondary" onClick={onClose}>Cerrar</button>}
    >
      {/* Status + Budget Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-lg bg-muted p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Estado</p>
          <span className={`inline-flex items-center mt-1 rounded-md px-2 py-0.5 text-xs font-bold border ${
            campaign.status === "ACTIVE" ? "border-emerald-500/30 text-emerald-500" : "border-border text-muted-foreground"
          }`}>{campaign.status}</span>
        </div>
        <div className="rounded-lg bg-muted p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Presupuesto</p>
          <p className="text-lg font-bold text-foreground mt-1">{campaign.budget}</p>
        </div>
        <div className="rounded-lg bg-muted p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Gastado</p>
          <p className="text-lg font-bold text-foreground mt-1">{campaign.spent}</p>
          <div className="h-1.5 rounded-full bg-background overflow-hidden mt-1">
            <div className="h-full rounded-full bg-primary" style={{ width: `${spentPct}%` }} />
          </div>
        </div>
      </div>

      {/* Edition Info */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <BarChart3 size={16} className="text-primary" /> Edición del Curso
        </h3>
        <div className="rounded-lg border border-border bg-card p-4 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-muted-foreground shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Fechas</p>
              <p className="text-sm text-foreground">{edition.startDate} — {edition.endDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Monitor size={16} className="text-muted-foreground shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Modalidad</p>
              <p className="text-sm text-foreground">{edition.modality}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-muted-foreground shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Horario</p>
              <p className="text-sm text-foreground">{edition.schedule}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Users size={16} className="text-muted-foreground shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Capacidad</p>
              <p className="text-sm text-foreground">{edition.enrolled} / {edition.maxStudents} inscritos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Sellers */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Users size={16} className="text-primary" /> Vendedores Asignados ({sellers.length})
        </h3>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Vendedor</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Rol</th>
                <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Leads</th>
                <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Conversiones</th>
                <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tasa</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((s, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {s.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="font-medium text-foreground">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.role}</td>
                  <td className="px-4 py-3 text-center font-semibold text-foreground">{s.leads}</td>
                  <td className="px-4 py-3 text-center font-semibold text-emerald-500">{s.conversions}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs font-bold text-primary">{s.leads > 0 ? Math.round((s.conversions / s.leads) * 100) : 0}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default CampaignDetailModal;

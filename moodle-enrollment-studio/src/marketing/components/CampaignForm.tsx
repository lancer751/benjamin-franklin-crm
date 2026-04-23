import { useState } from "react";
import { Megaphone, ChevronDown, DollarSign } from "lucide-react";
import ModalWrapper from "@/core/components/ModalWrapper";

interface CampaignData {
  nombre: string;
  presupuesto: string;
  plataforma: string;
  startDate: string;
  endDate: string;
  estado: string;
}

interface CampaignFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: CampaignData;
  onSubmit: (data: CampaignData) => void;
}

const emptyData: CampaignData = {
  nombre: "", presupuesto: "0.00", plataforma: "", startDate: "", endDate: "", estado: "borrador",
};

const estados = [
  { value: "borrador", label: "BORRADOR" },
  { value: "activa", label: "ACTIVA" },
  { value: "pausada", label: "PAUSADA" },
];

const CampaignForm = ({ open, onClose, initialData, onSubmit }: CampaignFormProps) => {
  const isEdit = !!initialData;
  const [form, setForm] = useState<CampaignData>(initialData || emptyData);

  const set = (key: keyof CampaignData, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    onSubmit(form);
    onClose();
    if (!isEdit) setForm(emptyData);
  };

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEdit ? "Editar Campaña" : "Nueva Campaña"}
      subtitle="CONFIGURACIÓN DE ENROLLMENT"
      icon={<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Megaphone size={18} className="text-primary" /></div>}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSubmit}>{isEdit ? "Actualizar" : "Crear Campaña"}</button>
        </>
      }
    >
      {/* Nombre */}
      <div className="mb-5">
        <label className="form-label">Nombre de Campaña</label>
        <input className="form-input" placeholder="Ej: Admisiones Verano 2024" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
      </div>

      {/* Presupuesto + Plataforma */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="form-label">Presupuesto Inicial</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm"><DollarSign size={14} /></span>
            <input className="form-input pl-8" placeholder="0.00" value={form.presupuesto} onChange={(e) => set("presupuesto", e.target.value)} />
          </div>
        </div>
        <div>
          <label className="form-label">Plataforma</label>
          <div className="relative">
            <select className="form-select pr-10" value={form.plataforma} onChange={(e) => set("plataforma", e.target.value)}>
              <option value="">Seleccionar...</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="google">Google Ads</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="form-label">Start Date</label>
          <input type="date" className="form-input" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
        </div>
        <div>
          <label className="form-label">End Date</label>
          <input type="date" className="form-input" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
        </div>
      </div>

      {/* Estado */}
      <div>
        <label className="form-label">Estado</label>
        <div className="grid grid-cols-3 gap-3 mt-1.5">
          {estados.map((e) => (
            <button
              key={e.value}
              onClick={() => set("estado", e.value)}
              className={`py-3 rounded-lg text-xs font-bold tracking-wider transition-all ${
                form.estado === e.value
                  ? "bg-primary/10 border-2 border-primary text-primary"
                  : "bg-muted border-2 border-transparent text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>
    </ModalWrapper>
  );
};

export default CampaignForm;

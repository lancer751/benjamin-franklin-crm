import { useState, useEffect } from "react";
import { Megaphone, ChevronDown, DollarSign, Loader2 } from "lucide-react";
import ModalWrapper from "@/core/components/ModalWrapper";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCourseEditions } from "@/features/academic/services/courseService";
import { createCampaign, updateCampaign } from "../services/campaignService";
import type { InferRequestType } from "hono/client";
import { api } from "@/core/lib/api";
import { toast } from "sonner";

type CreateCampaignDTO = InferRequestType<typeof api.campaings.$post>["json"];

interface CampaignFormState {
  campaing_name: string;
  initial_budget: string;
  platform: string;
  start_date: string;
  end_date: string;
  status: "ACTIVE" | "INACTIVE" | "PAUSED";
  edition_id: string;
  is_organic: boolean;
}

interface CampaignFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: any;
}

const emptyData: CampaignFormState = {
  campaing_name: "", 
  initial_budget: "0.00", 
  platform: "", 
  start_date: "", 
  end_date: "", 
  status: "ACTIVE",
  edition_id: "",
  is_organic: false
};

const estados = [
  { value: "ACTIVE", label: "ACTIVA" },
  { value: "PAUSED", label: "PAUSADA" },
  { value: "INACTIVE", label: "INACTIVA" },
];

const plataformas = [
  { value: "FACEBOOK", label: "Facebook" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "WEBSITE", label: "Website" },
];

const CampaignForm = ({ open, onClose, initialData }: CampaignFormProps) => {
  const isEdit = !!initialData;
  const [form, setForm] = useState<CampaignFormState>(emptyData);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialData && open) {
      setForm({
        campaing_name: initialData.campaing_name || "",
        initial_budget: initialData.initial_budget?.toString() || "0.00",
        platform: initialData.platform || "",
        start_date: initialData.start_date ? new Date(initialData.start_date).toISOString().split('T')[0] : "",
        end_date: initialData.end_date ? new Date(initialData.end_date).toISOString().split('T')[0] : "",
        status: initialData.status || "ACTIVE",
        edition_id: initialData.edition_id || "",
        is_organic: !!initialData.is_organic,
      });
    } else if (open) {
      setForm(emptyData);
    }
  }, [initialData, open]);

  const { data: editionsRes, isLoading: isLoadingEditions } = useQuery({
    queryKey: ["editions"],
    queryFn: getCourseEditions,
    enabled: open,
  });

  const editions = editionsRes?.success ? editionsRes.data : [];

  const mutation = useMutation({
    mutationFn: async (payload: CreateCampaignDTO) => {
      if (isEdit && initialData?.id) {
        return await updateCampaign(initialData.id, payload as any);
      } else {
        return await createCampaign(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success(isEdit ? "Campaña actualizada exitosamente" : "Campaña creada exitosamente");
      onClose();
      if (!isEdit) setForm(emptyData);
    },
    onError: (error) => {
      console.error(error);
      toast.error(isEdit ? "Error al actualizar la campaña" : "Error al crear la campaña");
    }
  });

  const set = (key: keyof CampaignFormState, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (!form.campaing_name || !form.platform || !form.start_date || !form.end_date || !form.edition_id) {
      toast.error("Por favor completa todos los campos requeridos.");
      return;
    }

    const payload: CreateCampaignDTO = {
      campaing_name: form.campaing_name,
      initial_budget: Number(form.initial_budget),
      platform: form.platform as any,
      start_date: new Date(form.start_date).toISOString(),
      end_date: new Date(form.end_date).toISOString(),
      status: form.status as any,
      edition_id: form.edition_id,
      is_organic: form.is_organic,
    };

    mutation.mutate(payload);
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
          <button className="btn-secondary" onClick={onClose} disabled={mutation.isPending}>Cancelar</button>
          <button className="btn-primary flex items-center gap-2" onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 size={16} className="animate-spin" />}
            {isEdit ? "Actualizar" : "Crear Campaña"}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
        {/* Nombre de Campaña */}
        <div className="col-span-full">
          <label className="form-label">Nombre de Campaña</label>
          <input className="form-input" placeholder="Ej: Admisiones Verano 2024" value={form.campaing_name} onChange={(e) => set("campaing_name", e.target.value)} />
        </div>

        {/* Edición (Nuevo) */}
        <div className="col-span-full">
          <label className="form-label">Edición Asociada</label>
          <div className="relative">
            <select 
              className="form-select pr-10" 
              value={form.edition_id} 
              onChange={(e) => set("edition_id", e.target.value)}
              disabled={isLoadingEditions || isEdit}
            >
              <option value="">{isLoadingEditions ? "Cargando ediciones..." : "Selecciona una edición..."}</option>
              {editions.map((ed: any) => (
                <option key={ed.id} value={ed.id}>
                  {ed.edition_code || "Sin código"} - {ed.course?.name || "Edición"}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Presupuesto */}
        <div>
          <label className="form-label">Presupuesto Inicial</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm"><DollarSign size={14} /></span>
            <input 
              type="text"
              pattern="^\d+(\.\d{1,2})?$"
              className="form-input pl-8" 
              placeholder="0.00" 
              value={form.initial_budget} 
              onChange={(e) => set("initial_budget", e.target.value.replace(/[^0-9.]/g, ''))} 
            />
          </div>
        </div>

        {/* Plataforma */}
        <div>
          <label className="form-label">Plataforma</label>
          <div className="relative">
            <select className="form-select pr-10" value={form.platform} onChange={(e) => set("platform", e.target.value)}>
              <option value="">Seleccionar...</option>
              {plataformas.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Is Organic (Nuevo) */}
        <div className="col-span-full flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30">
          <div>
            <p className="font-medium text-sm text-foreground">Tráfico Orgánico</p>
            <p className="text-xs text-muted-foreground">Marca esta opción si la campaña no tiene presupuesto de inversión en pauta.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={form.is_organic} onChange={(e) => set("is_organic", e.target.checked)} />
            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Dates */}
        <div>
          <label className="form-label">Start Date</label>
          <input type="date" className="form-input" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
        </div>
        <div>
          <label className="form-label">End Date</label>
          <input type="date" className="form-input" value={form.end_date} onChange={(e) => set("end_date", e.target.value)} />
        </div>

        {/* Estado */}
        <div className="col-span-full mt-2">
          <label className="form-label">Estado de Campaña</label>
          <div className="grid grid-cols-3 gap-3 mt-1.5">
            {estados.map((e) => (
              <button
                type="button"
                key={e.value}
                onClick={() => set("status", e.value)}
                className={`py-2.5 rounded-lg text-xs font-bold tracking-wider transition-all ${
                  form.status === e.value
                    ? "bg-primary/10 border-2 border-primary text-primary"
                    : "bg-muted border-2 border-transparent text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default CampaignForm;

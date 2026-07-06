import { useState, useEffect } from "react";
import { Megaphone, ChevronDown, DollarSign, Loader2 } from "lucide-react";
import ModalWrapper from "@/core/components/ModalWrapper";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createCampaign, updateCampaign } from "../services/campaignService";
import { getProducts } from "@/features/products/services/productService";
import { toast } from "sonner";

interface CampaignFormState {
  campaing_name: string;
  initial_budget: string;
  platform: string;
  start_date: string;
  end_date: string;
  status: "ACTIVE" | "INACTIVE" | "PAUSED";
  product_id: string;
  is_organic: boolean;
  supervisor_id: string;
  meta_form_id: string;
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
  product_id: "",
  is_organic: false,
  supervisor_id: "",
  meta_form_id: "",
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
        campaing_name: initialData.name || initialData.campaing_name || "",
        initial_budget: parseFloat(initialData.initial_budget || "0").toString(),
        platform: initialData.platform || "",
        start_date: initialData.start_date ? new Date(initialData.start_date).toISOString().split('T')[0] : "",
        end_date: initialData.end_date ? new Date(initialData.end_date).toISOString().split('T')[0] : "",
        status: initialData.status || "ACTIVE",
        product_id: initialData.product_id || initialData.product?.id || initialData.relatedProduct?.id || "",
        is_organic: !!initialData.is_organic,
        supervisor_id: initialData.supervisor_id || "",
        meta_form_id: initialData.meta_form_id || "",
      });
    } else if (open) {
      setForm(emptyData);
    }
  }, [initialData, open]);

  // Fetch products for dropdown selection
  const { data: productsRes, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    enabled: open,
  });

  const products = productsRes?.success ? productsRes.data : [];

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      if (isEdit && initialData?.id) {
        return await updateCampaign(initialData.id, payload);
      } else {
        return await createCampaign(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaña configurada exitosamente");
      onClose();
      if (!isEdit) setForm(emptyData);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error al configurar la campaña");
    }
  });

  const set = (key: keyof CampaignFormState, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (!form.product_id) {
      toast.error("Por favor selecciona un producto comercial.");
      return;
    }

    // Prepare payload for configuration save
    const payload: any = {
      campaing_name: form.campaing_name,
      initial_budget: Number(form.initial_budget),
      platform: form.platform as any,
      start_date: new Date(form.start_date).toISOString(),
      end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
      status: form.status as any,
      product_id: form.product_id,
      is_organic: form.is_organic,
      supervisor_id: form.supervisor_id,
      meta_form_id: form.meta_form_id || null,
    };

    mutation.mutate(payload);
  };

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Configurar Campaña de Captación"
      subtitle="ENRIQUECIMIENTO COMERCIAL Y ASIGNACIÓN (META ADS SYNCED)"
      icon={<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Megaphone size={18} className="text-primary" /></div>}
      footer={
        <>
          <button className="btn-secondary rounded-xl text-xs" onClick={onClose} disabled={mutation.isPending}>Cancelar</button>
          <button className="btn-primary rounded-xl text-xs flex items-center gap-2" onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 size={16} className="animate-spin" />}
            Guardar Configuración
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
        {/* Nombre de Campaña */}
        <div className="col-span-full">
          <label className="form-label text-xs font-semibold text-slate-700">Nombre de Campaña</label>
          <input 
            className="form-input border-slate-200" 
            placeholder="Nombre de Campaña" 
            value={form.campaing_name} 
            onChange={(e) => set("campaing_name", e.target.value)}
          />
        </div>

        {/* Producto (Vínculo Comercial) - Required */}
        <div className="col-span-full">
          <label className="form-label text-xs font-semibold text-slate-700">
            Producto del Catálogo <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <select 
              className="form-select pr-10 border-slate-200" 
              value={form.product_id} 
              onChange={(e) => set("product_id", e.target.value)}
              disabled={isLoadingProducts}
            >
              <option value="">{isLoadingProducts ? "Cargando productos..." : "Selecciona un producto..."}</option>
              {products.map((prod: any) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Presupuesto Inicial */}
        <div>
          <label className="form-label text-xs font-semibold text-slate-700">Presupuesto Inicial</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm"><DollarSign size={14} /></span>
            <input 
              type="text"
              className="form-input pl-8 border-slate-200" 
              placeholder="0.00" 
              value={form.initial_budget} 
              onChange={(e) => set("initial_budget", e.target.value)}
            />
          </div>
        </div>

        {/* Plataforma */}
        <div>
          <label className="form-label text-xs font-semibold text-slate-700">Plataforma Origen</label>
          <div className="relative">
            <select 
              className="form-select pr-10 border-slate-200" 
              value={form.platform} 
              onChange={(e) => set("platform", e.target.value)}
            >
              <option value="">Seleccionar...</option>
              {plataformas.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Tráfico Orgánico */}
        <div className="col-span-full flex items-center justify-between p-4 border border-slate-200/60 rounded-xl bg-white">
          <div>
            <p className="font-semibold text-xs text-slate-700">Tráfico Orgánico</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Definido por el tipo de captación de leads.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={form.is_organic} 
              onChange={(e) => set("is_organic", e.target.checked)} 
            />
            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Fechas */}
        <div>
          <label className="form-label text-xs font-semibold text-slate-700">Fecha de Inicio</label>
          <input 
            type="date" 
            className="form-input border-slate-200" 
            value={form.start_date} 
            onChange={(e) => set("start_date", e.target.value)}
          />
        </div>
        <div>
          <label className="form-label text-xs font-semibold text-slate-700">Fecha de Fin</label>
          <input 
            type="date" 
            className="form-input border-slate-200" 
            value={form.end_date} 
            onChange={(e) => set("end_date", e.target.value)}
          />
        </div>

        {/* Estado - Editable */}
        <div className="col-span-full mt-2">
          <label className="form-label text-xs font-semibold text-slate-700">Estado de Campaña</label>
          <div className="grid grid-cols-3 gap-3 mt-1.5">
            {estados.map((e) => (
              <button
                type="button"
                key={e.value}
                onClick={() => set("status", e.value)}
                className={`py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all border ${
                  form.status === e.value
                    ? "bg-primary/10 border-primary text-primary shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
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

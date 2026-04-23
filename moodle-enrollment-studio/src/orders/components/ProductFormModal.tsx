import { useState } from "react";
import { GraduationCap, ChevronDown, DollarSign, Info, Loader2 } from "lucide-react";
import ModalWrapper from "@/core/components/ModalWrapper";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCourseEditions, getModalities } from "@/academic/services/courseService";
// 🧠 Importamos los servicios del producto y notificaciones
import { createProduct, updateProduct } from "../services/productService";
import { toast } from "sonner";

export interface ProductFormData {
  edition_id: string;
  category: string;
  cash_price: number;
  installment_price: number;
  discount_price: number;
  sales_status: string;
}

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: ProductFormData & { id?: string }; // Añadimos ID opcional para cuando edites
}

const emptyData: ProductFormData = {
  edition_id: "",
  category: "",
  cash_price: 0,
  installment_price: 0,
  discount_price: 0,
  sales_status: "DRAFT",
};

const ProductFormModal = ({ open, onClose, initialData }: ProductFormModalProps) => {
  const isEdit = !!initialData;
  const [form, setForm] = useState<ProductFormData>(initialData || emptyData);
  const queryClient = useQueryClient(); // 🧠 Para refrescar la tabla al terminar

  const set = (key: keyof ProductFormData, value: any) => {
    if (["cash_price", "installment_price", "discount_price"].includes(key as string)) {
      setForm((prev) => ({ ...prev, [key]: Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  const { data: editionsRes, isLoading: isLoadingEditions } = useQuery({
    queryKey: ["editions"],
    queryFn: getCourseEditions,
    enabled: open
  });

  const { data: modalitiesRes } = useQuery({
    queryKey: ["modalities"],
    queryFn: getModalities,
    enabled: open
  });

  const editions = Array.isArray(editionsRes) ? editionsRes : (editionsRes?.data || []);
  const modalities = Array.isArray(modalitiesRes) ? modalitiesRes : (modalitiesRes?.data || []);

  const selectedEdition = editions.find((e: any) => e.id === form.edition_id);

  // MOTOR INTELIGENTE DE ENVÍO AL BACKEND
  const mutation = useMutation({
    mutationFn: async (payload: ProductFormData) => {
      if (isEdit && initialData?.id) {
        // 🟡 MODO EDICIÓN: Dispara un PUT usando el ID
        return await updateProduct(initialData.id, payload);
      } else {
        // 🟢 MODO CREACIÓN: Dispara un POST
        return await createProduct(payload);
      }
    },
    onSuccess: () => {
      // 1. Refrescamos la tabla general
      queryClient.invalidateQueries({ queryKey: ["products"] }); 
      
      // 2. Si estamos editando, también refrescamos la vista de detalle específica
      if (isEdit && initialData?.id) {
        queryClient.invalidateQueries({ queryKey: ["product", initialData.id] });
      }

      // 3. Mostramos el mensaje correcto
      toast.success(isEdit ? "Producto actualizado exitosamente" : "Producto creado exitosamente");
      
      onClose();
      if (!isEdit) setForm(emptyData); // Solo limpiamos si estábamos creando
    },
    onError: (error) => {
      console.error(error);
      toast.error(isEdit ? "Error al actualizar el producto." : "Error al crear el producto.");
    }
  });

  const handleSubmit = () => {
    // Validación rápida nivel experto
    if (!form.edition_id || !form.category) {
      toast.error("Por favor, selecciona una edición y una categoría.");
      return;
    }

    const payload: ProductFormData = {
      edition_id: form.edition_id.trim(),
      category: form.category.trim(),
      cash_price: Number(form.cash_price),
      installment_price: Number(form.installment_price),
      discount_price: Number(form.discount_price),
      sales_status: form.sales_status,
    };

    // Disparamos la mutación
    mutation.mutate(payload);
  };

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEdit ? "Editar Producto" : "Nuevo Producto"} // 👈 Corregido
      subtitle="Configura el precio y el estado de venta para una edición." // 👈 Corregido
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </button>
          <button className="btn-primary flex items-center gap-2" onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Guardando...
              </>
            ) : (
              isEdit ? "Actualizar Producto" : "Crear Producto" // 👈 Corregido
            )}
          </button>
        </>
      }
    >
      {/* ... (El resto del código JSX de Detalles Académicos y Precios se queda EXACTAMENTE igual) ... */}
      
      {/* Detalles Académicos */}
      <div className="mb-8">
        <div className="section-title mb-5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <GraduationCap size={16} className="text-primary" />
          </div>
          DETALLES ACADÉMICOS
        </div>

        <div className="mb-4">
          <label className="form-label">Edición / Cohorte</label>
          <div className="relative">
            <select className="form-select pr-10" value={form.edition_id} onChange={(e) => set("edition_id", e.target.value)} disabled={isLoadingEditions}>
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

        <div className="grid grid-cols-3 gap-4 mb-5">
          <div>
            <label className="form-label text-muted-foreground">Fecha de Inicio</label>
            <input type="text" className="form-input bg-muted text-muted-foreground cursor-not-allowed" value={selectedEdition?.start_date ? new Date(selectedEdition.start_date).toLocaleDateString() : ""} readOnly disabled placeholder="Automático" />
          </div>
          <div>
            <label className="form-label text-muted-foreground">Fecha de Fin</label>
            <input type="text" className="form-input bg-muted text-muted-foreground cursor-not-allowed" value={selectedEdition?.end_date ? new Date(selectedEdition.end_date).toLocaleDateString() : ""} readOnly disabled placeholder="Automático" />
          </div>
          <div>
            <label className="form-label text-muted-foreground">Modalidad</label>
            <input type="text" className="form-input bg-muted text-muted-foreground cursor-not-allowed" value={modalities.find((m: any) => m.id === selectedEdition?.modality_id)?.name || selectedEdition?.modality || ""} readOnly disabled placeholder="Automático" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="form-label">Categoría</label>
            <div className="relative">
              <select className="form-select pr-10" value={form.category} onChange={(e) => set("category", e.target.value)}>
                <option value="">Selecciona categoría...</option>
                <option value="CURSO">Curso</option>
                <option value="DIPLOMADO">Diplomado</option>
                <option value="TALLER">Taller</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="form-label">Estado de Venta</label>
            <div className="relative">
              <select className="form-select pr-10" value={form.sales_status} onChange={(e) => set("sales_status", e.target.value)}>
                <option value="DRAFT">Borrador (DRAFT)</option>
                <option value="PUBLISHED">Publicado (PUBLISHED)</option>
                <option value="ON_SALE">En Venta (ON_SALE)</option>
                <option value="COMPLETED">Completado (COMPLETED)</option>
                <option value="CANCELLED">Cancelado (CANCELLED)</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Precios */}
      <div>
        <div className="section-title mb-5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <DollarSign size={16} className="text-primary" />
          </div>
          CONFIGURACIÓN DE PRODUCTO (PRECIOS)
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { key: "cash_price" as const, label: "Precio al Contado" },
            { key: "installment_price" as const, label: "Precio en Cuotas" },
            { key: "discount_price" as const, label: "Precio con Descuento" },
          ].map((p) => (
            <div key={p.key}>
              <label className="form-label">{p.label}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">S/</span>
                <input type="number" min="0" step="0.01" className="form-input pl-8" placeholder="0.00" value={form[p.key as keyof ProductFormData]} onChange={(e) => set(p.key, e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2.5 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
          <Info size={16} className="text-primary mt-0.5 shrink-0" />
          <p>Los precios configurados aquí se aplicarán automáticamente a todos los formularios de inscripción y facturas generadas para esta edición.</p>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default ProductFormModal;
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProduct } from "../services/productService";
import { getCourseEditions } from "@/academic/services/courseService";
import ModalWrapper from "@/core/components/ModalWrapper";
import { toast } from "sonner";
import { Loader2, ChevronDown } from "lucide-react";

interface DynamicProductModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'MARKETING' | 'PRICING' | 'LINK' | null;
  product: any;
}

export default function DynamicProductModal({ open, onClose, mode, product }: DynamicProductModalProps) {
  const queryClient = useQueryClient();
  
  const [form, setForm] = useState({
    category: "",
    slug: "",
    short_description: "",
    description: "",
    cash_price: 0,
    installment_price: 0,
    discount_price: 0,
    discount_expires_at: "",
    sales_status: "DRAFT",
    edition_id: "",
  });

  useEffect(() => {
    if (open && product) {
      setForm({
        category: product.category || "",
        slug: product.slug || "",
        short_description: product.short_description || "",
        description: product.description || "",
        cash_price: Number(product.cash_price || 0),
        installment_price: Number(product.installment_price || 0),
        discount_price: Number(product.discount_price || 0),
        // Cortamos la fecha ISO para que el input type="date" la pueda leer (YYYY-MM-DD)
        discount_expires_at: product.discount_expires_at ? new Date(product.discount_expires_at).toISOString().split('T')[0] : "",
        sales_status: product.sales_status || "DRAFT",
        edition_id: product.edition_id || "",
      });
    }
  }, [product, open, mode]);

  const { data: editionsRes, isLoading: isLoadingEditions } = useQuery({
    queryKey: ["editions"],
    queryFn: getCourseEditions,
    enabled: mode === 'LINK' && open, // 🧠 Optimización: Solo consulta si abrimos el modal de Vínculo
  });

  const editions = Array.isArray(editionsRes) ? editionsRes : (editionsRes as any)?.data || [];

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await updateProduct(product.id, payload);
    },
    onSuccess: () => {
      // 🧠 Invalidamos ambas consultas para que la tabla y el detalle se actualicen solos
      queryClient.invalidateQueries({ queryKey: ["product", product.id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Producto actualizado correctamente");
      onClose();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error al actualizar el producto");
    }
  });

  const handleSubmit = () => {
    let payload = {};

    // 🧠 Construimos el paquete de datos dependiendo de qué pestaña estamos editando
    switch (mode) {
      case 'MARKETING':
        payload = {
          category: form.category,
          slug: form.slug,
          short_description: form.short_description,
          description: form.description,
        };
        break;
      case 'PRICING':
        payload = {
          cash_price: Number(form.cash_price),
          installment_price: Number(form.installment_price),
          discount_price: Number(form.discount_price),
          sales_status: form.sales_status,
          // 🚀 LA CORRECCIÓN EXPERTA: Usamos undefined en lugar de null para evitar el ZodError
          discount_expires_at: form.discount_expires_at 
            ? new Date(form.discount_expires_at).toISOString() 
            : undefined, 
        };
        break;
      case 'LINK':
        payload = {
          edition_id: form.edition_id,
        };
        break;
    }

    updateMutation.mutate(payload);
  };

  const getTitle = () => {
    switch (mode) {
      case 'MARKETING': return "Editar Contenido de Marketing";
      case 'PRICING': return "Editar Precios y Ofertas";
      case 'LINK': return "Cambiar Vínculo Académico";
      default: return "";
    }
  };

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const renderContent = () => {
    switch (mode) {
      case 'MARKETING':
        return (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label text-sm font-semibold">Categoría</label>
                <div className="relative">
                  <select className="form-select pr-10" value={form.category} onChange={(e) => handleChange("category", e.target.value)}>
                    <option value="">Selecciona categoría...</option>
                    <option value="CURSO">Curso</option>
                    <option value="DIPLOMADO">Diplomado</option>
                    <option value="TALLER">Taller</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="form-label text-sm font-semibold">Slug (URL amigable)</label>
                <input className="form-input" type="text" placeholder="ejemplo-curso" value={form.slug} onChange={(e) => handleChange("slug", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="form-label text-sm font-semibold">Descripción Corta</label>
              <textarea className="form-input min-h-[80px]" placeholder="Breve resumen del producto" value={form.short_description} onChange={(e) => handleChange("short_description", e.target.value)} />
            </div>
            <div>
              <label className="form-label text-sm font-semibold">Descripción Detallada</label>
              <textarea className="form-input min-h-[160px]" placeholder="Todos los detalles..." value={form.description} onChange={(e) => handleChange("description", e.target.value)} />
            </div>
          </div>
        );
      
      case 'PRICING':
        return (
          <div className="grid gap-5 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="form-label text-sm font-semibold">Precio Contado</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">S/</span>
                  <input type="number" step="0.01" className="form-input pl-8" value={form.cash_price} onChange={(e) => handleChange("cash_price", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="form-label text-sm font-semibold">Precio Cuotas</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">S/</span>
                  <input type="number" step="0.01" className="form-input pl-8" value={form.installment_price} onChange={(e) => handleChange("installment_price", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="form-label text-sm font-semibold">Descuento</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">S/</span>
                  <input type="number" step="0.01" className="form-input pl-8" value={form.discount_price} onChange={(e) => handleChange("discount_price", e.target.value)} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label text-sm font-semibold">Expiración del Descuento</label>
                <input type="date" className="form-input" value={form.discount_expires_at} onChange={(e) => handleChange("discount_expires_at", e.target.value)} />
              </div>
              <div>
                <label className="form-label text-sm font-semibold">Estado de Venta</label>
                <div className="relative">
                  <select className="form-select pr-10" value={form.sales_status} onChange={(e) => handleChange("sales_status", e.target.value)}>
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
        );

      case 'LINK':
        return (
          <div className="py-4">
            <label className="form-label text-sm font-semibold">Edición Vinculada</label>
            {isLoadingEditions ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <Loader2 className="animate-spin h-4 w-4"/> Cargando ediciones...
              </div>
            ) : (
              <div className="relative mt-2">
                <select className="form-select pr-10" value={form.edition_id} onChange={(e) => handleChange("edition_id", e.target.value)}>
                  <option value="">Selecciona una edición...</option>
                  {editions.map((ed: any) => (
                    <option key={ed.id} value={ed.id}>
                      {ed.edition_code || "Sin código"} - {ed.course?.name || "Edición Desconocida"}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <ModalWrapper
      open={open && mode !== null}
      onClose={onClose}
      title={getTitle()}
      subtitle="Actualiza esta sección de forma independiente."
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={updateMutation.isPending}>
            Cancelar
          </button>
          <button className="btn-primary flex items-center gap-2" onClick={handleSubmit} disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 size={16} className="animate-spin" />}
            Guardar Cambios
          </button>
        </>
      }
    >
      {renderContent()}
    </ModalWrapper>
  );
}
import { useState, useEffect } from "react";
import { GraduationCap, ChevronDown, DollarSign, Loader2, Settings, Info, Link as LinkIcon } from "lucide-react";
import ModalWrapper from "@/core/components/ModalWrapper";
import { useProductFormModal } from "../hooks/useProductFormModal";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/core/components/ui/accordion";

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: any;
}

const ProductFormModal = ({ open, onClose, initialData }: ProductFormModalProps) => {
  const {
    form,
    errors,
    setFieldValue,
    setPriceValue,
    onSubmit,
    isLoadingEditions,
    editions,
    categories,
    isLoadingCategories,
    selectedEdition,
    isPending,
    isEdit
  } = useProductFormModal(open, onClose, initialData);

  const [activePriceTab, setActivePriceTab] = useState(0);

  useEffect(() => {
    if (activePriceTab >= form.prices.length) {
      setActivePriceTab(0);
    }
  }, [form.prices.length, activePriceTab]);

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEdit ? "Editar Producto" : "Nuevo Producto"}
      subtitle="Configura el precio, modalidades y el estado de venta del producto."
    >
      <div className="flex flex-col h-[85vh]">
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-4">
          <Accordion type="single" collapsible defaultValue="academic">
            
            {/* Sección 1: Detalles Académicos y Venta */}
            <AccordionItem value="academic" className="mb-6 border border-border rounded-lg overflow-hidden">
              <AccordionTrigger className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-100/50 hover:no-underline transition-colors [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center gap-3 font-medium">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <GraduationCap size={16} className="text-primary" />
                  </div>
                  Detalles Académicos y Venta
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 bg-white border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                  <div>
                    <label className="form-label">Edición / Cohorte</label>
                    <div className="relative">
                      <select 
                        className={`form-select pr-10 ${errors.edition_id ? 'border-destructive' : ''}`} 
                        value={form.edition_id} 
                        onChange={(e) => setFieldValue("edition_id", e.target.value)} 
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
                    {errors.edition_id && <p className="text-destructive text-xs mt-1">{errors.edition_id}</p>}
                  </div>

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
                    <input type="text" className="form-input bg-muted text-muted-foreground cursor-not-allowed" value={selectedEdition?.modality?.name || selectedEdition?.modality || "Seleccione una edición"} readOnly disabled placeholder="Automático" />
                  </div>

                  <div>
                    <label className="form-label flex items-center gap-2">
                      Categoría
                      {isLoadingCategories && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                    </label>
                    <div className="relative">
                      <select 
                        className={`form-select pr-10 ${errors.category_id ? 'border-destructive' : ''}`} 
                        value={form.category_id} 
                        onChange={(e) => setFieldValue("category_id", e.target.value)}
                        disabled={isLoadingCategories}
                      >
                        <option value="">{isLoadingCategories ? "Cargando categorías..." : "Selecciona categoría..."}</option>
                        {categories.map((cat: any) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                    {errors.category_id && <p className="text-destructive text-xs mt-1">{errors.category_id}</p>}
                  </div>

                  <div>
                    <label className="form-label">Estado de Venta</label>
                    <div className="relative">
                      <select 
                        className={`form-select pr-10 ${errors.sales_status ? 'border-destructive' : ''}`} 
                        value={form.sales_status} 
                        onChange={(e) => setFieldValue("sales_status", e.target.value as any)}
                      >
                        <option value="DRAFT">Borrador (DRAFT)</option>
                        <option value="PUBLISHED">Publicado (PUBLISHED)</option>
                        <option value="ON_SALE">En Venta (ON_SALE)</option>
                        <option value="COMPLETED">Completado (COMPLETED)</option>
                        <option value="CANCELLED">Cancelado (CANCELLED)</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                    {errors.sales_status && <p className="text-destructive text-xs mt-1">{errors.sales_status}</p>}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Sección 2: Configuración Comercial */}
            <AccordionItem value="commercial" className="mb-6 border border-border rounded-lg overflow-hidden">
              <AccordionTrigger className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-100/50 hover:no-underline transition-colors [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center gap-3 font-medium">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Settings size={16} className="text-primary" />
                  </div>
                  Configuración Comercial
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 bg-white border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                  <div className="col-span-full">
                    <label className="form-label">Nombre Comercial del Producto</label>
                    <input 
                      type="text" 
                      className={`form-input ${errors.name ? 'border-destructive' : ''}`} 
                      placeholder="Ej. Curso de React - Cohorte 1" 
                      value={form.name} 
                      onChange={(e) => setFieldValue("name", e.target.value)} 
                    />
                    {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div className="col-span-full">
                    <label className="form-label">Slug (Identificador URL)</label>
                    <div className="relative">
                      <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input 
                        type="text" 
                        className={`form-input pl-9 font-mono text-sm ${errors.slug ? 'border-destructive' : ''}`} 
                        placeholder="curso-react-cohorte-1" 
                        value={form.slug} 
                        onChange={(e) => setFieldValue("slug", e.target.value)} 
                      />
                    </div>
                    {errors.slug && <p className="text-destructive text-xs mt-1">{errors.slug}</p>}
                    <p className="text-xs text-muted-foreground mt-1">Se genera automáticamente pero puedes editarlo manualmente.</p>
                  </div>

                  <div className="col-span-full">
                    <label className="form-label">Descripción Corta</label>
                    <input 
                      type="text" 
                      className={`form-input ${errors.short_description ? 'border-destructive' : ''}`} 
                      placeholder="Breve descripción del producto" 
                      value={form.short_description || ""} 
                      onChange={(e) => setFieldValue("short_description", e.target.value)} 
                    />
                    {errors.short_description && <p className="text-destructive text-xs mt-1">{errors.short_description}</p>}
                  </div>

                  <div className="col-span-full">
                    <label className="form-label">Descripción Detallada</label>
                    <textarea 
                      className={`form-input min-h-[100px] ${errors.description ? 'border-destructive' : ''}`} 
                      placeholder="Detalles completos..." 
                      value={form.description || ""} 
                      onChange={(e) => setFieldValue("description", e.target.value)} 
                    />
                    {errors.description && <p className="text-destructive text-xs mt-1">{errors.description}</p>}
                  </div>

                  <div className="col-span-full bg-slate-50/50 p-4 rounded-lg border border-border">
                    <h5 className="font-medium text-sm text-foreground mb-3 flex items-center gap-2">Control de Cuotas</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label text-xs">Mínimo de Cuotas</label>
                        <input 
                          type="number" 
                          min="1" 
                          className={`form-input ${errors.installments_min_number ? 'border-destructive' : ''}`} 
                          value={form.installments_min_number} 
                          onChange={(e) => setFieldValue("installments_min_number", Number(e.target.value))} 
                        />
                        {errors.installments_min_number && <p className="text-destructive text-xs mt-1">{errors.installments_min_number}</p>}
                      </div>
                      <div>
                        <label className="form-label text-xs">Máximo de Cuotas</label>
                        <input 
                          type="number" 
                          min="1" 
                          className={`form-input ${errors.installments_max_number ? 'border-destructive' : ''}`} 
                          value={form.installments_max_number} 
                          onChange={(e) => setFieldValue("installments_max_number", Number(e.target.value))} 
                        />
                        {errors.installments_max_number && <p className="text-destructive text-xs mt-1">{errors.installments_max_number}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-full bg-primary/5 p-4 rounded-lg border border-primary/20">
                    <h5 className="font-medium text-sm text-primary mb-3 flex items-center gap-2">Sección de Ofertas Temporales</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label text-xs">Precio con Descuento (S/)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">S/</span>
                          <input 
                            type="text" 
                            pattern="^\d+(\.\d{1,2})?$"
                            className={`form-input pl-8 ${errors.discount_price ? 'border-destructive' : ''}`} 
                            placeholder="0.00" 
                            value={form.discount_price || ""} 
                            onChange={(e) => setFieldValue("discount_price", e.target.value.replace(/[^0-9.]/g, ''))} 
                          />
                        </div>
                        {errors.discount_price && <p className="text-destructive text-xs mt-1">{errors.discount_price}</p>}
                      </div>
                      <div>
                        <label className="form-label text-xs">Expira Descuento el</label>
                        <input 
                          type="date" 
                          className={`form-input ${errors.discount_expires_at ? 'border-destructive' : ''}`} 
                          value={form.discount_expires_at || ""} 
                          onChange={(e) => setFieldValue("discount_expires_at", e.target.value)} 
                        />
                        {errors.discount_expires_at && <p className="text-destructive text-xs mt-1">{errors.discount_expires_at}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Sección 3: Gestión de Precios */}
            <AccordionItem value="pricing" className="mb-6 border border-border rounded-lg overflow-hidden">
              <AccordionTrigger className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-100/50 hover:no-underline transition-colors [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center gap-3 font-medium">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <DollarSign size={16} className="text-primary" />
                  </div>
                  Gestión de Precios
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 bg-white border-t border-border">
                {!selectedEdition && !isEdit ? (
                  <div className="text-center p-8 border-2 border-dashed border-border rounded-lg text-muted-foreground">
                    Selecciona una Edición para cargar las modalidades de precio correspondientes.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {form.prices.map((priceObj, index) => (
                      <div key={index} className="p-5 border border-border rounded-lg bg-white shadow-sm">
                        <h4 className="font-semibold text-foreground mb-4 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]"></span>
                            Modalidad de Precio
                          </div>
                          <div className="relative w-48">
                            <select 
                              className={`form-select ${errors[`prices.${index}.attendance_mode`] ? 'border-destructive' : ''}`}
                              value={priceObj.attendance_mode}
                              onChange={(e) => {
                                const newPrices = [...form.prices];
                                newPrices[index] = { ...newPrices[index], attendance_mode: e.target.value as any };
                                setFieldValue("prices", newPrices);
                              }}
                            >
                              <option value="HEREDADO">Heredado</option>
                              <option value="PRESENCIAL">Presencial</option>
                              <option value="VIRTUAL">Virtual</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                          </div>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div>
                            <label className="form-label">Matrícula</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">S/</span>
                              <input 
                                type="text" 
                                pattern="^\d+(\.\d{1,2})?$"
                                className={`form-input pl-8 ${errors[`prices.${index}.enrollment_fee`] ? 'border-destructive' : ''}`} 
                                placeholder="0.00" 
                                value={priceObj.enrollment_fee} 
                                onChange={(e) => setPriceValue(index, "enrollment_fee", e.target.value)} 
                              />
                            </div>
                            {errors[`prices.${index}.enrollment_fee`] && <p className="text-destructive text-xs mt-1.5">{errors[`prices.${index}.enrollment_fee`]}</p>}
                          </div>

                          <div>
                            <label className="form-label">Precio Contado</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">S/</span>
                              <input 
                                type="text" 
                                pattern="^\d+(\.\d{1,2})?$"
                                className={`form-input pl-8 ${errors[`prices.${index}.cash_price`] ? 'border-destructive' : ''}`} 
                                placeholder="0.00" 
                                value={priceObj.cash_price} 
                                onChange={(e) => setPriceValue(index, "cash_price", e.target.value)} 
                              />
                            </div>
                            {errors[`prices.${index}.cash_price`] && <p className="text-destructive text-xs mt-1.5">{errors[`prices.${index}.cash_price`]}</p>}
                          </div>

                          <div>
                            <label className="form-label">Precio en Cuotas</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">S/</span>
                              <input 
                                type="text" 
                                pattern="^\d+(\.\d{1,2})?$"
                                className={`form-input pl-8 ${errors[`prices.${index}.installment_price`] ? 'border-destructive' : ''}`} 
                                placeholder="0.00" 
                                value={priceObj.installment_price} 
                                onChange={(e) => setPriceValue(index, "installment_price", e.target.value)} 
                              />
                            </div>
                            {errors[`prices.${index}.installment_price`] && <p className="text-destructive text-xs mt-1.5">{errors[`prices.${index}.installment_price`]}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        {/* Footer Sticky */}
        <div className="shrink-0 bg-white pt-4 pb-2 border-t mt-auto flex justify-end gap-3 z-10">
          <button className="btn-secondary" onClick={onClose} disabled={isPending}>
            Cancelar
          </button>
          <button className="btn-primary flex items-center gap-2" onClick={onSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Guardando...
              </>
            ) : (
              isEdit ? "Actualizar Producto" : "Crear Producto"
            )}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default ProductFormModal;
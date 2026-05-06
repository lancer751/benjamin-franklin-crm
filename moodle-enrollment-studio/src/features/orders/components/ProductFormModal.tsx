import { useState, useEffect } from "react";
import { GraduationCap, ChevronDown, DollarSign, Loader2, Settings, Info, Link as LinkIcon, Image as ImageIcon, Search, Check, Upload } from "lucide-react";
import ModalWrapper from "@/core/components/ModalWrapper";
import { useProductFormModal } from "../hooks/useProductFormModal";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/core/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/core/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/core/components/ui/popover";
import { Button } from "@/core/components/ui/button";
import { cn } from "@/core/lib/utils";
import ProductStatusBadge, { STATUS_LABELS } from "@/features/orders/components/ProductStatusBadge";

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
    isUploading,
    handleImageUpload,
    isPending,
    isEdit
  } = useProductFormModal(open, onClose, initialData);

  const [openCombobox, setOpenCombobox] = useState(false);
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
      maxWidth="max-w-4xl"
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Columna Izquierda: Selectores */}
                  <div className="space-y-6">
                    <div>
                      <label className="form-label font-bold text-slate-700">Edición / Cohorte (Buscador)</label>
                      <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCombobox}
                            className={cn(
                              "w-full justify-between h-11 text-left font-normal border-slate-200 hover:bg-slate-50 transition-all shadow-sm",
                              !form.edition_id && "text-muted-foreground",
                              errors.edition_id && "border-destructive ring-1 ring-destructive"
                            )}
                            disabled={isLoadingEditions || isEdit}
                          >
                            <span className="truncate">
                              {form.edition_id
                                ? editions.find((ed: any) => ed.id === form.edition_id)?.edition_code + " - " + editions.find((ed: any) => ed.id === form.edition_id)?.course?.name
                                : isLoadingEditions ? "Cargando..." : "Buscar edición por código o curso..."}
                            </span>
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                          <Command className="w-full">
                            <CommandInput placeholder="Escribe el código o nombre del curso..." className="h-11" />
                            <CommandList className="max-h-[300px]">
                              <CommandEmpty>No se encontraron ediciones.</CommandEmpty>
                              <CommandGroup>
                                {editions.map((ed: any) => (
                                  <CommandItem
                                    key={ed.id}
                                    value={`${ed.edition_code} ${ed.course?.name}`}
                                    onSelect={() => {
                                      setFieldValue("edition_id", ed.id);
                                      setOpenCombobox(false);
                                    }}
                                    className="flex items-center gap-2 py-3 cursor-pointer"
                                  >
                                    <Check
                                      className={cn(
                                        "h-4 w-4 text-primary",
                                        form.edition_id === ed.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-bold text-slate-900">{ed.edition_code}</span>
                                      <span className="text-xs text-slate-500">{ed.course?.name}</span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {errors.edition_id && <p className="text-destructive text-[11px] font-medium mt-1 ml-1">{errors.edition_id}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="form-label font-semibold text-slate-600 flex items-center gap-2">
                          Categoría
                          {isLoadingCategories && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                        </label>
                        <Select 
                          value={form.category_id} 
                          onValueChange={(value) => setFieldValue("category_id", value)}
                          disabled={isLoadingCategories}
                        >
                          <SelectTrigger className={cn("h-11 shadow-sm", errors.category_id ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200')}>
                            <SelectValue placeholder={isLoadingCategories ? "..." : "Seleccionar categoría"} />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat: any) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.category_id && <p className="text-destructive text-[11px] font-medium mt-1 ml-1">{errors.category_id}</p>}
                      </div>

                      <div>
                        <label className="form-label font-semibold text-slate-600">Estado de Venta</label>
                        <Select 
                          value={form.sales_status} 
                          onValueChange={(value) => setFieldValue("sales_status", value as any)}
                        >
                          <SelectTrigger className="h-11 border-slate-200 shadow-sm">
                            <SelectValue placeholder="Estado" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Fecha Inicio</label>
                        <div className="text-sm font-semibold text-slate-700">
                          {selectedEdition?.start_date ? new Date(selectedEdition.start_date).toLocaleDateString() : "No definida"}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Modalidad Base</label>
                        <div className="text-sm font-semibold text-slate-700 truncate">
                          {selectedEdition?.modality?.name || selectedEdition?.modality || "No definida"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Columna Derecha: Vista Previa Imagen */}
                  <div className="flex flex-col gap-4">
                    <label className="form-label">Vista Previa de Portada</label>
                    <div className="relative aspect-video rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-slate-50 group">
                      {form.image_url ? (
                        <>
                          <img src={form.image_url} alt="Portada" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="gap-2"
                              onClick={() => document.getElementById('image-upload')?.click()}
                            >
                              <Upload size={14} /> Cambiar Imagen
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <ImageIcon size={40} strokeWidth={1} />
                          <p className="text-xs">No hay imagen seleccionada</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => document.getElementById('image-upload')?.click()}
                          >
                            Subir Portada
                          </Button>
                        </div>
                      )}
                      
                      {isUploading && (
                        <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-2 z-20">
                          <Loader2 size={24} className="animate-spin text-primary" />
                          <p className="text-xs font-bold text-primary animate-pulse">Subiendo a Cloudinary...</p>
                        </div>
                      )}
                    </div>
                    <input 
                      id="image-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                    <p className="text-[10px] text-muted-foreground italic text-center">
                      * Por defecto usa la imagen del curso, pero puedes subir una personalizada para este producto.
                    </p>
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
                  <div className="space-y-8">
                    {/* 1. Precio de Preventa (Opcional) */}
                    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/50 mb-2">
                      <label className="form-label text-amber-800 font-bold flex items-center gap-2">
                        <Settings size={14} /> Precio de Preventa (S/)
                      </label>
                      <div className="relative max-w-[240px]">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600/60 text-sm font-medium">S/</span>
                        <input 
                          type="text" 
                          pattern="^\d+(\.\d{1,2})?$"
                          className={`form-input pl-8 border-amber-200 focus:ring-amber-500 ${errors.presale_price ? 'border-destructive' : ''}`} 
                          placeholder="0.00" 
                          value={form.presale_price || ""} 
                          onChange={(e) => setFieldValue("presale_price", e.target.value.replace(/[^0-9.]/g, ''))} 
                        />
                      </div>
                      <p className="text-[10px] text-amber-700 mt-1.5 italic">* Este precio es opcional y se usa para campañas de lanzamiento.</p>
                      {errors.presale_price && <p className="text-destructive text-xs mt-1">{errors.presale_price}</p>}
                    </div>

                    {/* 2. Bloque de Precios Dinámico */}
                    <div className={cn(
                      "grid gap-6",
                      (selectedEdition as any)?.modality === "HIBRIDO" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                    )}>
                      {form.prices.map((priceObj, index) => (
                        <div key={index} className="p-5 border border-border rounded-xl bg-slate-50/30 shadow-sm">
                          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-tight text-xs">
                            <span className={cn(
                              "w-2 h-2 rounded-full",
                              priceObj.attendance_mode === "PRESENCIAL" ? "bg-orange-500" : "bg-blue-500"
                            )}></span>
                            Precios Modalidad {priceObj.attendance_mode}
                          </h4>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="form-label text-xs font-semibold">Matrícula (S/)</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">S/</span>
                                <input 
                                  type="text" 
                                  className={`form-input pl-8 ${errors[`prices.${index}.enrollment_fee`] ? 'border-destructive' : ''}`} 
                                  placeholder="0.00" 
                                  value={priceObj.enrollment_fee} 
                                  onChange={(e) => setPriceValue(index, "enrollment_fee", e.target.value)} 
                                />
                              </div>
                            </div>

                            <div>
                              <label className="form-label text-xs font-semibold">Precio Contado (S/)</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">S/</span>
                                <input 
                                  type="text" 
                                  className={`form-input pl-8 ${errors[`prices.${index}.cash_price`] ? 'border-destructive' : ''}`} 
                                  placeholder="0.00" 
                                  value={priceObj.cash_price} 
                                  onChange={(e) => setPriceValue(index, "cash_price", e.target.value)} 
                                />
                              </div>
                            </div>

                            <div>
                              <label className="form-label text-xs font-semibold">Precio en Cuotas (S/)</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">S/</span>
                                <input 
                                  type="text" 
                                  className={`form-input pl-8 ${errors[`prices.${index}.installment_price`] ? 'border-destructive' : ''}`} 
                                  placeholder="0.00" 
                                  value={priceObj.installment_price} 
                                  onChange={(e) => setPriceValue(index, "installment_price", e.target.value)} 
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 3. Control de Cuotas (Global) */}
                    <div className="bg-slate-100/50 p-5 rounded-xl border border-border shadow-inner">
                      <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold text-sm">
                        <Info size={16} className="text-primary" />
                        Configuración de Financiamiento (Global)
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="form-label text-xs font-semibold text-slate-600">Mínimo de Cuotas</label>
                          <input 
                            type="number" 
                            min="1" 
                            className={`form-input bg-white ${errors.installments_min_number ? 'border-destructive' : ''}`} 
                            value={form.installments_min_number} 
                            onChange={(e) => setFieldValue("installments_min_number", Number(e.target.value))} 
                          />
                          {errors.installments_min_number && <p className="text-destructive text-[10px] mt-1">{errors.installments_min_number}</p>}
                        </div>
                        <div>
                          <label className="form-label text-xs font-semibold text-slate-600">Máximo de Cuotas</label>
                          <input 
                            type="number" 
                            min="1" 
                            className={`form-input bg-white ${errors.installments_max_number ? 'border-destructive' : ''}`} 
                            value={form.installments_max_number} 
                            onChange={(e) => setFieldValue("installments_max_number", Number(e.target.value))} 
                          />
                          {errors.installments_max_number && <p className="text-destructive text-[10px] mt-1">{errors.installments_max_number}</p>}
                        </div>
                      </div>
                    </div>
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
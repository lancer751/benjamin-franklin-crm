import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  GraduationCap, ChevronLeft, Save, Loader2, Settings, Info, 
  Link as LinkIcon, Image as ImageIcon, Search, Check, Upload, 
  DollarSign, CheckSquare, Gift, Sparkles
} from "lucide-react";
import { getProductById } from "../services/productService";
import { getBenefits } from "../services/benefitService";
import { useProductFormModal } from "../hooks/useProductFormModal";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/core/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/core/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/core/components/ui/popover";
import { Button } from "@/core/components/ui/button";
import { Checkbox } from "@/core/components/ui/checkbox";
import { cn } from "@/core/lib/utils";
import ProductStatusBadge, { STATUS_LABELS } from "@/features/orders/components/ProductStatusBadge";

const ProductFormView = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [openCombobox, setOpenCombobox] = useState(false);
  const [activePriceTab, setActivePriceTab] = useState(0);

  // Obtener data inicial si estamos en modo edición
  const { data: productRes, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id as string),
    enabled: !!id,
  });

  const initialData = productRes?.success ? productRes.data : undefined;

  // Obtener beneficios dinámicos de la API
  const { data: benefitsRes, isLoading: isLoadingBenefits } = useQuery({
    queryKey: ["benefits"],
    queryFn: getBenefits,
  });

  const availableBenefits = benefitsRes?.data || [];

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
    isPending
  } = useProductFormModal(true, () => navigate("/productos"), initialData);

  useEffect(() => {
    if (activePriceTab >= form.prices.length) {
      setActivePriceTab(0);
    }
  }, [form.prices.length, activePriceTab]);

  const handleToggleBenefit = (benefitId: string) => {
    const current = form.benefit_ids || [];
    if (current.includes(benefitId)) {
      setFieldValue("benefit_ids", current.filter(bId => bId !== benefitId));
    } else {
      setFieldValue("benefit_ids", [...current, benefitId]);
    }
  };

  if (isEdit && isLoadingProduct) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Cargando información del producto...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      
      {/* HEADER SUPERIOR */}
      <div className="pt-2 mb-6 border-b border-slate-200/80 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl bg-white border border-slate-200 hover:bg-slate-50 shadow-sm"
            onClick={() => navigate("/productos")}
            disabled={isPending}
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {isEdit ? "Editar Producto Comercial" : "Configurar Nuevo Producto"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEdit ? `Modificando detalles para: ${form.name}` : "Asigna cursos académicos, configura precios y añade beneficios comerciales."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Button 
            variant="outline" 
            className="rounded-xl border-slate-200 hover:bg-slate-50"
            onClick={() => navigate("/productos")}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button 
            className="rounded-xl btn-primary gap-2 shadow-md shadow-primary/20"
            onClick={onSubmit}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <Save size={16} /> {isEdit ? "Actualizar Producto" : "Publicar Producto"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* DISEÑO EN 2 COLUMNAS (65% / 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA (65%) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* CARD 1: DETALLES ACADÉMICOS */}
          <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <GraduationCap size={16} className="text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-slate-900">Detalles Académicos y Venta</CardTitle>
                  <CardDescription className="text-xs">Asocia este producto a una cohorte y categoría específica.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <label className="form-label text-xs font-bold text-slate-700 mb-2 block">Edición / Cohorte (Buscador)</label>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className={cn(
                        "w-full justify-between h-11 text-left font-normal border-slate-200 hover:bg-slate-50 transition-all shadow-sm rounded-xl",
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
                {errors.edition_id && <p className="text-destructive text-[11px] font-medium mt-1.5 ml-1">{errors.edition_id}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label text-xs font-bold text-slate-700 mb-2 block flex items-center gap-2">
                    Categoría
                    {isLoadingCategories && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                  </label>
                  <Select 
                    value={form.category_id} 
                    onValueChange={(value) => setFieldValue("category_id", value)}
                    disabled={isLoadingCategories}
                  >
                    <SelectTrigger className={cn("h-11 shadow-sm rounded-xl", errors.category_id ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200')}>
                      <SelectValue placeholder={isLoadingCategories ? "Cargando..." : "Seleccionar categoría"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category_id && <p className="text-destructive text-[11px] font-medium mt-1.5 ml-1">{errors.category_id}</p>}
                </div>

                <div>
                  <label className="form-label text-xs font-bold text-slate-700 mb-2 block">Estado de Venta</label>
                  <Select 
                    value={form.sales_status} 
                    onValueChange={(value) => setFieldValue("sales_status", value as any)}
                  >
                    <SelectTrigger className="h-11 border-slate-200 shadow-sm rounded-xl">
                      <SelectValue placeholder="Selecciona el estado" />
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

              {/* DATOS DINÁMICOS COMPLEMENTARIOS DE LA EDICIÓN */}
              {selectedEdition && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Modalidad Base</label>
                    <div className="text-sm font-semibold text-slate-700 truncate">
                      {selectedEdition?.modality?.name || selectedEdition?.modality || "No definida"}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Profesor Principal</label>
                    <div className="text-sm font-semibold text-slate-700 truncate">
                      {selectedEdition?.teacher_fullname || "Por asignar"}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Código Cohorte</label>
                    <div className="text-sm font-mono font-bold text-slate-900 truncate">
                      {selectedEdition?.edition_code || "Sin código"}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CARD 2: CONFIGURACIÓN COMERCIAL */}
          <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Settings size={16} className="text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-slate-900">Configuración Comercial</CardTitle>
                  <CardDescription className="text-xs">Personaliza los títulos, descripciones y ofertas especiales para los alumnos.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <label className="form-label text-xs font-bold text-slate-700 mb-2 block">Nombre Comercial del Producto</label>
                <input 
                  type="text" 
                  className={cn("form-input rounded-xl h-11 border-slate-200", errors.name && 'border-destructive')} 
                  placeholder="Ej. Curso de React - Cohorte 1" 
                  value={form.name} 
                  onChange={(e) => setFieldValue("name", e.target.value)} 
                />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="form-label text-xs font-bold text-slate-700 mb-2 block">Slug (Identificador URL único)</label>
                <div className="relative">
                  <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input 
                    type="text" 
                    className={cn("form-input pl-9 rounded-xl h-11 border-slate-200 font-mono text-xs", errors.slug && 'border-destructive')} 
                    placeholder="curso-react-cohorte-1" 
                    value={form.slug} 
                    onChange={(e) => setFieldValue("slug", e.target.value)} 
                  />
                </div>
                {errors.slug && <p className="text-destructive text-xs mt-1">{errors.slug}</p>}
                <p className="text-[10px] text-muted-foreground mt-1.5 italic">Se autogenera del nombre pero puedes personalizarlo.</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="form-label text-xs font-bold text-slate-700 mb-2 block">Descripción Corta</label>
                  <input 
                    type="text" 
                    className={cn("form-input rounded-xl h-11 border-slate-200", errors.short_description && 'border-destructive')} 
                    placeholder="Escribe una breve introducción comercial" 
                    value={form.short_description || ""} 
                    onChange={(e) => setFieldValue("short_description", e.target.value)} 
                  />
                  {errors.short_description && <p className="text-destructive text-xs mt-1">{errors.short_description}</p>}
                </div>

                <div>
                  <label className="form-label text-xs font-bold text-slate-700 mb-2 block">Descripción Detallada</label>
                  <textarea 
                    className={cn("form-input rounded-xl min-h-[120px] border-slate-200 py-3", errors.description && 'border-destructive')} 
                    placeholder="Escribe los detalles completos de la edición académica..." 
                    value={form.description || ""} 
                    onChange={(e) => setFieldValue("description", e.target.value)} 
                  />
                  {errors.description && <p className="text-destructive text-xs mt-1">{errors.description}</p>}
                </div>
              </div>

              {/* OFERTAS TEMPORALES */}
              <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10">
                <h5 className="font-semibold text-xs text-primary mb-3 flex items-center gap-2 uppercase tracking-wide">
                  <Sparkles size={14} /> Campaña de Descuento Especial
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-slate-700 text-xs font-semibold mb-1.5 block">Precio con Descuento (S/)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">S/</span>
                      <input 
                        type="text" 
                        pattern="^\d+(\.\d{1,2})?$"
                        className={cn("form-input pl-8 rounded-xl h-11 border-slate-200 bg-white", errors.discount_price && 'border-destructive')} 
                        placeholder="0.00" 
                        value={form.discount_price || ""} 
                        onChange={(e) => setFieldValue("discount_price", e.target.value.replace(/[^0-9.]/g, ''))} 
                      />
                    </div>
                    {errors.discount_price && <p className="text-destructive text-xs mt-1">{errors.discount_price}</p>}
                  </div>
                  <div>
                    <label className="form-label text-slate-700 text-xs font-semibold mb-1.5 block">Fecha de Expiración</label>
                    <input 
                      type="date" 
                      className={cn("form-input rounded-xl h-11 border-slate-200 bg-white", errors.discount_expires_at && 'border-destructive')} 
                      value={form.discount_expires_at || ""} 
                      onChange={(e) => setFieldValue("discount_expires_at", e.target.value)} 
                    />
                    {errors.discount_expires_at && <p className="text-destructive text-xs mt-1">{errors.discount_expires_at}</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CARD 3: INTEGRACIÓN DE BENEFICIOS (Requisito Backend) */}
          <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Gift size={16} className="text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-slate-900">Beneficios Comerciales del Curso Máster</CardTitle>
                  <CardDescription className="text-xs">Selecciona los beneficios que recibirán los alumnos que adquieran este producto.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground italic mb-2">
                  * El backend requiere la asignación de al menos un beneficio activo para habilitar la orden de compra.
                </p>
                {isLoadingBenefits ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/40 animate-pulse">
                        <div className="w-4.5 h-4.5 rounded bg-slate-200" />
                        <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                      </div>
                    ))}
                  </div>
                ) : availableBenefits.length === 0 ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <Info className="h-5 w-5 text-slate-400" />
                    <p className="text-xs font-medium text-slate-400">No se encontraron beneficios disponibles.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {availableBenefits.map((benefit: any) => {
                      const isChecked = (form.benefit_ids || []).includes(benefit.id);
                      return (
                        <div 
                          key={benefit.id} 
                          onClick={() => handleToggleBenefit(benefit.id)}
                          className={cn(
                            "flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer select-none group",
                            isChecked 
                              ? "bg-primary/5 border-primary shadow-sm hover:bg-primary/[0.07]" 
                              : "bg-white border-slate-200 hover:bg-slate-50/80 hover:border-slate-300"
                          )}
                        >
                          <Checkbox 
                            id={benefit.id} 
                            checked={isChecked}
                            onCheckedChange={() => handleToggleBenefit(benefit.id)}
                            className="mt-0.5 border-slate-300 data-[state=checked]:bg-primary transition-all group-hover:scale-105"
                          />
                          <div className="grid gap-1">
                            <label className="text-xs font-bold text-slate-900 cursor-pointer select-none">
                              {benefit.description || benefit.name}
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {errors.benefit_ids && (
                  <p className="text-destructive text-xs mt-3 font-semibold flex items-center gap-1">
                    <Info size={12} /> {errors.benefit_ids}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* COLUMNA DERECHA (35% - STICKY AT BOTTOM) */}
        <div className="space-y-6 lg:h-fit lg:sticky lg:self-end lg:bottom-4">
          
          {/* CARD 4: PORTADA DEL PRODUCTO */}
          <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ImageIcon size={16} className="text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-slate-900">Portada del Producto</CardTitle>
                  <CardDescription className="text-xs">Imagen que visualizará el alumno en el landing comercial.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="relative aspect-video rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50/60 group hover:border-primary/50 transition-colors">
                {form.image_url ? (
                  <>
                    <img src={form.image_url} alt="Portada" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="gap-2 rounded-xl"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        <Upload size={14} /> Cambiar Portada
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground p-4 text-center">
                    <ImageIcon size={32} strokeWidth={1.5} className="text-slate-400" />
                    <p className="text-xs font-medium">No hay imagen seleccionada</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 rounded-xl border-slate-200 hover:bg-slate-100"
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      Subir Imagen
                    </Button>
                  </div>
                )}
                
                {isUploading && (
                  <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center gap-2 z-20 rounded-2xl">
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
              <p className="text-[10px] text-muted-foreground italic text-center leading-normal">
                * Se autocompleta con la imagen oficial de la cohorte elegida si no subes una personalizada.
              </p>
            </CardContent>
          </Card>

          {/* CARD 5: RESUMEN DE PRECIOS Y FINANCIAMIENTO */}
          <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <DollarSign size={16} className="text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-slate-900">Precios y Financiamiento</CardTitle>
                  <CardDescription className="text-xs">Establece los costos del programa académico.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              {/* PRECIO DE PREVENTA (OPCIONAL) */}
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/50">
                <label className="text-amber-800 text-xs font-bold flex items-center gap-1.5 mb-2">
                  Precio de Preventa (S/)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600/70 text-sm font-medium">S/</span>
                  <input 
                    type="text" 
                    pattern="^\d+(\.\d{1,2})?$"
                    className={cn("form-input pl-8 rounded-xl h-11 border-amber-200/70 bg-white focus:ring-amber-500", errors.presale_price && 'border-destructive')} 
                    placeholder="0.00" 
                    value={form.presale_price || ""} 
                    onChange={(e) => setFieldValue("presale_price", e.target.value.replace(/[^0-9.]/g, ''))} 
                  />
                </div>
                {errors.presale_price && <p className="text-destructive text-xs mt-1">{errors.presale_price}</p>}
                <p className="text-[9px] text-amber-700 mt-1.5 italic">* Opcional. Útil para lanzamientos anticipados.</p>
              </div>

              {!selectedEdition && !isEdit ? (
                <div className="flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200/80 rounded-2xl bg-slate-50/50 min-h-[220px] transition-all">
                  <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-3 text-amber-500 ring-4 ring-amber-100/50">
                    <Info size={22} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-700 mb-1">Precios por Modalidad Bloqueados</h4>
                  <p className="text-[11px] text-muted-foreground max-w-[200px] leading-normal">
                    Selecciona una Edición/Cohorte en el buscador para habilitar los campos de precios.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {form.prices.map((priceObj, index) => (
                    <div key={index} className="p-4 border border-slate-100 rounded-xl bg-slate-50/60 space-y-4">
                      <h4 className="font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider text-[10px]">
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          priceObj.attendance_mode === "PRESENCIAL" ? "bg-orange-500" : "bg-blue-500"
                        )}></span>
                        Modalidad {priceObj.attendance_mode}
                      </h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 mb-1.5 block">Matrícula (S/)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">S/</span>
                            <input 
                              type="text" 
                              className={cn("form-input pl-8 rounded-xl h-10 bg-white text-sm border-slate-200", errors[`prices.${index}.enrollment_fee`] && 'border-destructive')} 
                              placeholder="0.00" 
                              value={priceObj.enrollment_fee} 
                              onChange={(e) => setPriceValue(index, "enrollment_fee", e.target.value)} 
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-600 mb-1.5 block">Precio Contado (S/)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">S/</span>
                            <input 
                              type="text" 
                              className={cn("form-input pl-8 rounded-xl h-10 bg-white text-sm border-slate-200", errors[`prices.${index}.cash_price`] && 'border-destructive')} 
                              placeholder="0.00" 
                              value={priceObj.cash_price} 
                              onChange={(e) => setPriceValue(index, "cash_price", e.target.value)} 
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-600 mb-1.5 block">Precio en Cuotas (S/)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">S/</span>
                            <input 
                              type="text" 
                              className={cn("form-input pl-8 rounded-xl h-10 bg-white text-sm border-slate-200", errors[`prices.${index}.installment_price`] && 'border-destructive')} 
                              placeholder="0.00" 
                              value={priceObj.installment_price} 
                              onChange={(e) => setPriceValue(index, "installment_price", e.target.value)} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* FINANCIAMIENTO GLOBAL */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-4">
                    <h6 className="text-[10px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Info size={12} className="text-primary" /> Financiamiento
                    </h6>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 mb-1 block">Mínimo Cuotas</label>
                        <input 
                          type="number" 
                          min="1" 
                          className={cn("form-input h-9 rounded-lg bg-white text-xs border-slate-200", errors.installments_min_number && 'border-destructive')} 
                          value={form.installments_min_number} 
                          onChange={(e) => setFieldValue("installments_min_number", Number(e.target.value))} 
                        />
                        {errors.installments_min_number && <p className="text-destructive text-[9px] mt-0.5">{errors.installments_min_number}</p>}
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 mb-1 block">Máximo Cuotas</label>
                        <input 
                          type="number" 
                          min="1" 
                          className={cn("form-input h-9 rounded-lg bg-white text-xs border-slate-200", errors.installments_max_number && 'border-destructive')} 
                          value={form.installments_max_number} 
                          onChange={(e) => setFieldValue("installments_max_number", Number(e.target.value))} 
                        />
                        {errors.installments_max_number && <p className="text-destructive text-[9px] mt-0.5">{errors.installments_max_number}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
};

export default ProductFormView;

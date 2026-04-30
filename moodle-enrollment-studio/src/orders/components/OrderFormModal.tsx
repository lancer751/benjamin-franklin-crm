import { Controller } from "react-hook-form";
import { Trash2, ShoppingCart, Plus, Loader2, Check, ChevronsUpDown } from "lucide-react";
import ModalWrapper from "@/core/components/ModalWrapper";

// Hook Personalizado
import { useOrderFormModal } from "../hooks/useOrderFormModal";

import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/core/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/core/components/ui/command";
import { cn } from "@/core/lib/utils";
import { useState } from "react";

interface OrderFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: any;
}

export default function OrderFormModal({ open, onClose, initialData }: OrderFormModalProps) {
  const {
    form,
    fields,
    remove,
    handleAddProduct,
    onSubmit,
    leads,
    products,
    isLoadingLeads,
    isLoadingProducts,
    isLoadingFullOrder,
    openCombobox,
    setOpenCombobox,
    subtotal,
    discountValue,
    totalAmount,
    isPending,
    getProductLabel,
    errors,
    control,
    setValue
  } = useOrderFormModal(open, onClose, initialData);

  const { watch } = form;
  const [openProductCombobox, setOpenProductCombobox] = useState<Record<number, boolean>>({});
  const [rowPricing, setRowPricing] = useState<Record<number, { modality?: string, concept?: string }>>({});

  const toggleProductCombobox = (index: number, isOpen: boolean) => {
    setOpenProductCombobox(prev => ({ ...prev, [index]: isOpen }));
  };

  const updateRowPricing = (index: number, data: { modality?: string, concept?: string }) => {
    setRowPricing(prev => ({
      ...prev,
      [index]: { ...(prev[index] || {}), ...data }
    }));
  };

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={initialData ? "Editar Orden de Venta" : "Nueva Orden de Venta"}
      subtitle="Complete los datos para generar el cobro al cliente."
      icon={<ShoppingCart className="h-6 w-6 text-primary" />}
      maxWidth="max-w-4xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancelar</Button>
          <Button onClick={onSubmit} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Actualizar Orden" : "Crear Orden"}
          </Button>
        </>
      }
    >
      {isLoadingFullOrder ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin h-10 w-10 text-primary" />
        </div>
      ) : (
        <form className="space-y-8 pb-4" onSubmit={(e) => e.preventDefault()}>
          {/* SECCIÓN 1: Cliente y Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 flex flex-col">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cliente (Lead)</Label>
              <Controller
                control={control}
                name="lead_id"
                render={({ field }) => (
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCombobox}
                        className={cn(
                          "w-full justify-between font-normal",
                          !field.value && "text-muted-foreground",
                          errors.lead_id && "border-destructive"
                        )}
                      >
                        {isLoadingLeads ? (
                          <span className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando...</span>
                        ) : field.value ? (
                          leads.find((l: any) => l.id === field.value) 
                            ? `${leads.find((l: any) => l.id === field.value).first_name} ${leads.find((l: any) => l.id === field.value).last_name || ""}`
                            : "Cliente seleccionado"
                        ) : (
                          "Buscar cliente..."
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar por nombre o DNI..." />
                        <CommandList>
                          <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                          <CommandGroup>
                            {leads.map((lead: any) => (
                              <CommandItem
                                key={lead.id}
                                value={`${lead.first_name} ${lead.last_name} ${lead.dni || ""}`}
                                onSelect={() => {
                                  setValue("lead_id", lead.id, { shouldValidate: true });
                                  setOpenCombobox(false);
                                }}
                              >
                                <Check className={cn("mr-2 h-4 w-4", field.value === lead.id ? "opacity-100" : "opacity-0")} />
                                <div className="flex flex-col">
                                  <span>{lead.first_name} {lead.last_name}</span>
                                  {lead.dni && <span className="text-xs text-muted-foreground font-mono">DNI: {lead.dni}</span>}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.lead_id && <p className="text-xs text-destructive">{errors.lead_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estado de Orden</Label>
              <Controller
                control={control}
                name="order_status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pendiente</SelectItem>
                      <SelectItem value="COMPLETED">Completada</SelectItem>
                      <SelectItem value="REFUNDED">Reembolsada</SelectItem>
                      <SelectItem value="CANCELLED">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* SECCIÓN 2: Productos */}
          <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-border/50">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between items-center border-b border-border/50 pb-2 mb-2">
              <span>Productos / Cursos</span>
              <span className="text-muted-foreground/60 font-normal normal-case">Items incluidos en la orden</span>
            </Label>

            <div className="space-y-3">
              {fields.map((field, index) => {
                const selectedProductId = watch(`order_items.${index}.product_id`);
                const selectedProduct = products?.find((p: any) => p.id === selectedProductId);

                return (
                  <div key={field.id} className="flex flex-col sm:flex-row items-start gap-3 bg-card p-3 rounded-lg border border-border shadow-sm">
                    {/* Selector de Producto */}
                    <div className="flex-1 w-full space-y-1">
                      <Controller
                        control={control}
                        name={`order_items.${index}.product_id`}
                        render={({ field }) => (
                          <Popover 
                            open={openProductCombobox[index] || false} 
                            onOpenChange={(isOpen) => toggleProductCombobox(index, isOpen)}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between font-normal",
                                  !field.value && "text-muted-foreground",
                                  errors.order_items?.[index]?.product_id && "border-destructive"
                                )}
                                disabled={isLoadingProducts}
                              >
                                {isLoadingProducts ? (
                                  <span className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando...</span>
                                ) : field.value ? (
                                  products.find((p: any) => p.id === field.value)?.name || "Producto seleccionado"
                                ) : (
                                  "Seleccionar producto..."
                                )}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Buscar por nombre o modalidad..." />
                                <CommandList>
                                  <CommandEmpty>No se encontraron productos.</CommandEmpty>
                                  <CommandGroup>
                                    {products.map((product: any) => (
                                      <CommandItem
                                        key={product.id}
                                        value={`${product.name} ${product.edition?.modality || ""}`}
                                        onSelect={() => {
                                          setValue(`order_items.${index}.product_id`, product.id, { shouldValidate: true });
                                          // Resetear precios multidimensionales al cambiar de producto
                                          updateRowPricing(index, { modality: undefined, concept: undefined });
                                          setValue(`order_items.${index}.price`, 0, { shouldValidate: true });
                                          toggleProductCombobox(index, false);
                                        }}
                                      >
                                        <Check className={cn("mr-2 h-4 w-4", field.value === product.id ? "opacity-100" : "opacity-0")} />
                                        <div className="flex flex-col">
                                          <span className="font-bold">{product.name}</span>
                                          {product.edition?.modality && (
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                              Modalidad: {product.edition.modality}
                                            </span>
                                          )}
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        )}
                      />
                    </div>

                    {/* 2. Selector de Modalidad */}
                    <div className="w-full sm:w-40 space-y-1">
                      <Select
                        value={rowPricing[index]?.modality}
                        onValueChange={(val) => {
                          updateRowPricing(index, { modality: val, concept: undefined });
                          setValue(`order_items.${index}.price`, 0);
                        }}
                        disabled={!selectedProduct}
                      >
                        <SelectTrigger className={!rowPricing[index]?.modality && selectedProduct ? "border-orange-300" : ""}>
                          <SelectValue placeholder="Modalidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedProduct?.prices?.map((p: any, pIdx: number) => (
                            <SelectItem key={pIdx} value={p.attendance_mode}>
                              {p.attendance_mode}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 3. Selector de Concepto */}
                    <div className="w-full sm:w-48 space-y-1">
                      <Select
                        value={rowPricing[index]?.concept}
                        onValueChange={(val) => {
                          updateRowPricing(index, { concept: val });
                          
                          // Buscar el precio en el objeto correspondiente
                          const modalityData = selectedProduct?.prices?.find(
                            (p: any) => p.attendance_mode === rowPricing[index]?.modality
                          );

                          if (modalityData) {
                            let priceValue = 0;
                            if (val === "MATRICULA") priceValue = Number(modalityData.enrollment_fee || 0);
                            if (val === "CONTADO") priceValue = Number(modalityData.cash_price || 0);
                            if (val === "CUOTAS") priceValue = Number(modalityData.installment_price || 0);
                            
                            setValue(`order_items.${index}.price`, priceValue, { shouldValidate: true });
                          }
                        }}
                        disabled={!rowPricing[index]?.modality}
                      >
                        <SelectTrigger className={!rowPricing[index]?.concept && rowPricing[index]?.modality ? "border-orange-300" : ""}>
                          <SelectValue placeholder="Concepto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MATRICULA">Matrícula</SelectItem>
                          <SelectItem value="CONTADO">Precio Contado</SelectItem>
                          <SelectItem value="CUOTAS">Precio en Cuotas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 4. Precio Final (Informativo/Editable) */}
                    <div className="w-full sm:w-32 space-y-1">
                      <Controller
                        control={control}
                        name={`order_items.${index}.price`}
                        render={({ field: { value, onChange } }) => (
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">S/</span>
                            <Input 
                              type="number"
                              className="pl-7 font-mono font-bold text-primary"
                              value={value || ""}
                              onChange={(e) => onChange(Number(e.target.value) || 0)}
                            />
                          </div>
                        )}
                      />
                    </div>

                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => remove(index)} 
                      disabled={fields.length === 1} 
                      className="text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>

            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="text-primary border-primary/20 hover:bg-primary/5 mt-2" 
              onClick={handleAddProduct}
            >
              <Plus className="mr-2 h-4 w-4" /> Agregar otro producto
            </Button>
          </div>

          {/* SECCIÓN 3: Descuento y Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descuento Global Adicional (S/)</Label>
                <Controller
                  control={control}
                  name="discount"
                  render={({ field: { value, onChange } }) => (
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      className="max-w-[200px] text-lg font-mono" 
                      value={value || ""} 
                      onChange={(e) => onChange(parseFloat(e.target.value) || 0)} 
                    />
                  )}
                />
              </div>
            </div>

            <div className="bg-muted/30 p-6 rounded-xl border border-border space-y-4 shadow-inner">
              <h4 className="text-sm font-bold text-foreground border-b border-border/50 pb-2">Resumen de Cobro</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal Productos</span>
                  <span className="font-medium text-foreground">S/ {subtotal.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Descuento Aplicado</span>
                  <span className="font-medium text-destructive">- S/ {Number(discountValue).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</span>
                </div>
                
                <div className="flex justify-between items-end border-t border-border/50 pt-4 mt-2">
                  <span className="text-sm font-bold text-foreground uppercase tracking-tight">Total Final</span>
                  <span className="text-3xl font-bold text-primary tracking-tighter">S/ {totalAmount.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </ModalWrapper>
  );
}
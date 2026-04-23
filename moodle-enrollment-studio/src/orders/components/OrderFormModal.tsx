import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, ShoppingCart, Plus, Loader2, Check, ChevronsUpDown, Search } from "lucide-react";
import ModalWrapper from "@/core/components/ModalWrapper";

// 🧠 Importaciones de Servicios
import { getProducts } from "@/orders/services/productService";
import { getOrderById, createOrder, updateOrder } from "@/orders/services/orderService";
import { getCourseEditions } from "@/academic/services/courseService";
import { getAllLeads } from "@/leads/services/leadService"; // 👈 Nuevo: Servicio de Leads

import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/core/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/core/components/ui/command";
import { toast } from "sonner";
import { cn } from "@/core/lib/utils";

// SCHEMA FRONTEND
const orderSchema = z.object({
  lead_id: z.string().uuid("Selecciona un cliente válido"),
  order_status: z.enum(["PENDING", "COMPLETED", "REFUNDED", "CANCELLED"]),
  sub_total: z.number().min(0),
  total_amount: z.number().min(0),
  discount: z.number().min(0),
  order_items: z.array(
    z.object({
      product_id: z.string().uuid("Selecciona un producto válido"),
      price: z.number().min(0),
      discount_code: z.string().optional(),
    })
  ).min(1, "Agrega al menos un producto"),
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface OrderFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: any;
}

export default function OrderFormModal({ open, onClose, initialData }: OrderFormModalProps) {
  const queryClient = useQueryClient();
  const [openCombobox, setOpenCombobox] = useState(false);

  // 🧠 Fetch de Datos (Leads, Productos, Ediciones)
  const { data: leadsData, isLoading: isLoadingLeads } = useQuery({
    queryKey: ["leads"],
    queryFn: getAllLeads,
    enabled: open,
  });

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    enabled: open,
  });

  const { data: editionsRes } = useQuery({
    queryKey: ["editions"],
    queryFn: getCourseEditions,
    enabled: open,
  });

  const leads = Array.isArray(leadsData) ? leadsData : (leadsData as any)?.data || [];
  const products = Array.isArray(productsData) ? productsData : (productsData as any)?.data || [];
  const editions = Array.isArray(editionsRes) ? editionsRes : (editionsRes as any)?.data || [];

  const { data: fullOrderData, isLoading: isLoadingFullOrder } = useQuery({
    queryKey: ['order', initialData?.id],
    queryFn: () => getOrderById(initialData.id),
    enabled: !!initialData?.id && open
  });

  const getProductLabel = (product: any) => {
    if (!editions.length) return product.category;
    const edition = editions.find((ed: any) => ed.id === product.edition_id);
    return edition?.course?.name ? `${edition.course.name} - ${product.category}` : "Producto sin nombre";
  };

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      lead_id: "",
      order_status: "PENDING",
      sub_total: 0,
      total_amount: 0,
      discount: 0,
      order_items: [{ product_id: "", price: 0, discount_code: "" }],
    },
  });

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "order_items" });

  const orderItems = watch("order_items");
  const discount = watch("discount") || 0;

  // VARIABLES DERIVADAS EN TIEMPO REAL
  const subtotal = (orderItems || []).reduce((acc, item) => acc + (Number(item.price) || 0), 0);
  const total = Math.max(0, subtotal - Number(discount));

  // ACTUALIZACIÓN DE ESTADO DEL FORMULARIO
  useEffect(() => {
    setValue("sub_total", subtotal, { shouldValidate: true });
    setValue("total_amount", total, { shouldValidate: true });
  }, [subtotal, total, setValue]);

  // CARGA DE DATOS INICIALES
  useEffect(() => {
    if (open) {
      if (initialData?.id && fullOrderData) {
        const data = fullOrderData;
        reset({
          lead_id: data.lead_id || "",
          order_status: data.order_status || "PENDING",
          sub_total: Number(data.sub_total) || 0,
          total_amount: Number(data.total_amount) || 0,
          discount: Number(data.discount) || 0,
          order_items: data.orderDetails?.length > 0
            ? data.orderDetails.map((item: any) => ({
              product_id: item.product_id,
              price: Number(item.price),
              discount_code: item.discount_code || "",
            }))
            : [{ product_id: "", price: undefined as unknown as number, discount_code: "" }],
        });
      } else if (!initialData) {
        reset({
          lead_id: "", order_status: "PENDING", sub_total: 0, total_amount: 0, discount: 0,
          order_items: [{ product_id: "", price: undefined as unknown as number, discount_code: "" }], // Usamos undefined hack para forzar el placeholder
        });
      }
    }
  }, [open, fullOrderData, initialData, reset]);

  // MUTACIÓN
  const mutation = useMutation({
    mutationFn: (data: OrderFormValues) => {
      const payload = {
        ...data,
        order_items: data.order_items.map(item => ({
          product_id: item.product_id,
          price: Number(item.price),
          discount_code: item.discount_code?.trim() ? item.discount_code.trim() : undefined
        }))
      };
      if (initialData?.id) return updateOrder(initialData.id, payload as any);
      return createOrder(payload as any);
    },
    onSuccess: () => {
      toast.success(`Orden ${initialData ? "actualizada" : "creada"} correctamente`);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      onClose();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Ocurrió un error al guardar la orden. Verifique los datos.");
    }
  });



  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={initialData ? "Editar Orden de Venta" : "Nueva Orden de Venta"}
      subtitle="Complete los datos para generar el cobro al cliente."
      icon={<ShoppingCart className="h-6 w-6 text-primary" />}
      maxWidth="max-w-4xl" // Ensanchado un poco para que los selects entren mejor
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>Cancelar</Button>
          <Button onClick={handleSubmit((data) => mutation.mutate(data))} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Actualizar Orden" : "Crear Orden"}
          </Button>
        </>
      }
    >
      {isLoadingFullOrder ? (
        <Loader2 className="animate-spin mx-auto my-10 h-8 w-8 text-primary" />
      ) : (
        <form className="space-y-8 pb-4">
          {/* ROW 1: Cliente y Estado */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 flex flex-col">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cliente (Prospecto)</Label>

              {/* 🧠 COMBOBOX INTELIGENTE PARA BUSCAR CLIENTES */}
              <Controller control={control} name="lead_id" render={({ field }) => (
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
                        <span className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando clientes...</span>
                      ) : field.value ? (
                        leads.find((l: any) => l.id === field.value)?.first_name + " " + (leads.find((l: any) => l.id === field.value)?.last_name || "")
                      ) : (
                        "Buscar cliente por nombre..."
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Escribe para buscar un cliente..." />
                      <CommandList>
                        <CommandEmpty>No se encontraron clientes.</CommandEmpty>
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
              )} />
              {errors.lead_id && <p className="text-xs text-destructive">{errors.lead_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estado de Orden</Label>
              <Controller control={control} name="order_status" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Estado..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                    <SelectItem value="COMPLETED">Completada</SelectItem>
                    <SelectItem value="REFUNDED">Reembolsada</SelectItem>
                    <SelectItem value="CANCELLED">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
          </div>

          {/* ROW 2: Detalle de Productos */}
          <div className="space-y-4 bg-slate-50/50 p-4 -mx-4 rounded-xl border border-border/50">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between items-center border-b border-border/50 pb-2">
              <span>Detalle de Productos</span>
              <span className="text-muted-foreground/60 font-normal normal-case">Añade los cursos a cobrar</span>
            </Label>

            <div className="space-y-3">
              {fields.map((field, index) => {
                const selectedProductId = watch(`order_items.${index}.product_id`);
                const selectedProduct = products?.find((p: any) => p.id === selectedProductId);

                return (
                  <div key={field.id} className="flex items-start gap-3 bg-card p-2 rounded-lg border border-border shadow-sm">
                    {/* Selector de Producto */}
                    <div className="flex-1 space-y-1">
                      <Controller control={control} name={`order_items.${index}.product_id`} render={({ field: { value, onChange } }) => (
                        <Select value={value} onValueChange={(val) => {
                          onChange(val);
                          const prod = products.find((p: any) => p.id === val);
                          if (prod && prod.cash_price) {
                            setValue(`order_items.${index}.price`, Number(prod.cash_price), { shouldValidate: true });
                          }
                        }}
                          disabled={isLoadingProducts}
                        >
                          <SelectTrigger className={errors.order_items?.[index]?.product_id ? "border-destructive" : ""}>
                            <SelectValue placeholder="Seleccionar producto..." />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p: any) => (
                              <SelectItem key={p.id} value={p.id}>{getProductLabel(p)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )} />
                    </div>

                    {/* Cupón */}
                    <div className="w-32 space-y-1 shrink-0">
                      <Controller control={control} name={`order_items.${index}.discount_code`} render={({ field }) => (
                        <Input placeholder="Cupón (Opc.)" {...field} />
                      )} />
                    </div>

                    {/* Precio (Select Dinámico Controlado por Gerencia) */}
                    <div className="w-56 space-y-1 shrink-0">
                      <Controller control={control} name={`order_items.${index}.price`} render={({ field: { value, onChange } }) => (
                        <Select
                          value={value ? String(value) : undefined} // undefined hace que muestre el placeholder
                          onValueChange={(val) => onChange(Number(val))}
                          disabled={!selectedProduct}
                        >
                          <SelectTrigger className={errors.order_items?.[index]?.price ? "border-destructive" : ""}>
                            <SelectValue placeholder="Seleccionar modalidad..." />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedProduct && (
                              <>
                                <SelectItem value={String(selectedProduct.cash_price)}>
                                  Contado (S/ {selectedProduct.cash_price})
                                </SelectItem>
                                <SelectItem value={String(selectedProduct.installment_price)}>
                                  Cuotas (S/ {selectedProduct.installment_price})
                                </SelectItem>
                                {selectedProduct.discount_price > 0 && (
                                  <SelectItem value={String(selectedProduct.discount_price)}>
                                    Descuento (S/ {selectedProduct.discount_price})
                                  </SelectItem>
                                )}
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      )} />
                    </div>

                    {/* Eliminar Fila */}
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1} className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0 mt-0.5">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>

            <Button type="button" variant="outline" size="sm" className="text-primary border-primary/20 hover:bg-primary/5 mt-2" onClick={() => append({ product_id: "", price: undefined as unknown as number, discount_code: "" })}>
              <Plus className="mr-2 h-4 w-4" /> Agregar otro producto
            </Button>
          </div>

          {/* ROW 3: Resumen */}
          <div className="grid grid-cols-2 gap-8 pt-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descuento Global (S/)</Label>
                <Controller control={control} name="discount" render={({ field: { value, onChange } }) => (
                  <Input type="number" min="0" step="0.01" className="max-w-[200px] text-lg font-mono" value={value === 0 && !value ? "" : value} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} />
                )} />
              </div>
            </div>

            <div className="bg-muted/30 p-5 rounded-xl border border-border space-y-3 shadow-inner">
              <h4 className="text-sm font-semibold text-foreground border-b border-border/50 pb-2 mb-3">Resumen de Cobro</h4>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">S/ {subtotal.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Descuento Global</span>
                <span className="font-medium text-destructive">- S/ {Number(discount || 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-end border-t border-border/50 pt-3 mt-1">
                <span className="text-sm font-bold text-foreground">Total a Cobrar</span>
                <span className="text-2xl font-bold text-primary tracking-tight">S/ {total.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

        </form>
      )}
    </ModalWrapper>
  );
}
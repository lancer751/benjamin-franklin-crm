import { useState, useRef, useMemo, DragEvent } from "react";
import { Users, ChevronDown, DollarSign, Info, Upload, FileImage, X, CalendarIcon, Search, Loader2 } from "lucide-react";
import { format, addMonths } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/core/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/core/components/ui/popover";
import { Calendar } from "@/core/components/ui/calendar";
import ModalWrapper from "@/core/components/ModalWrapper";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { getOrders } from "@/orders/services/orderService";
import { getAllLeads } from "@/leads/services/leadService";
import { createManualPayment } from "@/payments/services/paymentService";

const paymentSchema = z.object({
  clienteOrden: z.string().min(1, "Seleccione una orden o cliente"),
  metodoPago: z.string().min(1, "Seleccione un método de pago"),
  tipoPago: z.enum(["FULL", "INSTALLMENTS"]),
  numeroCuotas: z.string().optional(),
  monto: z.string().min(1, "Ingrese un monto válido"),
  idTransaccion: z.string().optional(),
  dueDate: z.date().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: any;
}

const PaymentForm = ({ open, onClose, initialData }: PaymentFormProps) => {
  const isEdit = !!initialData;
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const queryClient = useQueryClient();

  const { data: ordersRes } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    enabled: open,
  });

  const { data: leadsRes } = useQuery({
    queryKey: ["leads"],
    queryFn: getAllLeads,
    enabled: open,
  });

  const ordersData = Array.isArray(ordersRes) ? ordersRes : (ordersRes as any)?.data || [];
  const leadsData = Array.isArray(leadsRes) ? leadsRes : (leadsRes as any)?.data || [];

  // Filtrar solo las que no son completadas
  const activeOrders = useMemo(() => {
    return ordersData.filter((o: any) => o.order_status !== "COMPLETED");
  }, [ordersData]);

  // Enriquecer con nombre del prospecto para el buscador
  const enrichedOrders = useMemo(() => {
    return activeOrders.map((o: any) => {
      const lead = leadsData.find((l: any) => l.id === o.lead_id);
      return {
        id: o.id,
        order_code: o.order_code ? `#${o.order_code}` : "N/D",
        client: lead ? `${lead.first_name} ${lead.last_name}` : "Cliente Desconocido",
        email: lead?.email || "Sin email",
        total: o.total_amount || 0,
      };
    });
  }, [activeOrders, leadsData]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery) return enrichedOrders;
    const q = searchQuery.toLowerCase();
    return enrichedOrders.filter((o: any) => 
      o.order_code.toLowerCase().includes(q) || 
      o.client.toLowerCase().includes(q)
    );
  }, [searchQuery, enrichedOrders]);

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      clienteOrden: initialData?.clienteOrden || "",
      metodoPago: initialData?.metodoPago || "",
      tipoPago: initialData?.tipoPago || "FULL",
      numeroCuotas: initialData?.numeroCuotas || "",
      monto: initialData?.monto || "0.00",
      idTransaccion: initialData?.idTransaccion || "",
      dueDate: initialData?.dueDate || undefined,
    }
  });

  const clienteOrdenWatch = watch("clienteOrden");
  const tipoPagoWatch = watch("tipoPago");
  const dueDateWatch = watch("dueDate");

  const selectedOrderEnriched = useMemo(() => {
    return enrichedOrders.find((o: any) => o.id === clienteOrdenWatch);
  }, [enrichedOrders, clienteOrdenWatch]);

  const selectOrder = (order: any) => {
    setValue("clienteOrden", order.id, { shouldValidate: true });
    setValue("monto", String(order.total), { shouldValidate: true });
    setSearchOpen(false);
    setSearchQuery("");
  };

  const handleFile = (f: File) => {
    const valid = ["image/png", "image/jpeg", "application/pdf"];
    if (valid.includes(f.type) && f.size <= 5 * 1024 * 1024) setFile(f);
  };

  const onDrop = (e: DragEvent) => { 
    e.preventDefault(); 
    setIsDragging(false); 
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); 
  };

  // Mutación
  const mutation = useMutation({
    mutationFn: (payload: any) => createManualPayment(payload),
    onSuccess: () => {
      toast.success("Pago registrado correctamente");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      onClose();
      reset();
      setFile(null);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error al registrar el pago");
    }
  });

  const onSubmitForm = (data: PaymentFormValues) => {
    const payload: any = {
      order_id: data.clienteOrden,
      amount: Number(data.monto),
      payment_method: data.metodoPago,
      type: data.tipoPago,
      payment_status: "CONFIRMED",
      payment_date: new Date().toISOString(),
    };

    if (data.tipoPago === "INSTALLMENTS") {
      const baseDate = data.dueDate || new Date();
      const numCuotas = Number(data.numeroCuotas) || 1;
      const cuotaAmount = Number(data.monto) / numCuotas;

      const scheduled_payments = Array.from({ length: numCuotas }).map((_, i) => ({
        due_date: addMonths(baseDate, i).toISOString(),
        due_amount: cuotaAmount,
        number: i + 1,
        status: "PENDING"
      }));

      payload.payment_plan = {
        total_installments: numCuotas,
        order_id: data.clienteOrden,
        total_amount: Number(data.monto),
        start_date: baseDate.toISOString(),
        status: "PENDING",
        scheduled_payments
      };
    }

    mutation.mutate(payload);
  };

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEdit ? "Editar Pago" : "Nuevo Pago"}
      subtitle="Registre el ingreso de fondos para una inscripción activa."
      maxWidth="max-w-lg"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={mutation.isPending}>Cancelar</button>
          <button className="btn-primary" onClick={handleSubmit(onSubmitForm)} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Actualizar" : "Registrar Pago"}
          </button>
        </>
      }
    >
      <div className="space-y-5 pb-2">
        {/* Selector de Orden / Cliente */}
        <div>
          <label className="form-label">Buscar Orden o Cliente</label>
          <div className="relative">
            <div
              onClick={() => setSearchOpen(!searchOpen)}
              className={cn("form-input pl-10 cursor-pointer flex items-center min-h-[40px]", errors.clienteOrden && "border-destructive")}
            >
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><Search size={16} /></span>
              {selectedOrderEnriched ? (
                <div className="flex items-center gap-2">
                  <span className="text-primary font-semibold text-sm">{selectedOrderEnriched.order_code}</span>
                  <span className="text-foreground text-sm">— {selectedOrderEnriched.client}</span>
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">Ej: #ORD-2931 o Mariana Velásquez</span>
              )}
            </div>
            {errors.clienteOrden && <p className="text-xs text-destructive mt-1">{errors.clienteOrden.message}</p>}
            
            {searchOpen && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg bg-card border border-border shadow-lg overflow-hidden">
                <div className="p-2 border-b border-border">
                  <input
                    autoFocus
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none px-2 py-1.5"
                    placeholder="Buscar por orden o cliente..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredOrders.map((o: any) => (
                    <button
                      key={o.id}
                      onClick={() => selectOrder(o)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                    >
                      <div>
                        <span className="text-primary font-semibold text-sm">{o.order_code}</span>
                        <p className="text-xs text-foreground">{o.client}</p>
                        <p className="text-[10px] text-muted-foreground">{o.email}</p>
                      </div>
                      <span className="text-sm font-bold text-foreground">S/ {o.total}</span>
                    </button>
                  ))}
                  {filteredOrders.length === 0 && (
                    <p className="px-4 py-3 text-sm text-muted-foreground text-center">Sin resultados</p>
                  )}
                </div>
              </div>
            )}
          </div>
          {selectedOrderEnriched && (
            <div className="mt-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-primary" />
                  <span className="text-sm font-medium text-foreground">{selectedOrderEnriched.client}</span>
                </div>
                <span className="text-sm font-bold text-primary">S/ {selectedOrderEnriched.total}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{selectedOrderEnriched.email}</p>
            </div>
          )}
        </div>

        {/* Método de Pago */}
        <div>
          <label className="form-label">Método de Pago</label>
          <div className="relative">
            <Controller
              control={control}
              name="metodoPago"
              render={({ field }) => (
                <select className={cn("form-select pr-10", errors.metodoPago && "border-destructive")} {...field}>
                  <option value="">Seleccione una opción</option>
                  <option value="YAPE">Yape</option>
                  <option value="BANK_TRANSFER">Transferencia</option>
                  <option value="POS">POS</option>
                  <option value="CASH">Efectivo</option>
                  <option value="ONLINE">Online</option>
                </select>
              )}
            />
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
          {errors.metodoPago && <p className="text-xs text-destructive mt-1">{errors.metodoPago.message}</p>}
        </div>

        {/* Tipo de Pago */}
        <div>
          <label className="form-label">Tipo de Pago</label>
          <div className="grid grid-cols-2 gap-3 mt-1.5">
            <button
              type="button"
              onClick={() => setValue("tipoPago", "FULL", { shouldValidate: true })}
              className={`py-4 rounded-lg text-left px-4 transition-all ${
                tipoPagoWatch === "FULL"
                  ? "border-2 border-primary bg-primary/5"
                  : "border-2 border-transparent bg-muted"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${tipoPagoWatch === "FULL" ? "border-primary" : "border-muted-foreground"}`}>
                  {tipoPagoWatch === "FULL" && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <span className="font-semibold text-sm text-foreground">Pago Total</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 ml-6">Un solo desembolso</p>
            </button>
            <button
              type="button"
              onClick={() => setValue("tipoPago", "INSTALLMENTS", { shouldValidate: true })}
              className={`py-4 rounded-lg text-left px-4 transition-all ${
                tipoPagoWatch === "INSTALLMENTS"
                  ? "border-2 border-primary bg-primary/5"
                  : "border-2 border-transparent bg-muted"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${tipoPagoWatch === "INSTALLMENTS" ? "border-primary" : "border-muted-foreground"}`}>
                  {tipoPagoWatch === "INSTALLMENTS" && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <span className="font-semibold text-sm text-foreground">Pago en Cuotas</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 ml-6">Plan de financiamiento</p>
            </button>
          </div>
        </div>

        {/* Cuotas + DatePicker condicional */}
        {tipoPagoWatch === "INSTALLMENTS" && (
          <div className="space-y-4">
            <div>
              <label className="form-label">Número de Cuotas</label>
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  control={control}
                  name="numeroCuotas"
                  render={({ field }) => (
                    <input className="form-input" placeholder="Ej: 3" type="number" min="1" {...field} />
                  )}
                />
                <p className="flex items-center text-xs text-muted-foreground">Se generarán comprobantes mensuales automáticos.</p>
              </div>
            </div>
            <div>
              <label className="form-label">Fecha Límite de Pago (due_date)</label>
              <Controller
                control={control}
                name="dueDate"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "form-input flex items-center gap-2 w-full text-left",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon size={16} className="text-muted-foreground shrink-0" />
                        {field.value ? format(field.value, "PPP", { locale: es }) : "Seleccionar fecha límite"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => field.onChange(date)}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
          </div>
        )}

        {/* Monto + ID */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Monto a Pagar</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm"><DollarSign size={14} /></span>
              <Controller
                control={control}
                name="monto"
                render={({ field }) => (
                  <input className={cn("form-input pl-8", errors.monto && "border-destructive")} placeholder="0.00" {...field} />
                )}
              />
            </div>
            {errors.monto && <p className="text-xs text-destructive mt-1">{errors.monto.message}</p>}
          </div>
          <div>
            <label className="form-label">ID de Transacción</label>
            <Controller
              control={control}
              name="idTransaccion"
              render={({ field }) => (
                <input className="form-input" placeholder="Ref. de pago" {...field} />
              )}
            />
          </div>
        </div>

        {/* Comprobante Upload */}
        <div>
          <label className="form-label">Comprobante de Pago (Voucher)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
          />
          {file ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <FileImage size={20} className="text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
              </div>
              <button type="button" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="p-1 rounded hover:bg-muted text-muted-foreground"><X size={16} /></button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 cursor-pointer transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
              }`}
            >
              <Upload size={24} className="text-muted-foreground" />
              <p className="text-sm text-foreground font-medium">Haz clic o arrastra el comprobante de pago (Voucher)</p>
              <p className="text-xs text-muted-foreground">PNG, JPG o PDF. Máx 5MB</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex items-start gap-2.5 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
          <Info size={16} className="text-primary mt-0.5 shrink-0" />
          <p>Al confirmar el pago y adjuntar el comprobante, el sistema emitirá automáticamente la factura correspondiente.</p>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default PaymentForm;

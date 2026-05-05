import { useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Edit, CheckCircle2, XCircle, Upload, Download, RefreshCw,
  CreditCard, Receipt, User, FileText, ImageIcon, AlertCircle, Loader2
} from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Separator } from "@/core/components/ui/separator";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPaymentById, updatePayment } from "@/payments/services/paymentService";

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pendiente", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  CONFIRMED: { label: "Confirmado", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  FAILED: { label: "Fallido", className: "bg-red-100 text-red-700 border-red-200" },
  REFUNDED: { label: "Reembolsado", className: "bg-muted text-muted-foreground border-border" },
};

const methodLabels: Record<string, string> = {
  YAPE: "Yape", TRANSFERENCIA: "Transferencia Bancaria", POS: "POS / Tarjeta", EFECTIVO: "Efectivo",
};

const PaymentDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Integración de Datos Reales
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["payment", id],
    queryFn: () => getPaymentById(id!),
    enabled: !!id,
  });

  // Mutación para Validar Pago
  const validateMutation = useMutation({
    mutationFn: (newStatus: string) => updatePayment(id!, { payment_status: newStatus as any }),
    onSuccess: () => {
      toast.success("Pago validado correctamente");
      queryClient.invalidateQueries({ queryKey: ["payment", id] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: () => {
      toast.error("No se pudo validar el pago");
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p>Cargando detalles de la transacción...</p>
      </div>
    );
  }

  if (isError || !response?.data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-destructive">
        <p className="font-bold text-lg">No se pudo cargar el pago o no existe.</p>
        <Button onClick={() => navigate("/pagos")} variant="outline" className="mt-4">Volver a Pagos</Button>
      </div>
    );
  }

  const payment = response.data;
  const statusInfo = statusConfig[payment.payment_status] || statusConfig.PENDING;
  const hasReceipt = !!payment.payment_receipt;
  
  // Mapeo dinámico de moneda
  const currencySymbol = payment.currency === "PEN" ? "S/" : "$";

  const handleFileSelect = (file: File) => {
    const valid = ["image/png", "image/jpeg", "application/pdf"];
    if (!valid.includes(file.type)) {
      toast({ title: "Formato no soportado", description: "Solo PNG, JPG o PDF.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Archivo muy grande", description: "Máximo 5MB.", variant: "destructive" });
      return;
    }
    setUploadedFile(file);
    toast.success(`Comprobante adjuntado: ${file.name}`);
    // TODO: Conectar con endpoint de subida de archivos
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/pagos")}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Detalle de la Transacción</h1>
            <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">ID: {payment.id} • Registrado el {payment.payment_date}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit size={16} className="mr-1" /> Editar
          </Button>
          {payment.payment_status === "PENDING" && (
            <Button 
              size="sm" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => validateMutation.mutate("CONFIRMED")}
              disabled={validateMutation.isPending}
            >
              {validateMutation.isPending ? <Loader2 size={16} className="mr-1 animate-spin" /> : <CheckCircle2 size={16} className="mr-1" />}
              Validar Pago
            </Button>
          )}
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => validateMutation.mutate("FAILED")}
            disabled={validateMutation.isPending}
          >
            <XCircle size={16} className="mr-1" /> Marcar Fallido
          </Button>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-5 gap-6">
        {/* Left Column — 3/5 */}
        <div className="col-span-3 space-y-4">
          {/* Amount Card */}
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Monto del Pago</p>
                <p className="text-4xl font-bold text-foreground">
                  {currencySymbol} {Number(payment.amount).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Moneda: {payment.currency} • {payment.payment_status}</p>
              </div>
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <CreditCard size={32} className="text-primary" />
              </div>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt size={18} className="text-primary" /> Detalles de la Transacción
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Método de Pago</p>
                  <p className="font-semibold text-foreground">{methodLabels[payment.payment_method] || payment.payment_method}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Tipo de Pago</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-medium">
                      {payment.type === "FULL" ? "Pago Total" : "Pago de Cuota"}
                    </Badge>
                    {payment.type === "INSTALLMENTS" && payment.schedulePayment && (
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                        Cuota #{payment.schedulePayment.number}
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Fecha de Pago</p>
                  <p className="text-foreground">{payment.payment_date}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">ID Transacción / Voucher</p>
                  <p className="font-mono text-sm text-foreground bg-muted px-2 py-0.5 rounded border">{payment.transaccion_id || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Origin Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User size={18} className="text-primary" /> Origen del Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                  {payment.order?.lead?.first_name?.[0]}{payment.order?.lead?.middle_name?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {`${payment.order?.lead?.first_name} ${payment.order?.lead?.middle_name} ${payment.order?.lead?.last_name}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {payment.order?.lead?.email} • {payment.order?.lead?.phone}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Orden Asociada</p>
                  <p className="font-semibold text-foreground">#{payment.order_id}</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/ordenes/${payment.order_id}`}>
                    <FileText size={14} className="mr-1" /> Ver Orden #{payment.order_id}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column — 2/5 */}
        <div className="col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon size={18} className="text-primary" /> Comprobante de Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasReceipt ? (
                <div className="space-y-4">
                  {/* Preview */}
                  <div className="rounded-lg border border-border bg-muted/50 overflow-hidden group relative">
                    <img
                      src={payment.payment_receipt}
                      alt="Comprobante"
                      className="w-full h-auto max-h-80 object-contain mx-auto transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button variant="secondary" size="sm" asChild>
                        <a href={payment.payment_receipt} target="_blank" rel="noreferrer" className="flex items-center">
                          <Eye size={14} className="mr-1" /> Pantalla Completa
                        </a>
                      </Button>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={payment.payment_receipt} target="_blank" rel="noopener noreferrer">
                        <Download size={14} className="mr-1" /> Descargar
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <RefreshCw size={14} className="mr-1" /> Reemplazar
                    </Button>
                  </div>
                </div>
              ) : (
                /* Soft Alert State */
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-lg border-2 border-dashed border-border bg-muted/20">
                  <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center mb-3">
                    <AlertCircle size={24} className="text-amber-500" />
                  </div>
                  <p className="text-sm font-bold text-foreground">Sin Comprobante Digital</p>
                  <p className="text-[11px] text-muted-foreground mt-1 max-w-[200px]">
                    No se ha registrado un respaldo visual para esta transacción en el servidor.
                  </p>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-5 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={14} className="mr-1" /> Subir Comprobante
                  </Button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />

              {/* Info note */}
              <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/20 p-3">
                <AlertCircle size={16} className="text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Al validar el pago con comprobante adjunto, el sistema emitirá automáticamente la factura y actualizará el estado de la orden.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailView;

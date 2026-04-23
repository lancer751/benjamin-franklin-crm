import { useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Edit, CheckCircle2, XCircle, Upload, Download, RefreshCw,
  CreditCard, Receipt, User, FileText, ImageIcon, AlertCircle
} from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Separator } from "@/core/components/ui/separator";
import { toast } from "@/core/hooks/use-toast";

// MOCK DATA Alineada con Zod PaymentSchema
const paymentsData: Record<string, any> = {
  "PAY-001": {
    id: "PAY-001", order_id: "ORD-001", amount: 1200, currency: "PEN",
    payment_method: "YAPE", type: "FULL", payment_status: "CONFIRMED", payment_date: "2024-06-28 14:32",
    transaccion_id: "YPE-8827391042", receipt: "/placeholder.svg",
    client: { name: "Jorge Castillo", email: "j.castillo@email.com", phone: "+51 987 654 321" },
  },
  "PAY-002": {
    id: "PAY-002", order_id: "ORD-002", amount: 450, currency: "PEN",
    payment_method: "TRANSFERENCIA", type: "INSTALLMENTS", payment_status: "PENDING", payment_date: "2024-06-25 09:15",
    transaccion_id: "TRF-0042819200", receipt: null,
    client: { name: "Ana Mendoza", email: "a.mendoza@email.com", phone: "+51 912 345 678" },
  },
  "PAY-003": {
    id: "PAY-003", order_id: "ORD-003", amount: 2100, currency: "PEN",
    payment_method: "POS", type: "FULL", payment_status: "FAILED", payment_date: "2024-06-22 17:45",
    transaccion_id: "POS-5539281746", receipt: null,
    client: { name: "Roberto Sánchez", email: "r.sanchez@email.com", phone: "+51 945 678 901" },
  },
  "PAY-004": {
    id: "PAY-004", order_id: "ORD-002", amount: 500, currency: "PEN",
    payment_method: "EFECTIVO", type: "INSTALLMENTS", payment_status: "REFUNDED", payment_date: "2024-06-20 11:00",
    transaccion_id: "EFE-0000000000", receipt: "/placeholder.svg",
    client: { name: "Lucía Paredes", email: "l.paredes@email.com", phone: "+51 956 789 012" },
  },
};

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const payment = paymentsData[id || ""] || paymentsData["PAY-001"];
  const statusInfo = statusConfig[payment.payment_status];
  const hasReceipt = !!payment.receipt;

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
    toast({ title: "Comprobante adjuntado", description: file.name });
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
            <Edit size={16} className="mr-1" /> Editar Transacción
          </Button>
          {payment.payment_status !== "CONFIRMED" && (
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <CheckCircle2 size={16} className="mr-1" /> Validar Pago
            </Button>
          )}
          <Button variant="destructive" size="sm">
            <XCircle size={16} className="mr-1" /> {payment.payment_status === "CONFIRMED" ? "Reembolsar" : "Marcar Fallido"}
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
                  S/ {payment.amount.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Moneda: {payment.currency}</p>
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
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Tipo</p>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {payment.type === "FULL" ? "Pago Único" : "Cuota"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Fecha de Pago</p>
                  <p className="text-foreground">{payment.payment_date}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">ID Transacción</p>
                  <p className="font-mono text-sm text-foreground">{payment.transaccion_id}</p>
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
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                  {payment.client.name.split(" ").map((n: string) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{payment.client.name}</p>
                  <p className="text-sm text-muted-foreground">{payment.client.email} • {payment.client.phone}</p>
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
              {hasReceipt || uploadedFile ? (
                <div className="space-y-4">
                  {/* Preview */}
                  <div className="rounded-lg border border-border bg-muted/50 overflow-hidden">
                    {uploadedFile ? (
                      <div className="flex flex-col items-center justify-center p-8">
                        <FileText size={48} className="text-primary/40 mb-2" />
                        <p className="font-semibold text-foreground text-sm">{uploadedFile.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    ) : (
                      <img
                        src={payment.receipt}
                        alt="Comprobante"
                        className="w-full h-64 object-cover"
                      />
                    )}
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download size={14} className="mr-1" /> Descargar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => { setUploadedFile(null); fileInputRef.current?.click(); }}
                    >
                      <RefreshCw size={14} className="mr-1" /> Reemplazar
                    </Button>
                  </div>
                </div>
              ) : (
                /* Upload Zone */
                <div
                  className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground hover:bg-muted/50"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <Upload size={40} className="mx-auto text-muted-foreground mb-3" />
                  <p className="font-semibold text-foreground text-sm">
                    Haz clic o arrastra el comprobante
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG o PDF. Máx 5MB</p>
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

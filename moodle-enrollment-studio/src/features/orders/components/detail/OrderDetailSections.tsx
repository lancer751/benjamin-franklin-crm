import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  Copy,
  CreditCard,
  Edit,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  MoreHorizontal,
  Package,
  ReceiptText,
  ShieldCheck,
  User,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/core/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { cn } from "@/core/lib/utils";
import { formatPEN } from "../orderDisplay";
import type { OrderPayment, OrderResponse } from "../../types";
import {
  canManageOrders,
  canRegisterOrderPayment,
  confirmedPaymentsTotal,
  formatOrderDate,
  fullName,
  installmentStatusLabels,
  orderBalance,
  orderStatusLabels,
  orderStatusStyles,
  paymentMethodLabels,
  paymentStatusLabels,
  paymentTypeLabels,
  planStatusLabels,
} from "./orderDetailUtils";

interface OrderDetailHeaderProps {
  order: OrderResponse;
  role?: string;
  onBack: () => void;
  onEdit: () => void;
  onRegisterPayment: () => void;
}

export function OrderDetailHeader({
  order,
  role,
  onBack,
  onEdit,
  onRegisterPayment,
}: OrderDetailHeaderProps) {
  const canEdit = canManageOrders(role);
  const canPay = canRegisterOrderPayment(order, role);
  const updatedDiffers = order.updated_at !== order.created_at;

  const actions = (
    <>
      {canEdit && (
        <Button type="button" variant="outline" onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      )}
      {canPay && (
        <Button type="button" onClick={onRegisterPayment}>
          <CreditCard className="mr-2 h-4 w-4" />
          Registrar pago
        </Button>
      )}
    </>
  );

  return (
    <header className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label="Volver a órdenes"
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Orden {order.order_code}
              </h1>
              <Badge
                variant="outline"
                className={orderStatusStyles[order.order_status]}
              >
                {orderStatusLabels[order.order_status]}
              </Badge>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                Creada el {formatOrderDate(order.created_at, true)}
              </span>
              {updatedDiffers && (
                <span>
                  Actualizada el {formatOrderDate(order.updated_at, true)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="hidden shrink-0 gap-2 sm:flex">{actions}</div>
        {(canEdit || canPay) && (
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" className="w-full">
                  <MoreHorizontal className="mr-2 h-4 w-4" />
                  Acciones
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {canEdit && (
                  <DropdownMenuItem onSelect={onEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                )}
                {canPay && (
                  <DropdownMenuItem onSelect={onRegisterPayment}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Registrar pago
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}

function DetailLine({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="break-words text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

export function OrderCustomerCard({ order }: { order: OrderResponse }) {
  const lead = order.lead;
  const name = fullName(lead) || "Prospecto sin nombre";

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-5 w-5 text-primary" />
          Cliente / prospecto
        </CardTitle>
        <CardDescription>Información asociada a la orden</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-lg font-semibold">{name}</p>
          {lead.lead_status && (
            <Badge variant="outline">
              {lead.lead_status === "ACTIVE" ? "Activo" : "Inactivo"}
            </Badge>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <DetailLine
            icon={<Mail className="h-4 w-4" />}
            label="Correo"
            value={lead.email || "No registrado"}
          />
          {lead.profession && (
            <DetailLine
              icon={<BriefcaseBusiness className="h-4 w-4" />}
              label="Profesión"
              value={lead.profession}
            />
          )}
          {lead.dni && (
            <DetailLine
              icon={<FileText className="h-4 w-4" />}
              label="DNI"
              value={lead.dni}
            />
          )}
          {lead.gender && (
            <DetailLine
              icon={<User className="h-4 w-4" />}
              label="Género"
              value={lead.gender}
            />
          )}
          {lead.address && (
            <DetailLine
              icon={<MapPin className="h-4 w-4" />}
              label="Dirección"
              value={lead.address}
            />
          )}
          {lead.created_at && (
            <DetailLine
              icon={<CalendarDays className="h-4 w-4" />}
              label="Prospecto creado"
              value={formatOrderDate(lead.created_at)}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function OrderSellerCard({ order }: { order: OrderResponse }) {
  const seller = order.seller;
  if (!seller?.user) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Asesor comercial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium">Orden generada por el sistema</p>
        </CardContent>
      </Card>
    );
  }

  const name = fullName(seller.user) || "Asesor sin nombre";
  const initials = [seller.user.first_name?.[0], seller.user.last_name?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();
  const metrics = [
    ["Meta comercial", seller.sales_target],
    ["Total de órdenes", seller.total_orders],
    ["Completadas", seller.completed_orders],
    ["Canceladas", seller.canceled_orders],
  ].filter((metric): metric is [string, number] => typeof metric[1] === "number");

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Asesor comercial
        </CardTitle>
        <CardDescription>Asesor que generó la orden</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
            {initials || "AC"}
          </div>
          <div className="min-w-0">
            <p className="font-semibold">{name}</p>
            <p className="break-words text-sm text-muted-foreground">
              {seller.user.corporate_email ||
                seller.user.email ||
                "Correo no registrado"}
            </p>
            {typeof seller.user.is_active === "boolean" && (
              <p className="mt-1 text-xs text-muted-foreground">
                {seller.user.is_active ? "Usuario activo" : "Usuario inactivo"}
              </p>
            )}
          </div>
        </div>
        {metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {metrics.map(([label, value]) => (
              <div key={label} className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 font-semibold">{value}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function OrderProductsCard({ order }: { order: OrderResponse }) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Package className="h-5 w-5 text-primary" />
          Productos de la orden
        </CardTitle>
        <CardDescription>
          {order.orderDetails.length}{" "}
          {order.orderDetails.length === 1 ? "producto" : "productos"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {order.orderDetails.map((detail) => {
          const product = detail.product;
          const hasInstallmentRange =
            typeof product.installments_min_number === "number" &&
            typeof product.installments_max_number === "number";
          return (
            <article
              key={detail.id}
              className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row"
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt=""
                  className="h-24 w-full rounded-lg object-cover sm:h-20 sm:w-28"
                />
              ) : (
                <div className="flex h-20 w-full shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground sm:w-28">
                  <Package className="h-7 w-7" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold leading-snug">{product.name}</h3>
                    {product.short_description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {product.short_description}
                      </p>
                    )}
                  </div>
                  <p className="shrink-0 text-lg font-bold">
                    {formatPEN(detail.price)}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {product.sales_status && (
                    <Badge variant="outline">
                      Comercial: {product.sales_status}
                    </Badge>
                  )}
                  {product.pricing_status && (
                    <Badge variant="outline">
                      Pricing: {product.pricing_status}
                    </Badge>
                  )}
                  {hasInstallmentRange && (
                    <span className="text-xs text-muted-foreground">
                      Permite de {product.installments_min_number} a{" "}
                      {product.installments_max_number} cuotas
                    </span>
                  )}
                </div>
                {(detail.discount_code || product.brochure_url) && (
                  <div className="mt-3 flex flex-wrap gap-4 text-sm">
                    {detail.discount_code && (
                      <span>
                        Código de descuento:{" "}
                        <strong>{detail.discount_code}</strong>
                      </span>
                    )}
                    {product.brochure_url && (
                      <a
                        href={product.brochure_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                      >
                        Ver brochure
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function OrderFinancialSummary({ order }: { order: OrderResponse }) {
  const paid = confirmedPaymentsTotal(order.payments);
  const balance = orderBalance(order);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <CircleDollarSign className="h-5 w-5 text-primary" />
          Resumen financiero
        </CardTitle>
        <CardDescription>Importes expresados en PEN</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <FinancialLine label="Subtotal" value={formatPEN(order.sub_total)} />
        <FinancialLine
          label="Descuento"
          value={`− ${formatPEN(order.discount || 0)}`}
        />
        <div className="border-t pt-3">
          <FinancialLine
            label="Total"
            value={formatPEN(order.total_amount)}
            emphasis
          />
        </div>
        <FinancialLine label="Total pagado" value={formatPEN(paid)} />
        <div className="rounded-lg bg-primary/5 p-3">
          <FinancialLine
            label="Saldo pendiente"
            value={formatPEN(balance)}
            emphasis
          />
        </div>
      </CardContent>
    </Card>
  );
}

function FinancialLine({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={cn(
          "text-sm text-muted-foreground",
          emphasis && "font-medium text-foreground",
        )}
      >
        {label}
      </span>
      <span className={cn("font-medium", emphasis && "text-lg font-bold")}>
        {value}
      </span>
    </div>
  );
}

function paymentStatusClass(status?: string) {
  if (status === "CONFIRMED") return "border-emerald-200 text-emerald-700";
  if (status === "FAILED") return "border-rose-200 text-rose-700";
  if (status === "REFUNDED") return "border-blue-200 text-blue-700";
  return "border-amber-200 text-amber-700";
}

export function OrderPaymentsHistory({ order }: { order: OrderResponse }) {
  const payments = order.payments ?? [];
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <ReceiptText className="h-5 w-5 text-primary" />
          Historial de pagos
        </CardTitle>
        <CardDescription>
          {payments.length} {payments.length === 1 ? "registro" : "registros"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <p className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
            Aún no se han registrado pagos para esta orden.
          </p>
        ) : (
          <div className="space-y-3">
            {payments.map((payment, index) => (
              <PaymentRow
                key={payment.id ?? `${payment.payment_date}-${index}`}
                payment={payment}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PaymentRow({ payment }: { payment: OrderPayment }) {
  return (
    <article className="rounded-xl border p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold">
            {formatPEN(payment.amount)}
            {payment.currency && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {payment.currency}
              </span>
            )}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {paymentMethodLabels[payment.payment_method] ??
              payment.payment_method}{" "}
            · {formatOrderDate(payment.payment_date, true)}
          </p>
        </div>
        {payment.payment_status && (
          <Badge
            variant="outline"
            className={paymentStatusClass(payment.payment_status)}
          >
            {paymentStatusLabels[payment.payment_status] ??
              payment.payment_status}
          </Badge>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
        {payment.type && (
          <span>{paymentTypeLabels[payment.type] ?? payment.type}</span>
        )}
        {payment.transaccion_id && (
          <span>Transacción: {payment.transaccion_id}</span>
        )}
        {payment.payment_receipt && (
          <a
            href={payment.payment_receipt}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            Ver comprobante
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </article>
  );
}

export function OrderPaymentPlanCard({ order }: { order: OrderResponse }) {
  const plans = order.paymentPlans ?? [];
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <WalletCards className="h-5 w-5 text-primary" />
          Plan de pagos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {plans.length === 0 ? (
          <p className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
            No existe un plan de pagos asociado.
          </p>
        ) : (
          <div className="space-y-4">
            {plans.map((plan, planIndex) => (
              <div
                key={plan.id ?? `${plan.start_date}-${planIndex}`}
                className="rounded-xl border p-4"
              >
                <div className="grid gap-3 sm:grid-cols-4">
                  <PlanValue label="Monto total" value={formatPEN(plan.total_amount)} />
                  <PlanValue label="Cuotas" value={String(plan.total_installments)} />
                  <PlanValue
                    label="Fecha de inicio"
                    value={formatOrderDate(plan.start_date)}
                  />
                  <PlanValue
                    label="Estado"
                    value={planStatusLabels[plan.status] ?? plan.status}
                  />
                </div>
                <div className="mt-4 space-y-2">
                  {plan.installments.map((installment) => (
                    <div
                      key={installment.id ?? installment.number}
                      className="grid gap-2 rounded-lg bg-muted/40 p-3 text-sm sm:grid-cols-[80px_1fr_auto_auto] sm:items-center"
                    >
                      <span className="font-medium">
                        Cuota {installment.number}
                      </span>
                      <span className="text-muted-foreground">
                        Vence {formatOrderDate(installment.due_date)}
                      </span>
                      <span className="font-semibold">
                        {formatPEN(installment.due_amount)}
                      </span>
                      <Badge variant="outline">
                        {installmentStatusLabels[installment.status] ??
                          installment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PlanValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

export function OrderAuditSection({ order }: { order: OrderResponse }) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="h-auto w-full justify-between rounded-lg px-5 py-4"
          >
            <span className="text-sm font-semibold">Información de auditoría</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                open && "rotate-180",
              )}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="grid gap-3 border-t pt-4 sm:grid-cols-2">
            <AuditValue label="ID de orden" value={order.id} />
            <AuditValue label="ID de prospecto" value={order.lead_id} />
            {order.generated_by && (
              <AuditValue label="Generada por" value={order.generated_by} />
            )}
            <AuditValue
              label="Fecha de creación"
              value={formatOrderDate(order.created_at, true)}
              copyable={false}
            />
            <AuditValue
              label="Última actualización"
              value={formatOrderDate(order.updated_at, true)}
              copyable={false}
            />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function AuditValue({
  label,
  value,
  copyable = true,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-lg bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate text-xs">{value}</code>
        {copyable && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            aria-label={`Copiar ${label}`}
            onClick={() => navigator.clipboard.writeText(value)}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

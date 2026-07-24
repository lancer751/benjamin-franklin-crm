import { AlertCircle, CalendarDays, CreditCard, RefreshCw } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Separator } from "@/core/components/ui/separator";
import { usePaymentForm } from "../hooks/usePaymentForm";
import { paymentMethods, paymentStatuses } from "../hooks/usePayments";
import type { PaymentMethod, PaymentStatus, PaymentType } from "../types";
import {
  paymentMethodLabels,
  paymentStatusLabels,
  paymentTypeLabels,
} from "../utils/paymentLogic";
import { formatPaymentMoney } from "../utils/paymentFormat";

interface PaymentFormProps {
  preselectedOrderId?: string | null;
}

export default function PaymentForm({
  preselectedOrderId,
}: PaymentFormProps) {
  const form = usePaymentForm(preselectedOrderId);
  const { values, selectedOrder } = form;
  const isInstallments = values.type === "INSTALLMENTS";
  const amount = Number(values.amount) || 0;
  const resultingBalance = Math.max(
    (selectedOrder?.remainingBalance ?? 0) -
      (values.paymentStatus === "CONFIRMED" ? amount : 0),
    0,
  );
  const fullIsPartial =
    values.type === "FULL" &&
    Boolean(selectedOrder) &&
    amount > 0 &&
    amount < (selectedOrder?.remainingBalance ?? 0);

  return (
    <form
      className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]"
      onSubmit={(event) => {
        event.preventDefault();
        form.submit();
      }}
    >
      <div className="space-y-6">
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold">Orden asociada</h2>
              <p className="text-sm text-muted-foreground">
                Busca por código, cliente o correo.
              </p>
            </div>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="order-search">Buscar orden</Label>
            <Input
              id="order-search"
              placeholder="Ej. REFTGEL o correo del cliente"
              value={form.orderSearch}
              onChange={(event) => form.setOrderSearch(event.target.value)}
            />
            <div className="max-h-56 overflow-y-auto rounded-lg border">
              {form.isLoadingOrders ? (
                <p className="p-4 text-sm text-muted-foreground">
                  Cargando órdenes...
                </p>
              ) : form.orders.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">
                  No se encontraron órdenes.
                </p>
              ) : (
                form.orders.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    className={`flex w-full items-center justify-between gap-4 border-b p-3 text-left text-sm last:border-0 hover:bg-muted/50 ${
                      values.orderId === order.id ? "bg-primary/5" : ""
                    }`}
                    onClick={() => form.selectOrder(order)}
                  >
                    <span>
                      <span className="block font-semibold">{order.code}</span>
                      <span className="block text-muted-foreground">
                        {order.clientName}
                        {order.clientEmail ? ` · ${order.clientEmail}` : ""}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-medium">
                        {formatPaymentMoney(order.remainingBalance)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {order.status}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
            {selectedOrder &&
              (selectedOrder.status === "CANCELLED" ||
                selectedOrder.status === "REFUNDED") && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  La orden está {selectedOrder.status.toLowerCase()}. El backend
                  decidirá si admite el pago.
                </p>
              )}
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-5 font-semibold">Datos del pago</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fecha de pago" htmlFor="payment-date">
              <Input
                id="payment-date"
                type="datetime-local"
                value={values.paymentDate}
                onChange={(event) =>
                  form.updateValue("paymentDate", event.target.value)
                }
              />
            </Field>
            <Field label="Monto" htmlFor="payment-amount">
              <Input
                id="payment-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={values.amount}
                onChange={(event) =>
                  form.updateValue("amount", event.target.value)
                }
              />
            </Field>
            <Field label="Método de pago" htmlFor="payment-method">
              <select
                id="payment-method"
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={values.paymentMethod}
                onChange={(event) =>
                  form.updateValue(
                    "paymentMethod",
                    event.target.value as PaymentMethod,
                  )
                }
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {paymentMethodLabels[method]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Estado" htmlFor="payment-status">
              <select
                id="payment-status"
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={values.paymentStatus}
                onChange={(event) =>
                  form.updateValue(
                    "paymentStatus",
                    event.target.value as PaymentStatus,
                  )
                }
              >
                {paymentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {paymentStatusLabels[status]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tipo de pago" htmlFor="payment-type">
              <select
                id="payment-type"
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={values.type}
                onChange={(event) =>
                  form.setPaymentType(event.target.value as PaymentType)
                }
              >
                {(["FULL", "INSTALLMENTS"] as PaymentType[]).map((type) => (
                  <option key={type} value={type}>
                    {paymentTypeLabels[type]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Moneda" htmlFor="payment-currency">
              <Input
                id="payment-currency"
                maxLength={3}
                value={values.currency}
                onChange={(event) =>
                  form.updateValue(
                    "currency",
                    event.target.value.toUpperCase(),
                  )
                }
              />
            </Field>
            <div className="sm:col-span-2">
              <Field
                label="Número de operación / transacción"
                htmlFor="transaction-id"
              >
                <Input
                  id="transaction-id"
                  value={values.transactionId}
                  onChange={(event) =>
                    form.updateValue("transactionId", event.target.value)
                  }
                />
              </Field>
            </div>
          </div>
          {fullIsPartial && (
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              El pago no cubrirá el saldo completo de la orden.
            </p>
          )}
        </section>

        {isInstallments && (
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">Plan de pagos</h2>
                <p className="text-sm text-muted-foreground">
                  La primera cuota debe coincidir con el pago inicial.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => form.regenerateInstallments()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerar
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Número de cuotas" htmlFor="installments-count">
                <Input
                  id="installments-count"
                  type="number"
                  min="1"
                  value={values.paymentPlan.totalInstallments}
                  onChange={(event) =>
                    form.regenerateInstallments(
                      values.paymentPlan.totalAmount,
                      event.target.value,
                      values.paymentPlan.startDate,
                    )
                  }
                />
              </Field>
              <Field label="Total del plan" htmlFor="plan-total">
                <Input
                  id="plan-total"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={values.paymentPlan.totalAmount}
                  onChange={(event) =>
                    form.regenerateInstallments(
                      event.target.value,
                      values.paymentPlan.totalInstallments,
                      values.paymentPlan.startDate,
                    )
                  }
                />
              </Field>
              <Field label="Fecha de inicio" htmlFor="plan-start-date">
                <Input
                  id="plan-start-date"
                  type="date"
                  value={values.paymentPlan.startDate}
                  onChange={(event) =>
                    form.regenerateInstallments(
                      values.paymentPlan.totalAmount,
                      values.paymentPlan.totalInstallments,
                      event.target.value,
                    )
                  }
                />
              </Field>
            </div>
            <Separator className="my-5" />
            <div className="space-y-3">
              {values.paymentPlan.scheduledPayments.map(
                (installment, index) => (
                  <div
                    key={installment.number}
                    className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[70px_1fr_1fr] sm:items-end"
                  >
                    <div>
                      <p className="text-xs text-muted-foreground">Cuota</p>
                      <p className="font-semibold">#{installment.number}</p>
                    </div>
                    <Field
                      label="Vencimiento"
                      htmlFor={`due-date-${installment.number}`}
                    >
                      <Input
                        id={`due-date-${installment.number}`}
                        type="date"
                        value={installment.dueDate}
                        onChange={(event) =>
                          form.updateInstallment(index, {
                            dueDate: event.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field
                      label="Monto"
                      htmlFor={`due-amount-${installment.number}`}
                    >
                      <Input
                        id={`due-amount-${installment.number}`}
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={installment.dueAmount}
                        onChange={(event) =>
                          form.updateInstallment(index, {
                            dueAmount: event.target.value,
                          })
                        }
                      />
                    </Field>
                  </div>
                ),
              )}
            </div>
          </section>
        )}

        {form.errors.length > 0 && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <AlertCircle className="h-4 w-4" />
              Revisa los siguientes datos
            </div>
            <ul className="list-disc space-y-1 pl-5">
              {form.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <aside className="xl:sticky xl:top-6 xl:self-start">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Resumen financiero</h2>
          </div>
          {selectedOrder ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Orden</p>
                <p className="font-semibold">{selectedOrder.code}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.clientName}
                </p>
              </div>
              <Separator />
              <SummaryRow
                label="Total de la orden"
                value={formatPaymentMoney(selectedOrder.totalAmount)}
              />
              <SummaryRow
                label="Total confirmado"
                value={formatPaymentMoney(selectedOrder.confirmedPaid)}
              />
              <SummaryRow
                label="Saldo disponible"
                value={formatPaymentMoney(selectedOrder.remainingBalance)}
              />
              <SummaryRow
                label="Monto del pago"
                value={formatPaymentMoney(amount, values.currency)}
              />
              <Separator />
              <SummaryRow
                label="Saldo resultante"
                value={formatPaymentMoney(resultingBalance)}
                emphasized
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Selecciona una orden para consultar su saldo.
            </p>
          )}
          <Button
            className="mt-6 w-full"
            type="submit"
            disabled={form.isSubmitting || !selectedOrder}
          >
            {form.isSubmitting ? "Registrando..." : "Registrar pago"}
          </Button>
        </div>
      </aside>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={emphasized ? "text-lg font-bold" : "font-medium"}>
        {value}
      </span>
    </div>
  );
}

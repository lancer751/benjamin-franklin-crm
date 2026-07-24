import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Controller } from "react-hook-form";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { useOrderForm } from "../hooks/useOrderForm";
import type {
  OrderFormValues,
  OrderProduct,
  OrderResponse,
} from "../types";
import { OrderItemsSection } from "./OrderItemsSection";
import { OrderLeadSection } from "./OrderLeadSection";
import { OrderStatusSection } from "./OrderStatusSection";
import { OrderSummary } from "./OrderSummary";

interface OrderFormProps {
  mode: "create" | "edit";
  initialValues?: OrderFormValues;
  order?: OrderResponse;
  products: OrderProduct[];
  itemsEditable?: boolean;
  limitation?: string;
  isSubmitting: boolean;
  submitError?: string;
  onSubmit: (values: OrderFormValues) => void | Promise<void>;
  onCancel: () => void;
}

export function OrderForm({
  mode,
  initialValues,
  order,
  products,
  itemsEditable = true,
  limitation,
  isSubmitting,
  submitError,
  onSubmit,
  onCancel,
}: OrderFormProps) {
  const controller = useOrderForm({
    mode,
    initialValues,
    products,
    itemsEditable,
  });
  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = controller.form;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
    >
      <div className="space-y-6">
        <OrderLeadSection
          mode={mode}
          control={control}
          orderLead={order?.lead}
        />

        <OrderItemsSection
          control={control}
          setValue={setValue}
          fields={controller.fields}
          products={products}
          itemsEditable={itemsEditable}
          limitation={limitation}
          existingDetails={order?.orderDetails}
          error={
            typeof errors.order_items?.message === "string"
              ? errors.order_items.message
              : undefined
          }
          onAdd={controller.appendItem}
          onRemove={controller.removeItem}
        />

        <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold">Descuento general</h2>
            <p className="text-sm text-muted-foreground">
              Se aplica sobre el subtotal completo de la orden.
            </p>
          </div>
          <Controller
            control={control}
            name="discount"
            render={({ field, fieldState }) => (
              <div className="max-w-sm space-y-2">
                <Label htmlFor="order-discount">Monto en soles</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    S/
                  </span>
                  <Input
                    {...field}
                    id="order-discount"
                    inputMode="decimal"
                    placeholder="0.00"
                    className="pl-9"
                    disabled={!itemsEditable}
                  />
                </div>
                {fieldState.error && (
                  <p className="text-sm font-medium text-destructive">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        </section>

        {mode === "edit" && <OrderStatusSection control={control} />}

        {submitError && (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={!controller.canSubmit || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {mode === "create" ? "Crear orden" : "Guardar cambios"}
          </Button>
        </div>
      </div>

      <OrderSummary
        {...controller.preview}
        serverValues={
          !itemsEditable && order
            ? {
                subtotal: order.sub_total,
                discount: order.discount || 0,
                total: order.total_amount,
              }
            : undefined
        }
      />
    </form>
  );
}

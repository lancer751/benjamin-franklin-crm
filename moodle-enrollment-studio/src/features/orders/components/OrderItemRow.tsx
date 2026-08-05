import { Trash2 } from "lucide-react";
import {
  useController,
  type Control,
  type UseFormSetValue,
} from "react-hook-form";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { SearchableCombobox } from "@/features/campaigns/components/SearchableCombobox";
import {
  findProductPrice,
  getAvailableAttendanceModes,
  orderItemAllowsInstallments,
} from "../services/orderMappers";
import type { OrderFormValues, OrderProduct } from "../types";
import { formatPEN, modeLabel } from "./orderDisplay";

interface OrderItemRowProps {
  index: number;
  control: Control<OrderFormValues>;
  setValue: UseFormSetValue<OrderFormValues>;
  products: OrderProduct[];
  onRemove: () => void;
}

export function OrderItemRow({
  index,
  control,
  setValue,
  products,
  onRemove,
}: OrderItemRowProps) {
  const productField = useController({
    control,
    name: `order_items.${index}.product_id`,
  });
  const modeField = useController({
    control,
    name: `order_items.${index}.attendance_mode`,
  });
  const paymentField = useController({
    control,
    name: `order_items.${index}.payment_modality`,
  });
  const codeField = useController({
    control,
    name: `order_items.${index}.discount_code`,
  });

  const modes = getAvailableAttendanceModes(products, productField.field.value);
  const price = findProductPrice(
    products,
    productField.field.value,
    modeField.field.value,
  );
  const selectedProduct = products.find((product) => product.id === productField.field.value);
  const allowsInstallments = orderItemAllowsInstallments(selectedProduct, price);
  const displayedPrice =
    paymentField.field.value === "INSTALLMENTS"
      ? price?.installment_price
      : price?.cash_price;
  const productOptions = products.map((product) => ({
    value: product.id,
    label: product.name,
    description: product.edition?.edition_code
      ? `Edición ${product.edition.edition_code}`
      : undefined,
    searchText: product.edition?.edition_code ?? "",
  }));

  return (
    <div className="rounded-xl border bg-background p-4" data-testid="order-item-row">
      <div className="grid gap-4 xl:grid-cols-[minmax(260px,2fr)_minmax(150px,0.9fr)_minmax(170px,1fr)_minmax(130px,0.7fr)_40px] xl:items-start">
        <div className="space-y-2">
          <Label>Producto</Label>
          <SearchableCombobox
            value={productField.field.value}
            options={productOptions}
            placeholder="Seleccionar producto"
            searchPlaceholder="Buscar producto..."
            emptyMessage="No hay productos disponibles."
            contentClassName="z-50 min-w-[min(420px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)]"
            optionLabelClassName="whitespace-normal break-words"
            onChange={(productId) => {
              productField.field.onChange(productId);
              const availableModes = getAvailableAttendanceModes(
                products,
                productId,
              );
              setValue(
                `order_items.${index}.attendance_mode`,
                availableModes.length === 1 ? availableModes[0] : "",
                { shouldDirty: true, shouldValidate: true },
              );
              setValue(`order_items.${index}.payment_modality`, "FULL", {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
          />
          {productField.fieldState.error && (
            <p className="text-sm font-medium text-destructive">
              {productField.fieldState.error.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`order-mode-${index}`}>Modalidad</Label>
          <Select
            value={modeField.field.value}
            onValueChange={(value) => {
              modeField.field.onChange(value);
              setValue(`order_items.${index}.payment_modality`, "FULL", {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            disabled={!productField.field.value}
          >
            <SelectTrigger
              id={`order-mode-${index}`}
              aria-invalid={Boolean(modeField.fieldState.error)}
            >
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {modes.map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {modeLabel(mode)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {modeField.fieldState.error && (
            <p className="text-sm font-medium text-destructive">
              {modeField.fieldState.error.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`order-payment-${index}`}>Forma de pago</Label>
          <Select
            value={paymentField.field.value}
            onValueChange={paymentField.field.onChange}
            disabled={!price}
          >
            <SelectTrigger
              id={`order-payment-${index}`}
              aria-invalid={Boolean(paymentField.fieldState.error)}
            >
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FULL">Pago completo</SelectItem>
              <SelectItem
                value="INSTALLMENTS"
                disabled={!allowsInstallments}
              >
                Pago en cuotas
              </SelectItem>
            </SelectContent>
          </Select>
          {paymentField.fieldState.error && (
            <p className="text-sm font-medium text-destructive">
              {paymentField.fieldState.error.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Precio</Label>
          <div className="flex h-10 items-center rounded-md border bg-muted/40 px-3 text-sm font-semibold">
            {displayedPrice != null ? formatPEN(displayedPrice) : "—"}
          </div>
          <p className="text-xs text-muted-foreground">Referencia</p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mt-7 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          aria-label={`Eliminar producto ${index + 1}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 border-t pt-4">
        <Label htmlFor={`order-code-${index}`}>Código de descuento</Label>
        <div className="mt-2 flex max-w-lg flex-col gap-2 sm:flex-row">
          <Input
            id={`order-code-${index}`}
            value={codeField.field.value ?? ""}
            onChange={(event) =>
              codeField.field.onChange(
                event.target.value.replace(/\s+/g, "").toUpperCase().slice(0, 7),
              )
            }
            placeholder="Ingresa 7 caracteres"
            maxLength={7}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => codeField.field.onBlur()}
            disabled={(codeField.field.value?.length ?? 0) !== 7}
          >
            Aplicar
          </Button>
        </div>
        {codeField.fieldState.error && (
          <p className="mt-2 text-sm font-medium text-destructive">
            {codeField.fieldState.error.message}
          </p>
        )}
      </div>
    </div>
  );
}

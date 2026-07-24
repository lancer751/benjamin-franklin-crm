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
  const productOptions = products.map((product) => ({
    value: product.id,
    label: product.name,
    description: product.edition?.edition_code
      ? `Edición ${product.edition.edition_code}`
      : undefined,
    searchText: product.edition?.edition_code ?? "",
  }));

  return (
    <div
      className="grid gap-4 rounded-xl border bg-background p-4 xl:grid-cols-[minmax(260px,2fr)_minmax(150px,0.9fr)_minmax(130px,0.7fr)_minmax(180px,1fr)_40px] xl:items-start"
      data-testid="order-item-row"
    >
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
          onValueChange={modeField.field.onChange}
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
        <Label>Precio</Label>
        <div className="flex h-10 items-center rounded-md border bg-muted/40 px-3 text-sm font-semibold">
          {price ? formatPEN(price.cash_price) : "—"}
        </div>
        <p className="text-xs text-muted-foreground">Referencia</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`order-code-${index}`}>Código de descuento</Label>
        <Input
          id={`order-code-${index}`}
          value={codeField.field.value ?? ""}
          onChange={(event) => codeField.field.onChange(event.target.value)}
          placeholder="Opcional"
          maxLength={7}
        />
        {codeField.fieldState.error && (
          <p className="text-sm font-medium text-destructive">
            {codeField.fieldState.error.message}
          </p>
        )}
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
  );
}

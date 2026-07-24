import { PackageOpen, Plus } from "lucide-react";
import type {
  Control,
  FieldArrayWithId,
  UseFormSetValue,
} from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/core/components/ui/alert";
import { Button } from "@/core/components/ui/button";
import type {
  OrderDetailResponse,
  OrderFormValues,
  OrderProduct,
} from "../types";
import { OrderItemRow } from "./OrderItemRow";
import { formatPEN } from "./orderDisplay";

interface OrderItemsSectionProps {
  control: Control<OrderFormValues>;
  setValue: UseFormSetValue<OrderFormValues>;
  fields: FieldArrayWithId<OrderFormValues, "order_items", "id">[];
  products: OrderProduct[];
  itemsEditable: boolean;
  limitation?: string;
  existingDetails?: OrderDetailResponse[];
  error?: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export function OrderItemsSection({
  control,
  setValue,
  fields,
  products,
  itemsEditable,
  limitation,
  existingDetails,
  error,
  onAdd,
  onRemove,
}: OrderItemsSectionProps) {
  return (
    <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Productos</h2>
          <p className="text-sm text-muted-foreground">
            Cada modalidad se ofrece únicamente cuando tiene un precio configurado.
          </p>
        </div>
        {itemsEditable && (
          <Button type="button" variant="outline" onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar producto
          </Button>
        )}
      </div>

      {!itemsEditable && limitation && (
        <Alert>
          <PackageOpen className="h-4 w-4" />
          <AlertTitle>Edición de productos no disponible</AlertTitle>
          <AlertDescription>{limitation}</AlertDescription>
        </Alert>
      )}

      {itemsEditable ? (
        fields.length > 0 ? (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <OrderItemRow
                key={field.id}
                index={index}
                control={control}
                setValue={setValue}
                products={products}
                onRemove={() => onRemove(index)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-xl border border-dashed px-4 py-10 text-center">
            <PackageOpen className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No hay productos en la orden</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Agrega al menos uno para continuar.
            </p>
            <Button type="button" className="mt-4" variant="outline" onClick={onAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar producto
            </Button>
          </div>
        )
      ) : (
        <div className="space-y-2">
          {existingDetails?.map((detail) => (
            <div
              key={detail.id}
              className="flex items-center justify-between gap-4 rounded-lg border p-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{detail.product.name}</p>
                {detail.discount_code && (
                  <p className="text-xs text-muted-foreground">
                    Código: {detail.discount_code}
                  </p>
                )}
              </div>
              <p className="shrink-0 font-semibold">{formatPEN(detail.price)}</p>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </section>
  );
}

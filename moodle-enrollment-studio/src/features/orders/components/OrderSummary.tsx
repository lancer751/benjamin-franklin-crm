import { Separator } from "@/core/components/ui/separator";
import { formatPEN } from "./orderDisplay";

interface OrderSummaryProps {
  subtotal: number;
  discount: number;
  total: number;
  serverValues?: {
    subtotal: string | number;
    discount: string | number;
    total: string | number;
  };
}

export function OrderSummary({
  subtotal,
  discount,
  total,
  serverValues,
}: OrderSummaryProps) {
  const values = serverValues
    ? {
        subtotal: Number(serverValues.subtotal),
        discount: Number(serverValues.discount),
        total: Number(serverValues.total),
      }
    : { subtotal, discount, total };

  return (
    <aside className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm lg:sticky lg:top-6">
      <div>
        <h2 className="text-lg font-semibold">Resumen económico</h2>
        <p className="text-sm text-muted-foreground">
          {serverValues
            ? "Importes confirmados por el servidor."
            : "Vista previa; el backend confirmará los importes."}
        </p>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatPEN(values.subtotal)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Descuento general</span>
          <span className="font-medium text-emerald-700">
            − {formatPEN(values.discount)}
          </span>
        </div>
        <Separator />
        <div className="flex items-end justify-between gap-4">
          <span className="font-semibold">Total estimado</span>
          <span className="text-2xl font-bold">{formatPEN(values.total)}</span>
        </div>
      </div>
    </aside>
  );
}

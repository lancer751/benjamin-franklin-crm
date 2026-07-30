import { Sparkles } from "lucide-react";
import { cn } from "@/core/lib/utils";

interface DiscountSectionProps {
  form: {
    discount_price: number | null;
    discount_expires_at: string | null;
  };
  errors: Record<string, string>;
  setFieldValue: (key: string, value: any) => void;
}

const DiscountSection = ({ form, errors, setFieldValue }: DiscountSectionProps) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles size={13} className="text-slate-500" />
        <h5 className="text-xs font-semibold text-slate-800">Promoción comercial</h5>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[9px] font-medium text-slate-500">
            Precio promocional (S/)
          </label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-400">
              S/
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              className={cn(
                "form-input h-9 rounded-lg border-slate-200 bg-white pl-7 text-xs",
                errors.discount_price && "border-destructive",
              )}
              placeholder="0.00"
              value={form.discount_price ?? ""}
              onChange={(event) =>
                setFieldValue(
                  "discount_price",
                  event.target.value === "" ? null : Number(event.target.value),
                )
              }
            />
          </div>
          {errors.discount_price && (
            <p className="mt-0.5 text-[9px] leading-tight text-destructive">{errors.discount_price}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-[9px] font-medium text-slate-500">
            Fecha de vencimiento
          </label>
          <input
            type="date"
            className={cn(
              "form-input h-9 rounded-lg border-slate-200 bg-white text-xs",
              errors.discount_expires_at && "border-destructive",
            )}
            value={form.discount_expires_at ?? ""}
            onChange={(event) =>
              setFieldValue("discount_expires_at", event.target.value || null)
            }
          />
          {errors.discount_expires_at && (
            <p className="mt-0.5 text-[9px] leading-tight text-destructive">{errors.discount_expires_at}</p>
          )}
        </div>
      </div>

      <p className="mt-2 text-[9px] leading-tight text-slate-500">
        El precio promocional es opcional y se aplicará hasta la fecha indicada.
        {!form.discount_expires_at && (
          <> Sin fecha, permanecerá vigente hasta que sea actualizado manualmente.</>
        )}
      </p>
    </section>
  );
};

export default DiscountSection;

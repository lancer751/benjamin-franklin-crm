import { Sparkles } from "lucide-react";
import { cn } from "@/core/lib/utils";

interface DiscountSectionProps {
  form: {
    discount_price?: string | null;
    discount_expires_at?: string | null;
  };
  errors: Record<string, string>;
  setFieldValue: (key: string, value: any) => void;
}

const DiscountSection = ({
  form,
  errors,
  setFieldValue,
}: DiscountSectionProps) => {
  return (
    <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10">
      <h5 className="font-semibold text-xs text-primary mb-3 flex items-center gap-2 uppercase tracking-wide">
        <Sparkles size={14} /> Campaña de Descuento Especial
      </h5>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label text-slate-700 text-xs font-semibold mb-1.5 block">Precio con Descuento (S/)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">S/</span>
            <input 
              type="text" 
              pattern="^\d+(\.\d{1,2})?$"
              className={cn("form-input pl-8 rounded-xl h-11 border-slate-200 bg-white", errors.discount_price && 'border-destructive')} 
              placeholder="0.00" 
              value={form.discount_price || ""} 
              onChange={(e) => setFieldValue("discount_price", e.target.value.replace(/[^0-9.]/g, ''))} 
            />
          </div>
          {errors.discount_price && <p className="text-destructive text-xs mt-1">{errors.discount_price}</p>}
        </div>
        <div>
          <label className="form-label text-slate-700 text-xs font-semibold mb-1.5 block">Fecha de Expiración</label>
          <input 
            type="date" 
            className={cn("form-input rounded-xl h-11 border-slate-200 bg-white", errors.discount_expires_at && 'border-destructive')} 
            value={form.discount_expires_at || ""} 
            onChange={(e) => setFieldValue("discount_expires_at", e.target.value)} 
          />
          {errors.discount_expires_at && <p className="text-destructive text-xs mt-1">{errors.discount_expires_at}</p>}
        </div>
      </div>
    </div>
  );
};

export default DiscountSection;

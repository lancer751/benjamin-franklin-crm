import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/core/components/ui/card";
import { DollarSign, Info } from "lucide-react";
import { cn } from "@/core/lib/utils";

interface PricingCardProps {
  form: {
    prices: any[];
    presale_price?: string | number | null;
    installments_min_number: number;
    installments_max_number: number;
  };
  errors: Record<string, string>;
  setFieldValue: (key: string, value: any) => void;
  setPriceValue: (index: number, key: string, value: string) => void;
  selectedEdition: any;
  isEdit: boolean;
}

const PricingCard = ({
  form,
  errors,
  setFieldValue,
  setPriceValue,
  selectedEdition,
  isEdit,
}: PricingCardProps) => {
  return (
    <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <DollarSign size={16} className="text-primary" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900">Precios y Financiamiento</CardTitle>
            <CardDescription className="text-xs">Establece los costos del programa académico.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        
        {/* PRECIO DE PREVENTA (OPCIONAL) */}
        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/50">
          <label className="text-amber-800 text-xs font-bold flex items-center gap-1.5 mb-2">
            Precio de Preventa (S/)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600/70 text-sm font-medium">S/</span>
            <input 
              type="text" 
              pattern="^\d+(\.\d{1,2})?$"
              className={cn("form-input pl-8 rounded-xl h-11 border-amber-200/70 bg-white focus:ring-amber-500", errors.presale_price && 'border-destructive')} 
              placeholder="0.00" 
              value={form.presale_price || ""} 
              onChange={(e) => setFieldValue("presale_price", e.target.value.replace(/[^0-9.]/g, ''))} 
            />
          </div>
          {errors.presale_price && <p className="text-destructive text-xs mt-1">{errors.presale_price}</p>}
          <p className="text-[9px] text-amber-700 mt-1.5 italic">* Opcional. Útil para lanzamientos anticipados.</p>
        </div>

        {!selectedEdition && !isEdit ? (
          <div className="flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200/80 rounded-2xl bg-slate-50/50 min-h-[220px] transition-all">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-3 text-amber-500 ring-4 ring-amber-100/50">
              <Info size={22} />
            </div>
            <h4 className="text-xs font-bold text-slate-700 mb-1">Precios por Modalidad Bloqueados</h4>
            <p className="text-[11px] text-muted-foreground max-w-[200px] leading-normal">
              Selecciona una Edición/Cohorte en el buscador para habilitar los campos de precios.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {form.prices.map((priceObj, index) => (
              <div key={index} className="p-4 border border-slate-100 rounded-xl bg-slate-50/60 space-y-4">
                <h4 className="font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider text-[10px]">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    priceObj.attendance_mode === "PRESENCIAL" ? "bg-orange-500" : "bg-blue-500"
                  )}></span>
                  Modalidad {priceObj.attendance_mode}
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 mb-1.5 block">Matrícula (S/)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">S/</span>
                      <input 
                        type="text" 
                        className={cn("form-input pl-8 rounded-xl h-10 bg-white text-sm border-slate-200", errors[`prices.${index}.enrollment_fee`] && 'border-destructive')} 
                        placeholder="0.00" 
                        value={priceObj.enrollment_fee} 
                        onChange={(e) => setPriceValue(index, "enrollment_fee", e.target.value)} 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 mb-1.5 block">Precio Contado (S/)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">S/</span>
                      <input 
                        type="text" 
                        className={cn("form-input pl-8 rounded-xl h-10 bg-white text-sm border-slate-200", errors[`prices.${index}.cash_price`] && 'border-destructive')} 
                        placeholder="0.00" 
                        value={priceObj.cash_price} 
                        onChange={(e) => setPriceValue(index, "cash_price", e.target.value)} 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 mb-1.5 block">Precio en Cuotas (S/)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">S/</span>
                      <input 
                        type="text" 
                        className={cn("form-input pl-8 rounded-xl h-10 bg-white text-sm border-slate-200", errors[`prices.${index}.installment_price`] && 'border-destructive')} 
                        placeholder="0.00" 
                        value={priceObj.installment_price} 
                        onChange={(e) => setPriceValue(index, "installment_price", e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* FINANCIAMIENTO GLOBAL */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-4">
              <h6 className="text-[10px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Info size={12} className="text-primary" /> Financiamiento
              </h6>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 mb-1 block">Mínimo Cuotas</label>
                  <input 
                    type="number" 
                    min="1" 
                    className={cn("form-input h-9 rounded-lg bg-white text-xs border-slate-200", errors.installments_min_number && 'border-destructive')} 
                    value={form.installments_min_number} 
                    onChange={(e) => setFieldValue("installments_min_number", Number(e.target.value))} 
                  />
                  {errors.installments_min_number && <p className="text-destructive text-[9px] mt-0.5">{errors.installments_min_number}</p>}
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 mb-1 block">Máximo Cuotas</label>
                  <input 
                    type="number" 
                    min="1" 
                    className={cn("form-input h-9 rounded-lg bg-white text-xs border-slate-200", errors.installments_max_number && 'border-destructive')} 
                    value={form.installments_max_number} 
                    onChange={(e) => setFieldValue("installments_max_number", Number(e.target.value))} 
                  />
                  {errors.installments_max_number && <p className="text-destructive text-[9px] mt-0.5">{errors.installments_max_number}</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PricingCard;

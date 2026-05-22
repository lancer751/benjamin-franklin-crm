import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/core/components/ui/card";
import { Checkbox } from "@/core/components/ui/checkbox";
import { Gift, Info } from "lucide-react";
import { cn } from "@/core/lib/utils";

interface BenefitsCardProps {
  availableBenefits: any[];
  isLoadingBenefits: boolean;
  benefitIds: string[];
  errors: Record<string, string>;
  onToggle: (id: string) => void;
}

const BenefitsCard = ({
  availableBenefits,
  isLoadingBenefits,
  benefitIds,
  errors,
  onToggle,
}: BenefitsCardProps) => {
  return (
    <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Gift size={16} className="text-primary" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900">Beneficios Comerciales del Curso Máster</CardTitle>
            <CardDescription className="text-xs">Selecciona los beneficios que recibirán los alumnos que adquieran este producto.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground italic mb-2">
            * El backend requiere la asignación de al menos un beneficio activo para habilitar la orden de compra.
          </p>
          {isLoadingBenefits ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/40 animate-pulse">
                  <div className="w-4.5 h-4.5 rounded bg-slate-200" />
                  <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : availableBenefits.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Info className="h-5 w-5 text-slate-400" />
              <p className="text-xs font-medium text-slate-400">No se encontraron beneficios disponibles.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableBenefits.map((benefit: any) => {
                const isChecked = benefitIds.includes(benefit.id);
                return (
                  <div 
                    key={benefit.id} 
                    onClick={() => onToggle(benefit.id)}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer select-none group",
                      isChecked 
                        ? "bg-primary/5 border-primary shadow-sm hover:bg-primary/[0.07]" 
                        : "bg-white border-slate-200 hover:bg-slate-50/80 hover:border-slate-300"
                    )}
                  >
                    <Checkbox 
                      id={benefit.id} 
                      checked={isChecked}
                      onCheckedChange={() => onToggle(benefit.id)}
                      className="mt-0.5 border-slate-300 data-[state=checked]:bg-primary transition-all group-hover:scale-105"
                    />
                    <div className="grid gap-1">
                      <label className="text-xs font-bold text-slate-900 cursor-pointer select-none">
                        {benefit.description || benefit.name}
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {errors.benefit_ids && (
            <p className="text-destructive text-xs mt-3 font-semibold flex items-center gap-1">
              <Info size={12} /> {errors.benefit_ids}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BenefitsCard;

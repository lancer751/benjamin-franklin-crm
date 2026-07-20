import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/core/components/ui/card";
import { Checkbox } from "@/core/components/ui/checkbox";
import { Input } from "@/core/components/ui/input";
import { Button } from "@/core/components/ui/button";
import { Gift, Info, Plus, Loader2, Trash2, Search } from "lucide-react";
import { cn } from "@/core/lib/utils";
import { createBenefit } from "../../services/benefitService";
import { toast } from "sonner";

interface BenefitsCardProps {
  availableBenefits: any[];
  isLoadingBenefits: boolean;
  benefitIds: string[];
  errors: Record<string, string>;
  onToggle: (id: string) => void;
  setFieldValue: (key: string, value: any) => void;
}

const BenefitsCard = ({
  availableBenefits,
  isLoadingBenefits,
  benefitIds,
  errors,
  onToggle,
  setFieldValue,
}: BenefitsCardProps) => {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBenefitText, setNewBenefitText] = useState("");
  const [hiddenBenefitIds, setHiddenBenefitIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const visibleBenefits = availableBenefits.filter((benefit: any) => {
    const text = `${benefit.description || ""} ${benefit.name || ""}`.toLowerCase();
    return !hiddenBenefitIds.includes(benefit.id) && text.includes(searchTerm.toLowerCase());
  });

  const addMutation = useMutation({
    mutationFn: (description: string) => createBenefit({ description }),
    onSuccess: (res: any) => {
      if (res?.success && res.data?.id) {
        const newId = res.data.id;
        // Agregar al array form.benefit_ids
        setFieldValue("benefit_ids", [...benefitIds, newId]);
        // Invalidar query "benefits" para refrescar el catálogo
        queryClient.invalidateQueries({ queryKey: ["benefits"] });
        toast.success("Beneficio creado y seleccionado automáticamente");
        setNewBenefitText("");
        setShowAddForm(false);
      } else {
        toast.error("Error al crear el beneficio");
      }
    },
    onError: () => {
      toast.error("Error al crear el beneficio");
    }
  });

  const handleSaveBenefit = () => {
    const trimmed = newBenefitText.trim();
    if (!trimmed) {
      toast.error("La descripción no puede estar vacía");
      return;
    }
    addMutation.mutate(trimmed);
  };

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
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar beneficios..." className="h-10 rounded-xl border-slate-200 pl-9 text-xs" />
          </div>
          {isLoadingBenefits ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/40 animate-pulse">
                  <div className="w-4.5 h-4.5 rounded bg-slate-200" />
                  <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : visibleBenefits.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Info className="h-5 w-5 text-slate-400" />
              <p className="text-xs font-medium text-slate-400">No hay beneficios visibles en la lista.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleBenefits.map((benefit: any) => {
                const isChecked = benefitIds.includes(benefit.id);
                return (
                  <div 
                    key={benefit.id} 
                    onClick={() => onToggle(benefit.id)}
                    className={cn(
                      "relative flex items-start gap-3 p-4 pr-9 rounded-xl border transition-all cursor-pointer select-none group",
                      isChecked 
                        ? "bg-primary/5 border-primary shadow-sm hover:bg-primary/[0.07]" 
                        : "bg-white border-slate-200 hover:bg-slate-50/80 hover:border-slate-300"
                    )}
                  >
                    <Checkbox 
                      id={benefit.id} 
                      checked={isChecked}
                      onCheckedChange={() => onToggle(benefit.id)}
                      onClick={(e) => e.stopPropagation()} // 👈 Detener propagación para evitar doble toggle
                      className="mt-0.5 border-slate-300 data-[state=checked]:bg-primary transition-all group-hover:scale-105"
                    />
                    <div className="grid gap-1">
                      <label className="text-xs font-bold text-slate-900 cursor-pointer select-none">
                        {benefit.description || benefit.name}
                      </label>
                    </div>
                    {/* Botón de Eliminación Puramente Visual (Sin HTTP req) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        // 1. Remover del array de benefit_ids
                        setFieldValue("benefit_ids", benefitIds.filter(id => id !== benefit.id));
                        // 2. Ocultar visualmente
                        setHiddenBenefitIds(prev => [...prev, benefit.id]);
                      }}
                      className="absolute top-2 right-2 p-1 rounded-lg text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-200"
                      title="Eliminar visualmente de este producto"
                    >
                      <Trash2 size={13} />
                    </button>
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

          {/* Sección para añadir beneficio en caliente */}
          <div className="border-t border-slate-100 pt-4 mt-6">
            {!showAddForm ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl border-dashed border-2 hover:border-primary/50 text-slate-500 hover:text-primary gap-1.5 py-2.5 h-auto text-xs font-semibold"
                onClick={() => setShowAddForm(true)}
              >
                <Plus size={14} /> Añadir Beneficio Personalizado
              </Button>
            ) : (
              <div className="space-y-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/30 max-w-md animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Nuevo Beneficio
                  </label>
                  <Input
                    type="text"
                    className="rounded-xl h-10 border-slate-200 text-xs font-medium placeholder:text-slate-400 bg-white"
                    placeholder="Ej. Acceso de por vida a los laboratorios de cómputo..."
                    value={newBenefitText}
                    onChange={(e) => setNewBenefitText(e.target.value)}
                    disabled={addMutation.isPending}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-xl text-xs bg-primary hover:bg-primary/95 text-white font-semibold gap-1 px-3"
                    onClick={handleSaveBenefit}
                    disabled={addMutation.isPending}
                  >
                    {addMutation.isPending ? (
                      <>
                        <Loader2 size={12} className="animate-spin" /> Guardando...
                      </>
                    ) : (
                      "Guardar"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs border-slate-200 text-slate-600 hover:bg-slate-50"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewBenefitText("");
                    }}
                    disabled={addMutation.isPending}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>

        </div>
      </CardContent>
    </Card>
  );
};

export default BenefitsCard;

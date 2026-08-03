import { AlertCircle, Check, Circle, Clock3 } from "lucide-react";
import { cn } from "@/core/lib/utils";
import type { ProductFormStepId } from "../../utils/productFormRequirements";

export interface ProductFormStep {
  id: ProductFormStepId;
  label: string;
  description: string;
}

interface ProductFormStepperProps {
  steps: ProductFormStep[];
  activeStep: ProductFormStepId;
  states: Record<ProductFormStepId, "complete" | "pending" | "not-started" | "error">;
  onStepChange: (step: ProductFormStepId) => void;
}

const stateMeta = {
  complete: { label: "Completado", icon: Check, className: "bg-emerald-500 text-white border-emerald-500" },
  pending: { label: "Pendiente", icon: Clock3, className: "bg-amber-50 text-amber-700 border-amber-300" },
  "not-started": { label: "No iniciado", icon: Circle, className: "bg-white text-slate-400 border-slate-200" },
  error: { label: "Con errores", icon: AlertCircle, className: "bg-red-50 text-red-600 border-red-300" },
};

const ProductFormStepper = ({ steps, activeStep, states, onStepChange }: ProductFormStepperProps) => (
  <nav aria-label="Progreso del producto" className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
    <ol className="grid grid-cols-1 gap-1 sm:grid-cols-2 xl:grid-cols-4">
      {steps.map((step, index) => {
        const state = states[step.id];
        const meta = stateMeta[state];
        const Icon = meta.icon;
        const active = activeStep === step.id;
        return (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => onStepChange(step.id)}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                active ? "bg-primary/5 ring-1 ring-primary/20" : "hover:bg-slate-50",
              )}
            >
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full border", meta.className)}>
                {active && state === "not-started" ? <span className="text-xs font-bold">{index + 1}</span> : <Icon size={15} />}
              </span>
              <span className="min-w-0">
                <span className={cn("block text-xs font-bold", active ? "text-primary" : "text-slate-800")}>{step.label}</span>
                <span className="block truncate text-[10px] font-medium text-slate-400">{meta.label}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  </nav>
);

export default ProductFormStepper;

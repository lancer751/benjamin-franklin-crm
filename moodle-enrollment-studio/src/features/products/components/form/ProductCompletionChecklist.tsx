import { AlertCircle, CheckCircle2, Circle, MinusCircle } from "lucide-react";
import type { ProductRequirement } from "../../utils/productFormRequirements";

interface ProductCompletionChecklistProps {
  items: ProductRequirement[];
}

const meta = {
  complete: { icon: CheckCircle2, label: "Completado", className: "text-emerald-600" },
  pending: { icon: Circle, label: "Pendiente", className: "text-amber-600" },
  error: { icon: AlertCircle, label: "Error", className: "text-red-600" },
  optional: { icon: MinusCircle, label: "Opcional", className: "text-slate-400" },
};

const ProductCompletionChecklist = ({ items }: ProductCompletionChecklistProps) => (
  <ul className="space-y-2.5">
    {items.map((item) => {
      const config = meta[item.state];
      const Icon = config.icon;
      return <li key={item.id} className="flex items-center gap-2 text-xs"><Icon size={16} className={config.className} /><span className="text-slate-700">{item.label}</span><span className={`ml-auto text-[10px] font-semibold ${config.className}`}>{config.label}</span></li>;
    })}
  </ul>
);

export default ProductCompletionChecklist;

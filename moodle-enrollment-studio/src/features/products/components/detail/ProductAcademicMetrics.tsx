import { BookOpen, CalendarCheck2, Clock3, Timer } from "lucide-react";
import type { UIProduct } from "../../types/product.types";
import { getDurationUnitLabel } from "../../utils/productDetailPresentation.utils";

interface ProductAcademicMetricsProps {
  product: UIProduct;
  formatDate: (date?: string | null, format?: string) => string;
}

const ProductAcademicMetrics = ({ product, formatDate }: ProductAcademicMetricsProps) => {
  const edition = product.edition;
  const metrics = [
    {
      label: "Fecha de finalización",
      value: formatDate(edition?.end_date, "PPP"),
      icon: CalendarCheck2,
    },
    {
      label: "Duración",
      value: edition?.duration_value != null
        ? `${edition.duration_value} ${getDurationUnitLabel(edition.duration_unit)}`
        : "No definida",
      icon: Clock3,
    },
    {
      label: "Clases",
      value: edition?.classes_number != null ? `${edition.classes_number}` : "No definidas",
      icon: BookOpen,
    },
    {
      label: "Horas académicas",
      value: edition?.hours_amount != null ? `${edition.hours_amount} horas` : "No definidas",
      icon: Timer,
    },
  ];

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold text-slate-900">Detalles académicos</h2>
      <div className="grid gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Icon size={16} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
              <p className="mt-1 text-sm font-bold leading-snug text-slate-800">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductAcademicMetrics;

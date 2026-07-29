import { BookOpen, CalendarDays, Clock3, GraduationCap, Layers3, Timer } from "lucide-react";
import { Card } from "@/core/components/ui/card";
import type { UIProduct } from "../../types/product.types";
import {
  getDurationUnitLabel,
  getEditionStatusLabel,
  getModalityLabel,
} from "../../utils/productDetailPresentation.utils";

interface ProductAcademicSummaryProps {
  product: UIProduct;
  formatDate: (date?: string | null, format?: string) => string;
  compact?: boolean;
}

const ProductAcademicSummary = ({ product, formatDate, compact = false }: ProductAcademicSummaryProps) => {
  const edition = product.edition;
  const fields = [
    { label: "Modalidad", value: getModalityLabel(edition?.modality), icon: Layers3 },
    { label: "Estado de edición", value: getEditionStatusLabel(edition?.edition_status), icon: GraduationCap },
    { label: "Fecha de inicio", value: formatDate(edition?.start_date, "PPP"), icon: CalendarDays },
    { label: "Fecha de finalización", value: formatDate(edition?.end_date, "PPP"), icon: CalendarDays },
    {
      label: "Duración",
      value: edition?.duration_value != null
        ? `${edition.duration_value} ${getDurationUnitLabel(edition.duration_unit)}`
        : "No definida",
      icon: Clock3,
    },
    { label: "Clases", value: edition?.classes_number != null ? `${edition.classes_number}` : "No definidas", icon: BookOpen },
    { label: "Horas académicas", value: edition?.hours_amount != null ? `${edition.hours_amount} horas` : "No definidas", icon: Timer },
    { label: "Curso vinculado", value: edition?.course?.name || "No disponible", icon: BookOpen },
    { label: "Edición", value: edition?.edition_number != null ? `Edición #${edition.edition_number}` : "No definida", icon: GraduationCap },
    { label: "Código", value: edition?.edition_code || "No definido", icon: Layers3 },
  ];

  return (
    <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">Información académica</h2>
        <p className="mt-0.5 text-xs text-slate-500">Datos clave de la edición vinculada al producto.</p>
      </div>
      <div className={`grid gap-3 p-5 ${compact ? "sm:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
        {fields.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-100 bg-white p-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Icon size={15} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
              <p className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ProductAcademicSummary;

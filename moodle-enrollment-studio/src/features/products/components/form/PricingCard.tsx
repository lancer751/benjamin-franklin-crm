import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  DollarSign,
  Info,
  MapPin,
  Monitor,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card";
import { cn } from "@/core/lib/utils";
import DiscountSection from "./DiscountSection";

interface PricingCardProps {
  form: {
    prices: any[];
    discount_price: number | null;
    discount_expires_at: string | null;
    installments_min_number: number;
    installments_max_number: number;
    pricing_status: "VALID" | "INVALID";
  };
  errors: Record<string, string>;
  setFieldValue: (key: string, value: any) => void;
  setPriceValue: (index: number, key: string, value: string) => void;
  selectedEdition: any;
  isEdit: boolean;
}

const priceFields = [
  { key: "cash_price", label: "Precio contado" },
  { key: "installment_price", label: "Precio en cuotas" },
  { key: "enrollment_fee", label: "Matrícula" },
] as const;

const getModalityPresentation = (mode: string) => {
  if (mode === "VIRTUAL") {
    return {
      label: "Virtual",
      icon: Monitor,
      iconClassName: "text-blue-600",
      badgeClassName: "border-blue-100 bg-blue-50 text-blue-700",
    };
  }

  if (mode === "PRESENCIAL") {
    return {
      label: "Presencial",
      icon: MapPin,
      iconClassName: "text-orange-600",
      badgeClassName: "border-orange-100 bg-orange-50 text-orange-700",
    };
  }

  return {
    label: "Modalidad",
    icon: Monitor,
    iconClassName: "text-slate-600",
    badgeClassName: "border-slate-200 bg-slate-50 text-slate-700",
  };
};

const isModalityConfigured = (price: any, index: number, errors: Record<string, string>) => {
  const cashPrice = Number(price.cash_price);
  const installmentPrice = Number(price.installment_price);
  const enrollmentFee = Number(price.enrollment_fee);
  const hasFieldErrors = priceFields.some(({ key }) => errors[`prices.${index}.${key}`]);

  return (
    !hasFieldErrors &&
    Number.isFinite(cashPrice) &&
    cashPrice > 0 &&
    Number.isFinite(installmentPrice) &&
    installmentPrice > 0 &&
    Number.isFinite(enrollmentFee) &&
    enrollmentFee >= 0
  );
};

const PriceInput = ({
  error,
  value,
  onChange,
}: {
  error?: string;
  value: string | number;
  onChange: (value: string) => void;
}) => (
  <div className="min-w-0">
    <div className="relative">
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-400">
        S/
      </span>
      <input
        type="text"
        inputMode="decimal"
        className={cn(
          "form-input h-9 w-full min-w-0 rounded-lg border-slate-200 bg-white pl-7 pr-2 text-xs",
          error && "border-destructive",
        )}
        placeholder="0.00"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
    {error && <p className="mt-0.5 text-[9px] leading-tight text-destructive">{error}</p>}
  </div>
);

const PricingCard = ({
  form,
  errors,
  setFieldValue,
  setPriceValue,
  selectedEdition,
  isEdit,
}: PricingCardProps) => {
  const isHybrid = form.prices.length > 1;

  return (
    <Card className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm transition-colors hover:border-slate-300">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
              <DollarSign size={16} className="text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-slate-900">
                Precios y Financiamiento
              </CardTitle>
              <CardDescription className="text-xs">
                Configuración comercial del producto.
              </CardDescription>
            </div>
          </div>
          <span
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-semibold",
              form.pricing_status === "VALID"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700",
            )}
          >
            {form.pricing_status === "VALID" ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
            {form.pricing_status === "VALID" ? "Precios válidos" : "Revisar precios"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        <DiscountSection form={form} errors={errors} setFieldValue={setFieldValue} />

        <section className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h5 className="text-xs font-semibold text-slate-800">Configuración de modalidades</h5>
              {isHybrid && (
                <p className="mt-0.5 text-[10px] text-slate-500">Comparación de precios por modalidad</p>
              )}
            </div>
            {isHybrid && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-semibold text-slate-600">
                Híbrida
              </span>
            )}
          </div>

          {!selectedEdition && !isEdit ? (
            <div className="flex min-h-20 items-center gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-3">
              <Info size={17} className="shrink-0 text-slate-400" />
              <p className="text-[11px] leading-relaxed text-slate-500">
                Selecciona una edición para habilitar sus precios.
              </p>
            </div>
          ) : isHybrid ? (
            <div className="min-w-0">
              <div
                className="grid w-full min-w-0 items-start gap-x-2 gap-y-2"
                style={{
                  gridTemplateColumns: `minmax(68px, .7fr) repeat(${form.prices.length}, minmax(0, 1fr))`,
                }}
              >
                <div />
                {form.prices.map((price, index) => {
                  const presentation = getModalityPresentation(price.attendance_mode);
                  const ModalityIcon = presentation.icon;
                  const configured = isModalityConfigured(price, index, errors);

                  return (
                    <div
                      key={price.attendance_mode}
                      className={cn(
                        "flex min-w-0 items-center justify-between gap-1 rounded-lg border px-2 py-1.5",
                        presentation.badgeClassName,
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-1.5 text-[10px] font-semibold">
                        <ModalityIcon size={12} className={presentation.iconClassName} />
                        {presentation.label}
                      </span>
                      {configured ? (
                        <CheckCircle2 size={13} className="shrink-0 text-emerald-600" aria-label="Configuración completa" />
                      ) : (
                        <Circle size={12} className="shrink-0 text-slate-300" aria-label="Configuración pendiente" />
                      )}
                    </div>
                  );
                })}

                {priceFields.map(({ key, label }) => (
                  <div className="contents" key={key}>
                    <label className="self-center text-[10px] font-medium leading-tight text-slate-500">
                      {label}
                    </label>
                    {form.prices.map((price, index) => (
                      <PriceInput
                        key={`${price.attendance_mode}-${key}`}
                        error={errors[`prices.${index}.${key}`]}
                        value={price[key]}
                        onChange={(value) => setPriceValue(index, key, value)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            form.prices.map((price, index) => {
              const presentation = getModalityPresentation(price.attendance_mode);
              const ModalityIcon = presentation.icon;
              const configured = isModalityConfigured(price, index, errors);

              return (
                <div key={price.attendance_mode} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className={cn("flex items-center gap-1.5 text-[10px] font-semibold", presentation.iconClassName)}>
                      <ModalityIcon size={13} />
                      {presentation.label}
                    </span>
                    <span className={cn("flex items-center gap-1 text-[9px] font-medium", configured ? "text-emerald-600" : "text-slate-400")}>
                      {configured ? <CheckCircle2 size={12} /> : <Circle size={11} />}
                      {configured ? "Completa" : "Pendiente"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {priceFields.map(({ key, label }) => (
                      <div key={key}>
                        <label className="mb-1 block text-[9px] font-medium text-slate-500">{label}</label>
                        <PriceInput
                          error={errors[`prices.${index}.${key}`]}
                          value={price[key]}
                          onChange={(value) => setPriceValue(index, key, value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
          <h5 className="mb-2 text-xs font-semibold text-slate-800">Financiamiento</h5>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[9px] font-medium text-slate-500">Mínimo cuotas</label>
              <input
                type="number"
                min="1"
                className={cn(
                  "form-input h-9 rounded-lg border-slate-200 bg-white text-xs",
                  errors.installments_min_number && "border-destructive",
                )}
                value={form.installments_min_number}
                onChange={(event) => setFieldValue("installments_min_number", Number(event.target.value))}
              />
              {errors.installments_min_number && (
                <p className="mt-0.5 text-[9px] text-destructive">{errors.installments_min_number}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-[9px] font-medium text-slate-500">Máximo cuotas</label>
              <input
                type="number"
                min="1"
                className={cn(
                  "form-input h-9 rounded-lg border-slate-200 bg-white text-xs",
                  errors.installments_max_number && "border-destructive",
                )}
                value={form.installments_max_number}
                onChange={(event) => setFieldValue("installments_max_number", Number(event.target.value))}
              />
              {errors.installments_max_number && (
                <p className="mt-0.5 text-[9px] text-destructive">{errors.installments_max_number}</p>
              )}
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  );
};

export default PricingCard;

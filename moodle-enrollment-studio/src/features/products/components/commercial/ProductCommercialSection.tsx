import { AlertTriangle, PackageOpen, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card";
import { cn } from "@/core/lib/utils";
import AcademicDetailsCard from "../form/AcademicDetailsCard";
import PricingCard from "../form/PricingCard";
import type { ProductFormValues } from "../../schemas";
import { CategorySelect } from "../categories/CategorySelect";
import type { ProductEditionOption } from "../../types/product.types";

interface ProductCommercialSectionProps {
  form: ProductFormValues;
  errors: Record<string, string>;
  setFieldValue: (key: string, value: any) => void;
  setPriceValue: (
    index: number,
    key: "cash_price" | "installment_price",
    value: string,
  ) => void;
  editions: ProductEditionOption[];
  isLoadingEditions: boolean;
  isEditionsError: boolean;
  selectedEdition?: ProductEditionOption;
  isEdit: boolean;
  isAsynchronous: boolean;
  disabled?: boolean;
}

const ProductCommercialSection = (props: ProductCommercialSectionProps) => {
  const { form, errors, setFieldValue } = props;
  const hasSelectedEdition = Boolean(form.edition_id && props.selectedEdition);

  return (
    <fieldset disabled={props.disabled} className="m-0 space-y-5 border-0 p-0">
      {props.isEditionsError && (
        <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle size={18} className="shrink-0" />
          No se pudieron cargar las ediciones. Conservamos los datos del formulario para que
          puedas reintentar.
        </div>
      )}

      <AcademicDetailsCard
        form={form}
        errors={errors}
        setFieldValue={setFieldValue}
        editions={props.editions}
        isLoadingEditions={props.isLoadingEditions}
        isEditionsError={props.isEditionsError}
        selectedEdition={props.selectedEdition}
      />

      {!hasSelectedEdition ? (
        <Card className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 shadow-none">
          <CardContent className="flex min-h-44 flex-col items-center justify-center px-6 py-8 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 shadow-sm">
              <PackageOpen size={20} />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">Selecciona una edición</h3>
            <p className="mt-1.5 max-w-lg text-xs leading-relaxed text-slate-500">
              La modalidad y la configuración de precios se habilitarán automáticamente según la edición elegida.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100">
                  <Settings size={15} className="text-slate-600" />
                </div>
                <div>
                  <CardTitle className="text-sm text-slate-800">Información del producto</CardTitle>
                  <CardDescription className="text-[11px]">
                    Datos de identificación comercial.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <CategorySelect
                  value={form.category_id}
                  onChange={(categoryId) => setFieldValue("category_id", categoryId)}
                  error={errors.category_id}
                  disabled={props.disabled}
                />

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
                  Nombre comercial
                </label>
                <input
                  className={cn(
                    "form-input h-10 rounded-xl border-slate-200 bg-white text-xs",
                    errors.name && "border-destructive",
                  )}
                  value={form.name}
                  onChange={(event) => setFieldValue("name", event.target.value)}
                  placeholder="Ej. Curso de React — Edición 4"
                />
                {errors.name && (
                  <p className="mt-1 text-[10px] text-destructive">{errors.name}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <PricingCard
            form={form}
            errors={errors}
            setFieldValue={setFieldValue}
            setPriceValue={props.setPriceValue}
            selectedEdition={props.selectedEdition}
            isEdit={props.isEdit}
            isAsynchronous={props.isAsynchronous}
          />
        </div>
      )}
    </fieldset>
  );
};

export default ProductCommercialSection;

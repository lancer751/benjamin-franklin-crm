import { AlertTriangle, CheckCircle2, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card";
import { cn } from "@/core/lib/utils";
import AcademicDetailsCard from "../form/AcademicDetailsCard";
import DiscountSection from "../form/DiscountSection";
import PricingCard from "../form/PricingCard";
import type { ProductFormValues } from "../../schemas";

interface ProductCommercialSectionProps {
  form: ProductFormValues;
  errors: Record<string, string>;
  setFieldValue: (key: string, value: any) => void;
  setPriceValue: (index: number, key: string, value: string) => void;
  editions: any[];
  categories: any[];
  isLoadingEditions: boolean;
  isLoadingCategories: boolean;
  isEditionsError: boolean;
  isCategoriesError: boolean;
  selectedEdition: any;
  isEdit: boolean;
  disabled?: boolean;
}

const ProductCommercialSection = (props: ProductCommercialSectionProps) => {
  const { form, errors, setFieldValue } = props;
  return (
    <fieldset disabled={props.disabled} className="m-0 space-y-6 border-0 p-0">
      {(props.isEditionsError || props.isCategoriesError) && (
        <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle size={18} className="shrink-0" />
          No se pudo cargar {props.isEditionsError && props.isCategoriesError ? "ediciones ni categorías" : props.isEditionsError ? "las ediciones" : "las categorías"}. Conservamos los datos del formulario para que puedas reintentar.
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <AcademicDetailsCard
            form={form}
            errors={errors}
            setFieldValue={setFieldValue}
            editions={props.editions}
            categories={props.categories}
            isLoadingEditions={props.isLoadingEditions}
            isLoadingCategories={props.isLoadingCategories}
            isEditionsError={props.isEditionsError}
            selectedEdition={props.selectedEdition}
          />
          <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10"><Settings size={16} className="text-primary" /></div>
                <div><CardTitle className="text-sm">Nombre del producto comercial</CardTitle><CardDescription className="text-xs">Identificación visible en el catálogo y las operaciones.</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <label className="mb-2 block text-xs font-bold text-slate-700">Nombre comercial</label>
              <input className={cn("form-input h-11 rounded-xl border-slate-200", errors.name && "border-destructive")} value={form.name} onChange={(event) => setFieldValue("name", event.target.value)} placeholder="Ej. Curso de React — Edición 4" />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </CardContent>
          </Card>
          <DiscountSection form={form} errors={errors} setFieldValue={setFieldValue} />
        </div>
        <div className="space-y-4">
          <div className={cn("flex items-start gap-3 rounded-xl border p-4", form.pricing_status === "VALID" ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50")}>
            {form.pricing_status === "VALID" ? <CheckCircle2 size={18} className="text-emerald-600" /> : <AlertTriangle size={18} className="text-red-600" />}
            <div><p className="text-xs font-bold text-slate-800">Estado de pricing: {form.pricing_status === "VALID" ? "Válido" : "Inválido"}</p><p className="mt-1 text-[11px] text-slate-600">{form.pricing_status === "VALID" ? "Los precios pueden usarse para publicación." : "Actualiza los precios según la modalidad antes de poner el producto en venta."}</p></div>
          </div>
          <PricingCard form={form} errors={errors} setFieldValue={setFieldValue} setPriceValue={props.setPriceValue} selectedEdition={props.selectedEdition} isEdit={props.isEdit} />
        </div>
      </div>
    </fieldset>
  );
};

export default ProductCommercialSection;

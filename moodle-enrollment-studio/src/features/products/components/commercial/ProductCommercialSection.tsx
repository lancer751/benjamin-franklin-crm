import { AlertTriangle, FolderOpen, PackageOpen, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { cn } from "@/core/lib/utils";
import AcademicDetailsCard from "../form/AcademicDetailsCard";
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
  const hasSelectedEdition = Boolean(form.edition_id && props.selectedEdition);

  return (
    <fieldset disabled={props.disabled} className="m-0 space-y-5 border-0 p-0">
      {(props.isEditionsError || props.isCategoriesError) && (
        <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle size={18} className="shrink-0" />
          No se pudo cargar{" "}
          {props.isEditionsError && props.isCategoriesError
            ? "ediciones ni categorías"
            : props.isEditionsError
              ? "las ediciones"
              : "las categorías"}
          . Conservamos los datos del formulario para que puedas reintentar.
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
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                  <FolderOpen size={12} className="text-slate-400" />
                  Categoría
                </label>
                <Select
                  value={form.category_id}
                  onValueChange={(value) => setFieldValue("category_id", value)}
                  disabled={props.isLoadingCategories}
                >
                  <SelectTrigger
                    className={cn(
                      "h-10 rounded-xl border-slate-200 bg-white text-xs shadow-sm",
                      errors.category_id && "border-destructive ring-1 ring-destructive",
                    )}
                  >
                    <SelectValue
                      placeholder={props.isLoadingCategories ? "Cargando..." : "Seleccionar categoría"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {props.categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category_id && (
                  <p className="mt-1 text-[10px] font-medium text-destructive">{errors.category_id}</p>
                )}
              </div>

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
          />
        </div>
      )}
    </fieldset>
  );
};

export default ProductCommercialSection;

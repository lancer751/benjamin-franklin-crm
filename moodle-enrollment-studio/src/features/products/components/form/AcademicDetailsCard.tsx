import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/core/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { GraduationCap, Loader2 } from "lucide-react";
import { cn } from "@/core/lib/utils";
import EditionCombobox from "./EditionCombobox";
import EditionInfoPanel from "./EditionInfoPanel";

interface AcademicDetailsCardProps {
  form: {
    edition_id: string | undefined;
    category_id: string;
  };
  errors: Record<string, string>;
  setFieldValue: (key: string, value: any) => void;
  editions: any[];
  categories: any[];
  isLoadingEditions: boolean;
  isEditionsError?: boolean;
  isLoadingCategories: boolean;
  selectedEdition: any;
}

const AcademicDetailsCard = ({
  form,
  errors,
  setFieldValue,
  editions,
  categories,
  isLoadingEditions,
  isEditionsError,
  isLoadingCategories,
  selectedEdition,
}: AcademicDetailsCardProps) => {
  return (
    <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <GraduationCap size={16} className="text-primary" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900">Detalles Académicos</CardTitle>
            <CardDescription className="text-xs">Asocia este producto a una cohorte y categoría específica.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <EditionCombobox
          editionId={form.edition_id}
          errors={errors}
          setFieldValue={setFieldValue}
          editions={editions}
          isLoadingEditions={isLoadingEditions}
          isError={isEditionsError}
        />

        <div>
          <label className="form-label text-xs font-bold text-slate-700 mb-2 block flex items-center gap-2">
            Categoría
            {isLoadingCategories && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
          </label>
          <Select 
            value={form.category_id} 
            onValueChange={(value) => setFieldValue("category_id", value)}
            disabled={isLoadingCategories}
          >
            <SelectTrigger className={cn("h-11 shadow-sm rounded-xl", errors.category_id ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200')}>
              <SelectValue placeholder={isLoadingCategories ? "Cargando..." : "Seleccionar categoría"} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat: any) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category_id && <p className="text-destructive text-[11px] font-medium mt-1.5 ml-1">{errors.category_id}</p>}
        </div>

        <EditionInfoPanel selectedEdition={selectedEdition} />
      </CardContent>
    </Card>
  );
};

export default AcademicDetailsCard;

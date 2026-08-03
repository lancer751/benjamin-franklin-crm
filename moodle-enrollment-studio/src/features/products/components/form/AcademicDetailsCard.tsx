import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card";
import { GraduationCap } from "lucide-react";
import EditionCombobox from "./EditionCombobox";
import EditionInfoPanel from "./EditionInfoPanel";

interface AcademicDetailsCardProps {
  form: {
    edition_id: string | undefined;
  };
  errors: Record<string, string>;
  setFieldValue: (key: string, value: any) => void;
  editions: any[];
  isLoadingEditions: boolean;
  isEditionsError?: boolean;
  selectedEdition: any;
}

const AcademicDetailsCard = ({
  form,
  errors,
  setFieldValue,
  editions,
  isLoadingEditions,
  isEditionsError,
  selectedEdition,
}: AcademicDetailsCardProps) => {
  return (
    <Card className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm transition-colors hover:border-slate-300">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
            <GraduationCap size={16} className="text-primary" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900">Selector de edición</CardTitle>
            <CardDescription className="text-xs">
              Inicia seleccionando la cohorte que define la modalidad y los precios.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className={selectedEdition ? "grid items-end gap-4 lg:grid-cols-[minmax(320px,1fr)_minmax(0,1.35fr)]" : ""}>
          <EditionCombobox
            editionId={form.edition_id}
            errors={errors}
            setFieldValue={setFieldValue}
            editions={editions}
            isLoadingEditions={isLoadingEditions}
            isError={isEditionsError}
          />
          {selectedEdition && <EditionInfoPanel selectedEdition={selectedEdition} />}
        </div>
      </CardContent>
    </Card>
  );
};

export default AcademicDetailsCard;

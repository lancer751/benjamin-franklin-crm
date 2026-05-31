import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/core/components/ui/card";
import { Settings, Link as LinkIcon } from "lucide-react";
import { cn } from "@/core/lib/utils";

interface CommercialConfigCardProps {
  form: {
    slug: string;
    short_description?: string | null;
    description?: string | null;
  };
  errors: Record<string, string>;
  setFieldValue: (key: string, value: any) => void;
}

const CommercialConfigCard = ({
  form,
  errors,
  setFieldValue,
}: CommercialConfigCardProps) => {
  return (
    <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings size={16} className="text-primary" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900">Configuración Comercial</CardTitle>
            <CardDescription className="text-xs">Personaliza los títulos, descripciones y ofertas especiales para los alumnos.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div>
          <label className="form-label text-xs font-bold text-slate-700 mb-2 block">Slug (Identificador URL único)</label>
          <div className="relative">
            <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              className={cn("form-input pl-9 rounded-xl h-11 border-slate-200 font-mono text-xs", errors.slug && 'border-destructive')} 
              placeholder="curso-react-cohorte-1" 
              value={form.slug} 
              onChange={(e) => setFieldValue("slug", e.target.value)} 
            />
          </div>
          {errors.slug && <p className="text-destructive text-xs mt-1">{errors.slug}</p>}
          <p className="text-[10px] text-muted-foreground mt-1.5 italic">Se autogenera del nombre pero puedes personalizarlo.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="form-label text-xs font-bold text-slate-700 mb-2 block">Descripción Corta (Máximo 160 caracteres)</label>
            <input 
              type="text" 
              maxLength={160}
              className={cn("form-input rounded-xl h-11 border-slate-200", errors.short_description && 'border-destructive')} 
              placeholder="Escribe una breve introducción comercial" 
              value={form.short_description || ""} 
              onChange={(e) => setFieldValue("short_description", e.target.value)} 
            />
            {errors.short_description && <p className="text-destructive text-xs mt-1">{errors.short_description}</p>}
          </div>

          <div>
            <label className="form-label text-xs font-bold text-slate-700 mb-2 block">Descripción Detallada</label>
            <textarea 
              className={cn("form-input rounded-xl min-h-[120px] border-slate-200 py-3", errors.description && 'border-destructive')} 
              placeholder="Escribe los detalles completos de la edición académica..." 
              value={form.description || ""} 
              onChange={(e) => setFieldValue("description", e.target.value)} 
            />
            {errors.description && <p className="text-destructive text-xs mt-1">{errors.description}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommercialConfigCard;

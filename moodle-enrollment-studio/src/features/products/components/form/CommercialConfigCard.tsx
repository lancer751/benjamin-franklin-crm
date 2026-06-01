import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/core/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Settings, Link as LinkIcon, Globe } from "lucide-react";
import { cn } from "@/core/lib/utils";
import { STATUS_LABELS } from "@/features/products/components/shared/ProductStatusBadge";

interface CommercialConfigCardProps {
  form: {
    name: string;
    slug: string;
    short_description?: string | null;
    description?: string | null;
    sales_status: string;
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
    <Card className="w-full shadow-sm border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings size={16} className="text-primary" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900">Configuración Comercial Web</CardTitle>
            <CardDescription className="text-xs">Personaliza los títulos, descripciones y ofertas especiales para los alumnos.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        
        {/* Grid para Slug y Estado */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full">
          {/* Slug (Col Span 8) */}
          <div className="md:col-span-8 w-full">
            <label className="form-label text-xs font-bold text-slate-700 mb-2 block flex items-center gap-1.5">
              <LinkIcon size={14} className="text-primary" /> Slug (Identificador URL único)
            </label>
            <div className="relative w-full">
              <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                className={cn("form-input w-full pl-9 rounded-xl h-11 border-slate-200 font-mono text-xs shadow-sm bg-white", errors.slug && 'border-destructive')} 
                placeholder="curso-react-cohorte-1" 
                value={form.slug} 
                onChange={(e) => setFieldValue("slug", e.target.value)} 
              />
            </div>
            {errors.slug && <p className="text-destructive text-xs mt-1">{errors.slug}</p>}
            <p className="text-[10px] text-muted-foreground mt-1.5 italic">Se autogenera del nombre pero puedes personalizarlo.</p>
          </div>

          {/* Estado de Publicación (Col Span 4) */}
          <div className="md:col-span-4 w-full">
            <label className="form-label text-xs font-bold text-slate-700 mb-2 block flex items-center gap-1.5">
              <Globe size={14} className="text-emerald-600" /> Estado de Publicación en Catálogo
            </label>
            <Select 
              value={form.sales_status} 
              onValueChange={(value) => setFieldValue("sales_status", value as any)}
            >
              <SelectTrigger className="h-11 border-slate-200 shadow-sm rounded-xl">
                <SelectValue placeholder="Selecciona el estado" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Descripción Corta (100% Ancho, Máximo 160 Caracteres) */}
        <div className="w-full">
          <label className="form-label text-xs font-bold text-slate-700 mb-2 block">
            Descripción Corta (Máximo 160 caracteres)
          </label>
          <input 
            type="text" 
            maxLength={160}
            className={cn("form-input w-full rounded-xl h-11 border-slate-200 text-sm shadow-sm bg-white", errors.short_description && 'border-destructive')} 
            placeholder="Escribe una breve introducción comercial" 
            value={form.short_description || ""} 
            onChange={(e) => setFieldValue("short_description", e.target.value)} 
          />
          {errors.short_description && <p className="text-destructive text-xs mt-1">{errors.short_description}</p>}
        </div>

        {/* Descripción Detallada (100% Ancho, Textarea Amplio rows=6) */}
        <div className="w-full">
          <label className="form-label text-xs font-bold text-slate-700 mb-2 block">
            Descripción Detallada
          </label>
          <textarea 
            rows={6}
            className={cn("form-input w-full rounded-xl border-slate-200 py-3 text-sm shadow-sm bg-white min-h-[160px]", errors.description && 'border-destructive')} 
            placeholder="Escribe los detalles completos de la edición académica..." 
            value={form.description || ""} 
            onChange={(e) => setFieldValue("description", e.target.value)} 
          />
          {errors.description && <p className="text-destructive text-xs mt-1">{errors.description}</p>}
        </div>

      </CardContent>
    </Card>
  );
};

export default CommercialConfigCard;

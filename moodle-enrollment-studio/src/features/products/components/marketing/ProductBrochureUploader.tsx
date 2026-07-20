import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import type { ChangeEvent } from "react";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card";

interface ProductBrochureUploaderProps {
  url?: string | null;
  isUploading: boolean;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

const ProductBrochureUploader = ({ url, isUploading, onFileChange, onRemove }: ProductBrochureUploaderProps) => (
  <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
    <CardHeader className="border-b border-slate-100 bg-slate-50/50">
      <div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50"><FileText size={16} className="text-emerald-600" /></div><div><CardTitle className="text-sm">Brochure comercial</CardTitle><CardDescription className="text-xs">Documento PDF descargable desde la web.</CardDescription></div></div>
    </CardHeader>
    <CardContent className="space-y-4 p-6">
      {url ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
          <div className="min-w-0"><p className="truncate text-xs font-bold text-slate-800">Brochure disponible</p><a href={url} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-emerald-700 hover:underline">Ver PDF actual</a></div>
          <div className="flex gap-1"><Button type="button" variant="ghost" size="icon" onClick={() => document.getElementById("brochure-upload")?.click()} aria-label="Reemplazar brochure"><Upload size={16} /></Button><Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label="Eliminar brochure" className="text-red-500"><Trash2 size={16} /></Button></div>
        </div>
      ) : (
        <button type="button" onClick={() => document.getElementById("brochure-upload")?.click()} className="flex w-full flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center transition hover:border-emerald-300 hover:bg-emerald-50/20">
          <Upload size={24} className="mb-2 text-slate-400" /><span className="text-xs font-bold text-slate-700">Subir brochure PDF</span><span className="mt-1 text-[10px] text-slate-400">PDF de hasta 10 MB</span>
        </button>
      )}
      {isUploading && <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 p-3 text-xs font-semibold text-emerald-700"><Loader2 size={15} className="animate-spin" /> Subiendo PDF...</div>}
      <input id="brochure-upload" type="file" accept=".pdf,application/pdf" className="hidden" onChange={onFileChange} />
    </CardContent>
  </Card>
);

export default ProductBrochureUploader;

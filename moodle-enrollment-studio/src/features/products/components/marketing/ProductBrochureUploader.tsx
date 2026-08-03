import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card";

interface ProductBrochureUploaderProps {
  url?: string | null;
  pendingFile: File | null;
  isUploading: boolean;
  isMarkedForRemoval: boolean;
  onSelect: (file: File) => void;
  onRemove: () => void;
}

const formatSize = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

const ProductBrochureUploader = ({ url, pendingFile, isUploading, isMarkedForRemoval, onSelect, onRemove }: ProductBrochureUploaderProps) => (
  <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
    <CardHeader className="border-b border-slate-100 bg-slate-50/50">
      <div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50"><FileText size={16} className="text-emerald-600" /></div><div><CardTitle className="text-sm">Brochure comercial</CardTitle><CardDescription className="text-xs">PDF descargable desde la web.</CardDescription></div></div>
    </CardHeader>
    <CardContent className="space-y-4 p-6">
      {pendingFile ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><Badge className="mb-2 bg-amber-500">Pendiente de guardar</Badge><p className="truncate text-xs font-bold text-slate-800">{pendingFile.name}</p><p className="mt-1 text-[11px] text-slate-500">{pendingFile.type || "application/pdf"} · {formatSize(pendingFile.size)}</p>{url && <p className="mt-2 text-[10px] text-slate-500">Reemplazará el brochure guardado cuando el backend confirme.</p>}</div><Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label="Quitar PDF pendiente" className="text-red-500"><Trash2 size={16} /></Button></div></div> : url && !isMarkedForRemoval ? <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4"><div><p className="text-xs font-bold text-slate-800">Brochure guardado</p><a href={url} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-emerald-700 hover:underline">Ver PDF actual</a></div><Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label="Eliminar brochure" className="text-red-500"><Trash2 size={16} /></Button></div> : <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center"><FileText size={24} className="mx-auto mb-2 text-slate-400" /><p className="text-xs text-slate-500">{isMarkedForRemoval ? "Se eliminará al guardar" : "No hay brochure seleccionado"}</p></div>}
      <Button type="button" variant="outline" className="w-full rounded-xl" onClick={() => document.getElementById("product-brochure-upload")?.click()} disabled={isUploading}><Upload size={14} className="mr-2" /> {pendingFile || url ? "Reemplazar PDF" : "Seleccionar PDF"}</Button>
      {isUploading && <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 p-3 text-xs font-semibold text-emerald-700"><Loader2 size={15} className="animate-spin" /> Subiendo brochure...</div>}
      <input id="product-brochure-upload" type="file" accept=".pdf,application/pdf" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) onSelect(file); event.target.value = ""; }} />
    </CardContent>
  </Card>
);

export default ProductBrochureUploader;

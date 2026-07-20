import { Image as ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card";

interface CoverImageUploaderProps {
  imageUrl?: string;
  pendingFile: File | null;
  previewUrl: string | null;
  isUploading: boolean;
  isMarkedForRemoval: boolean;
  onSelect: (file: File) => void;
  onRemove: () => void;
}

const formatSize = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

const CoverImageUploader = ({ imageUrl, pendingFile, previewUrl, isUploading, isMarkedForRemoval, onSelect, onRemove }: CoverImageUploaderProps) => {
  const visibleImage = previewUrl || (!isMarkedForRemoval ? imageUrl : undefined);
  return (
    <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10"><ImageIcon size={16} className="text-primary" /></div><div><CardTitle className="text-sm">Portada del producto</CardTitle><CardDescription className="text-xs">La selección permanece local hasta guardar.</CardDescription></div></div>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="group relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60">
          {visibleImage ? <img src={visibleImage} alt={pendingFile ? "Previsualización pendiente" : "Portada actual"} className="h-full w-full object-cover" /> : <div className="text-center text-slate-400"><ImageIcon size={32} className="mx-auto mb-2" /><p className="text-xs font-medium">{isMarkedForRemoval ? "Se eliminará al guardar" : "Sin portada"}</p></div>}
          {!isUploading && <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"><Button type="button" variant="secondary" size="sm" className="rounded-xl" onClick={() => document.getElementById("product-cover-upload")?.click()}><Upload size={14} className="mr-1" /> {pendingFile || imageUrl ? "Reemplazar" : "Subir"}</Button>{(pendingFile || imageUrl) && <Button type="button" variant="destructive" size="sm" className="rounded-xl" onClick={onRemove}><Trash2 size={14} className="mr-1" /> Quitar</Button>}</div>}
          {isUploading && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/95"><Loader2 size={24} className="animate-spin text-primary" /><p className="text-xs font-bold text-primary">Subiendo portada...</p></div>}
        </div>
        {pendingFile && <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs"><Badge className="bg-amber-500">Pendiente de guardar</Badge><span className="min-w-0 truncate font-semibold text-slate-700">{pendingFile.name}</span><span className="text-slate-500">{formatSize(pendingFile.size)}</span></div>}
        {!pendingFile && imageUrl && !isMarkedForRemoval && <p className="text-[11px] text-slate-500">Portada guardada actualmente.</p>}
        <input id="product-cover-upload" type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) onSelect(file); event.target.value = ""; }} />
      </CardContent>
    </Card>
  );
};

export default CoverImageUploader;

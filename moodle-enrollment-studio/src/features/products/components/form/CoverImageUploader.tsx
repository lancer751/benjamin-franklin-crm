import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Image as ImageIcon, Upload, Loader2 } from "lucide-react";

interface CoverImageUploaderProps {
  imageUrl: string | undefined;
  isUploading: boolean;
  onUpload: (file: File) => void;
}

const CoverImageUploader = ({
  imageUrl,
  isUploading,
  onUpload,
}: CoverImageUploaderProps) => {
  return (
    <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <ImageIcon size={16} className="text-primary" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900">Portada del Producto</CardTitle>
            <CardDescription className="text-xs">Imagen que visualizará el alumno en el landing comercial.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="relative aspect-video rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50/60 group hover:border-primary/50 transition-colors">
          {imageUrl ? (
            <>
              <img src={imageUrl} alt="Portada" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="gap-2 rounded-xl"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <Upload size={14} /> Cambiar Portada
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground p-4 text-center">
              <ImageIcon size={32} strokeWidth={1.5} className="text-slate-400" />
              <p className="text-xs font-medium">No hay imagen seleccionada</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 rounded-xl border-slate-200 hover:bg-slate-100"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                Subir Imagen
              </Button>
            </div>
          )}
          
          {isUploading && (
            <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center gap-2 z-20 rounded-2xl">
              <Loader2 size={24} className="animate-spin text-primary" />
              <p className="text-xs font-bold text-primary animate-pulse">Subiendo a Cloudinary...</p>
            </div>
          )}
        </div>
        <input 
          id="image-upload" 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
          }}
        />
        <p className="text-[10px] text-muted-foreground italic text-center leading-normal">
          * Se autocompleta con la imagen oficial de la cohorte elegida si no subes una personalizada.
        </p>
      </CardContent>
    </Card>
  );
};

export default CoverImageUploader;

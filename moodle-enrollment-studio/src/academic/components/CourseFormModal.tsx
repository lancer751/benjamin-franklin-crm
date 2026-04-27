import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/core/components/ui/dialog";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Textarea } from "@/core/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UploadCloud, X, ImagePlus } from "lucide-react";
import { createCourse, updateCourse } from "../services/courseService";
import { uploadImageToCloudinary } from "../services/uploadService";
import { toast } from "sonner"; // O el toaster que uses de Shadcn

// 1. ARREGLAMOS EL ERROR DE TYPESCRIPT
interface CourseFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: any; // El signo de interrogación significa que es opcional (para cuando es "Nuevo")
}

export default function CourseFormModal({ open, onClose, initialData }: CourseFormModalProps) {
  const queryClient = useQueryClient();

  // Estados locales para los campos del formulario
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  
  // Estados para la carga de imágenes
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 2. EFECTO PARA RELLENAR DATOS (Cuando le das a "Editar")
  useEffect(() => {
    if (initialData && open) {
      setCode(initialData.code || "");
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      
      if (initialData.image_url) {
        setPreviewUrl(initialData.image_url);
      } else {
        setPreviewUrl(null);
      }
      setImageFile(null);
    } else if (open) {
      // Si es "Nuevo Curso", limpiamos los campos
      setCode("");
      setName("");
      setDescription("");
      setPreviewUrl(null);
      setImageFile(null);
    }
  }, [initialData, open]);

  // Manejador del Input de Imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 3. CONFIGURAMOS LAS MUTACIONES
  // Mutación para CREAR
  const createMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      toast.success("Curso creado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["courses"] }); // Refresca la tabla
      onClose();
    },
    onError: () => {
      toast.error("Hubo un error al crear el curso");
    }
  });

  // Mutación para ACTUALIZAR
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateCourse(id, data),
    onSuccess: () => {
      toast.success("Curso actualizado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["courses"] }); // Refresca la tabla
      onClose();
    },
    onError: () => {
      toast.error("Hubo un error al actualizar el curso");
    }
  });

  // 4. MANEJADOR DEL SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalImageUrl = initialData?.image_url || '';

    try {
      if (imageFile) {
        setIsUploading(true);
        finalImageUrl = await uploadImageToCloudinary(imageFile);
      }

      // Armamos el objeto tal como lo pide el Zod Schema del backend
      const payload = {
        code: code.toUpperCase(), // Forzamos mayúsculas por convención
        name,
        description,
        image_url: finalImageUrl 
      };

      if (initialData?.id) {
        // Si hay un ID, estamos EDITANDO
        updateMutation.mutate({ id: initialData.id, data: payload });
      } else {
        // Si no hay ID, estamos CREANDO
        createMutation.mutate(payload);
      }
    } catch (error) {
      toast.error("Error al subir la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || isUploading;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          {/* Título dinámico dependiendo de si editamos o creamos */}
          <DialogTitle>{initialData ? "Editar Curso Master" : "Nuevo Curso Master"}</DialogTitle>
          <DialogDescription>
            {initialData 
              ? "Modifica los detalles principales del curso." 
              : "Crea la plantilla base de un nuevo curso. Luego podrás abrirle ediciones."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col max-h-[85vh] overflow-hidden py-4 relative">
          {/* Cuerpo del Modal (Área de Scroll) */}
          <div className="flex-1 overflow-y-auto px-1 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="code" className="text-sm font-medium">
                  Código del Curso <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="code" 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ej: PYTHON" 
                  required 
                  maxLength={7} 
                />
                <p className="text-[10px] text-muted-foreground">Máximo 7 caracteres (según backend).</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nombre Oficial <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Python para Análisis de Datos" 
                  required 
                />
              </div>

              {/* ZONA DE CARGA DE IMAGEN */}
              <div className="grid gap-2 md:col-span-2">
                <Label className="text-sm font-medium">Portada del Curso</Label>
                {previewUrl ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border border-border shadow-sm group">
                    <img 
                      src={previewUrl} 
                      alt="Vista previa de la portada" 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 z-10 transition-opacity"
                      onClick={() => {
                        setPreviewUrl(null);
                        setImageFile(null);
                      }}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ) : (
                  <Label 
                    htmlFor="course-image" 
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl bg-muted/40 hover:bg-muted/80 hover:border-primary/50 transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground group-hover:text-primary transition-colors">
                      <UploadCloud className="w-10 h-10 mb-3 opacity-50 group-hover:opacity-100 transition-opacity group-hover:-translate-y-1 duration-300" />
                      <p className="mb-1 text-sm font-medium text-center px-4">
                        Haz clic o arrastra una{" "}
                        <span className="font-semibold text-primary">imagen</span> para la portada del curso
                      </p>
                      <p className="text-[11px] text-muted-foreground/70 mt-1">PNG, JPG o WEBP (Máx 2MB)</p>
                    </div>
                    <input 
                      id="course-image" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageChange}
                    />
                  </Label>
                )}
              </div>

              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Descripción Corta
                </Label>
                <Textarea 
                  id="description" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Escribe un breve resumen de lo que trata el curso..." 
                  rows={3} 
                  className="resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Fijo */}
          <div className="shrink-0 bg-white pt-4 pb-2 border-t mt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isUploading ? "Subiendo imagen..." : isPending ? "Guardando..." : "Guardar Curso"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
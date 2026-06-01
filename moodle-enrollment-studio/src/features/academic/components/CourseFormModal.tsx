import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/core/components/ui/dialog";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Textarea } from "@/core/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UploadCloud, X } from "lucide-react";
import { createCourse, updateCourse } from "../services/courseService";
import { uploadImageToCloudinary } from "@/core/lib/uploadService";
import { toast } from "sonner";

// Función helper para autogenerar códigos de curso master
function generateCourseCode(name: string): string {
  // 1. Eliminar acentos/tildes y pasar a mayúsculas
  const cleanName = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();

  // 2. Extraer palabras (eliminando caracteres especiales)
  const words = cleanName.replace(/[^A-Z0-9\s]/g, "").split(/\s+/).filter(Boolean);

  let prefix = "";
  if (words.length >= 4) {
    // Extraemos la primera letra de cada una de las últimas 4 palabras
    const lastFour = words.slice(-4);
    prefix = lastFour.map(w => w[0]).join("");
  } else if (words.length > 0) {
    // Si hay menos de 4 palabras, extraemos del total de caracteres sin espacios
    const joint = words.join("");
    prefix = joint.slice(0, 4);
    while (prefix.length < 4) {
      prefix += "X";
    }
  } else {
    prefix = "CURS";
  }

  // Asegurar que el prefijo tenga exactamente 4 letras
  prefix = prefix.slice(0, 4);

  // 3. Generar número aleatorio de 3 dígitos (para lograr los 7 caracteres requeridos)
  const randomNum = Math.floor(100 + Math.random() * 900);

  return `${prefix}${randomNum}`;
}

interface CourseFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: any;
}

export default function CourseFormModal({ open, onClose, initialData }: CourseFormModalProps) {
  const queryClient = useQueryClient();

  // Estados locales para los campos del formulario
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("COURSE");
  const [classesNumber, setClassesNumber] = useState<number | "">("");
  
  // Estados para la carga de imágenes
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Sincronización de datos (Creación / Edición)
  useEffect(() => {
    if (initialData && open) {
      setCode(initialData.code || "");
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setType(initialData.type || "COURSE");
      setClassesNumber(initialData.classes_number || "");
      setPreviewUrl(initialData.image_url || null);
      setImageFile(null);
    } else if (open) {
      setCode("");
      setName("");
      setDescription("");
      setType("COURSE");
      setClassesNumber("");
      setPreviewUrl(null);
      setImageFile(null);
    }
  }, [initialData, open]);

  // Autogenerar código sugerido en tiempo real al escribir el nombre (solo modo CREACIÓN)
  useEffect(() => {
    if (!initialData && open && name.trim().length >= 3) {
      setCode(generateCourseCode(name));
    }
  }, [name, initialData, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Mutaciones
  const createMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      toast.success("Curso creado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      onClose();
    },
    onError: () => {
      toast.error("Hubo un error al crear el curso");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateCourse(id, data),
    onSuccess: () => {
      toast.success("Curso actualizado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      onClose();
    },
    onError: () => {
      toast.error("Hubo un error al actualizar el curso");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalImageUrl = initialData?.image_url || '';

    try {
      if (imageFile) {
        setIsUploading(true);
        finalImageUrl = await uploadImageToCloudinary(imageFile);
      }

      const payload = {
        code: code.toUpperCase(),
        name,
        type,
        classes_number: Number(classesNumber) || 0,
        description,
        image_url: finalImageUrl 
      };

      if (initialData?.id) {
        updateMutation.mutate({ id: initialData.id, data: payload });
      } else {
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
      <DialogContent className="sm:max-w-[720px] w-full p-6 gap-0">
        <DialogHeader className="mb-4">
          <DialogTitle>{initialData ? "Editar Curso/Programa" : "Nuevo Curso/Programa"}</DialogTitle>
          <DialogDescription>
            {initialData 
              ? "Modifica los detalles principales del curso." 
              : "Crea la plantilla base de un nuevo curso para el catálogo académico."}
          </DialogDescription>
        </DialogHeader>

        {/* 🌟 REDISEÑO COMPACTO EN 2 COLUMNAS SIN SCROLL */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-5 items-start">
          
          {/* Columna Izquierda: Información del Curso (60%) */}
          <div className="md:col-span-3 grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="code" className="text-xs font-semibold text-slate-700">
                Código <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="code" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ej: PYTHONC" 
                required 
                minLength={7}
                maxLength={7} 
                className="h-9 uppercase"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="classes_number" className="text-xs font-semibold text-slate-700">
                N° de Clases <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="classes_number" 
                type="number"
                value={classesNumber}
                onChange={(e) => setClassesNumber(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Ej: 12" 
                required 
                min={1}
                className="h-9"
              />
            </div>

            <div className="grid gap-1.5 col-span-2">
              <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
                Nombre Oficial <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Python para Análisis de Datos" 
                required 
                minLength={8}
                className="h-9"
              />
            </div>

            <div className="grid gap-1.5 col-span-2">
              <Label className="text-xs font-semibold text-slate-700">
                Tipo de Registro <span className="text-destructive">*</span>
              </Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COURSE">Curso</SelectItem>
                  <SelectItem value="PROGRAM">Programa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5 col-span-2">
              <Label htmlFor="description" className="text-xs font-semibold text-slate-700">
                Descripción Corta
              </Label>
              <Textarea 
                id="description" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve resumen del curso..." 
                rows={2} 
                className="resize-none text-sm min-h-[68px]"
              />
            </div>
          </div>

          {/* Columna Derecha: Dropzone de Imagen Simétrico (40%) */}
          <div className="md:col-span-2 flex flex-col gap-1.5 h-full">
            <Label className="text-xs font-semibold text-slate-700">Portada del Curso</Label>
            
            {previewUrl ? (
              <div className="relative w-full h-[216px] rounded-xl overflow-hidden border border-border bg-slate-50 shadow-sm group">
                <img 
                  src={previewUrl} 
                  alt="Portada" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 rounded-lg shadow-md z-10"
                  onClick={() => {
                    setPreviewUrl(null);
                    setImageFile(null);
                  }}
                >
                  <X size={14} />
                </Button>
              </div>
            ) : (
              <Label 
                htmlFor="course-image" 
                className="flex flex-col items-center justify-center w-full h-[216px] border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 hover:border-primary/50 transition-all cursor-pointer group"
              >
                <div className="flex flex-col items-center justify-center text-center px-3">
                  <UploadCloud className="w-8 h-8 mb-2 text-slate-400 group-hover:text-primary transition-colors group-hover:-translate-y-0.5 duration-300" />
                  <p className="text-xs font-medium text-slate-600">
                    Sube la <span className="text-primary font-semibold">portada</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[140px]">PNG, JPG o WEBP (Máx 2MB)</p>
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

          {/* Pie del Formulario / Botones de Acción */}
          <div className="col-span-1 md:col-span-5 border-t pt-4 mt-2 flex justify-end gap-2 w-full">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="h-9 px-4">
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} className="h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white font-medium">
              {isUploading ? "Subiendo..." : isPending ? "Guardando..." : "Guardar Curso"}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}
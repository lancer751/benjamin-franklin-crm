import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Settings, Pencil, BookOpen, DollarSign, Image } from "lucide-react";
import { mockManagedCourses } from "@/lib/mock-data";
import { ManagedCourse, CourseStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const CourseManagementPage = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<ManagedCourse[]>([...mockManagedCourses]);
  const [editTarget, setEditTarget] = useState<ManagedCourse | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    status: "ACTIVE" as CourseStatus,
  });

  const openEdit = (course: ManagedCourse) => {
    setEditTarget(course);
    setEditForm({
      name: course.name,
      description: course.description ?? "",
      price: course.price.toFixed(2),
      status: course.status,
    });
  };

  const handleSave = () => {
    if (!editTarget) return;
    const price = parseFloat(editForm.price);
    if (isNaN(price) || price < 0) {
      toast({ title: "Error", description: "El precio debe ser un número válido.", variant: "destructive" });
      return;
    }
    setCourses((prev) =>
      prev.map((c) =>
        c.id === editTarget.id
          ? {
              ...c,
              name: editForm.name.trim() || c.name,
              description: editForm.description.trim() || null,
              price,
              status: editForm.status,
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );
    toast({ title: "Curso actualizado", description: `${editForm.name} se actualizó correctamente.` });
    setEditTarget(null);
  };

  const toggleStatus = (course: ManagedCourse) => {
    const newStatus: CourseStatus = course.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setCourses((prev) =>
      prev.map((c) => (c.id === course.id ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c))
    );
    toast({
      title: newStatus === "ACTIVE" ? "Curso activado" : "Curso desactivado",
      description: `${course.name} está ahora ${newStatus === "ACTIVE" ? "activo" : "inactivo"}.`,
    });
  };

  const activeCount = courses.filter((c) => c.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Gestión de Cursos</h1>
        <p className="mt-1 text-muted-foreground">Edita información, precios y estado de los cursos.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{courses.length}</p>
              <p className="text-xs text-muted-foreground">Total cursos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
              <BookOpen className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Activos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10">
              <BookOpen className="h-4 w-4 text-warning" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{courses.length - activeCount}</p>
              <p className="text-xs text-muted-foreground">Inactivos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <Settings className="h-5 w-5 text-primary" />
            Administración de Cursos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Curso</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((c) => (
                  <TableRow key={c.id} className={c.status === "INACTIVE" ? "opacity-60" : ""}>
                    <TableCell>
                      <div className="max-w-[220px]">
                        <p className="font-medium text-sm truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{c.description?.slice(0, 60)}…</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{c.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        S/ {c.price.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`border text-xs cursor-pointer ${
                          c.status === "ACTIVE"
                            ? "bg-success/15 text-success border-success/20"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                        onClick={() => toggleStatus(c)}
                      >
                        {c.status === "ACTIVE" ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {c.startDate} → {c.endDate}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Editar" onClick={() => openEdit(c)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Curso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="course-name">Nombre del curso</Label>
              <Input
                id="course-name"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-desc">Descripción</Label>
              <Textarea
                id="course-desc"
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course-price">Precio (PEN)</Label>
                <Input
                  id="course-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.price}
                  onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm((f) => ({ ...f, status: v as CourseStatus }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Activo</SelectItem>
                    <SelectItem value="INACTIVE">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Imagen del curso</Label>
              <div className="flex items-center gap-3 rounded-lg border border-dashed p-4">
                <Image className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Arrastra una imagen o haz clic para subir</p>
                  <p className="text-xs text-muted-foreground">(Funcionalidad disponible con backend)</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseManagementPage;

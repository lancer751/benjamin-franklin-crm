import { useState } from "react";
import { coursesApi } from "@/api/courses";
import { useFetch } from "@/hooks/useFetch";
import type { Course, CourseFormData } from "@/types/course";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";

const emptyForm: CourseFormData = { nombre: "", descripcion: "", duracion_semanas: 0 };

export default function CoursesPage() {
  const [page, setPage] = useState(1);
  const { data, loading, refetch } = useFetch(() => coursesApi.getAll(page), [page]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState<CourseFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (c: Course) => {
    setEditing(c);
    setForm({ nombre: c.nombre, descripcion: c.descripcion || "", duracion_semanas: c.duracion_semanas });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await coursesApi.update(editing.id, form);
        toast.success("Curso actualizado");
      } else {
        await coursesApi.create(form);
        toast.success("Curso creado");
      }

      setDialogOpen(false);
      refetch();
    } catch (err: unknown) {
      let message = "Error al guardar";

      if (err instanceof Error) {
        message = err.message;
      }

      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err
      ) {
        const maybeAxiosError = err as {
          response?: { data?: { error?: string } };
        };

        message =
          maybeAxiosError.response?.data?.error ?? message;
      }

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const courses = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Cursos</h1>
        <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-1" /> Nuevo Curso</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-muted-foreground text-sm p-6">Cargando…</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Duración</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.nombre}</TableCell>
                        <TableCell className="text-sm max-w-xs truncate">{c.descripcion || "—"}</TableCell>
                        <TableCell>{c.duracion_semanas} sem.</TableCell>
                        <TableCell>
                          <Badge className={c.status === "activo" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {courses.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No hay cursos.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {data && (
                <div className="flex items-center justify-between p-4 border-t">
                  <span className="text-sm text-muted-foreground">Pág. {data.page} — {data.total} cursos</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
                    <Button variant="outline" size="sm" disabled={!data.hasMore} onClick={() => setPage((p) => p + 1)}>Siguiente</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar Curso" : "Nuevo Curso"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5"><Label>Nombre</Label><Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Descripción</Label><Input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Duración (semanas)</Label><Input type="number" value={form.duracion_semanas} onChange={(e) => setForm({ ...form, duracion_semanas: Number(e.target.value) })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

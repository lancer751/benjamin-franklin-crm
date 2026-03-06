import { useState } from "react";
import { customersApi } from "@/api/customers";
import { useFetch } from "@/hooks/useFetch";
import type { Customer, CustomerFormData } from "@/types/customer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const emptyForm: CustomerFormData = {
  nombre: "",
  apellido_paterno: "",
  apellido_materno: "",
  email: "",
  telefono: "",
  dni: "",
};

export default function CustomersPage() {
  const { data: customers, loading, refetch } = useFetch(() => customersApi.getAll(), []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<CustomerFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({
      nombre: c.nombre,
      apellido_paterno: c.apellido_paterno,
      apellido_materno: c.apellido_materno,
      email: c.email,
      telefono: c.telefono || "",
      dni: c.dni,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await customersApi.update(editing.id, form);
        toast.success("Cliente actualizado");
      } else {
        await customersApi.create(form);
        toast.success("Cliente creado");
      }
      setDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const filtered = (customers || []).filter(
    (c) =>
      `${c.nombre} ${c.apellido_paterno} ${c.apellido_materno} ${c.email} ${c.dni}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Clientes</h1>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Nuevo Cliente
        </Button>
      </div>

      <Input
        placeholder="Buscar por nombre, email o DNI…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-muted-foreground text-sm p-6">Cargando…</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>DNI</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Moodle</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {c.nombre} {c.apellido_paterno} {c.apellido_materno}
                      </TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c.dni}</TableCell>
                      <TableCell>{c.telefono || "—"}</TableCell>
                      <TableCell>
                        {c.moodle_user_id ? (
                          <Badge variant="secondary">ID: {c.moodle_user_id}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No se encontraron clientes.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {(
              [
                ["nombre", "Nombre"],
                ["apellido_paterno", "Apellido Paterno"],
                ["apellido_materno", "Apellido Materno"],
                ["email", "Email"],
                ["telefono", "Teléfono"],
                ["dni", "DNI"],
              ] as [keyof CustomerFormData, string][]
            ).map(([key, label]) => (
              <div key={key} className="grid gap-1.5">
                <Label>{label}</Label>
                <Input
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

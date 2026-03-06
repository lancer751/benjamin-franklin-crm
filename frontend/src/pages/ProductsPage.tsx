import { productsApi } from "@/api/products";
import { useFetch } from "@/hooks/useFetch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ProductsPage() {
  const { data: products, loading } = useFetch(() => productsApi.getAll(), []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Productos</h1>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-muted-foreground text-sm p-6">Cargando…</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Curso</TableHead>
                    <TableHead>Modalidad</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Inicio</TableHead>
                    <TableHead>Fin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(products || []).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.coursename}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {p.modalidad}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        S/ {Number(p.precio).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{p.duracion_semanas} sem.</TableCell>
                      <TableCell className="text-sm">
                        {p.fecha_inicio ? new Date(p.fecha_inicio).toLocaleDateString("es-PE") : "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {p.fecha_finalizacion ? new Date(p.fecha_finalizacion).toLocaleDateString("es-PE") : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(products || []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No hay productos.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

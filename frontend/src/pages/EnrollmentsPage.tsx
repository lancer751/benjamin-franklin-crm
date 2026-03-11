import { enrollmentsApi } from "@/api/enrollments";
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

const statusColor: Record<string, string> = {
  activo: "bg-success text-success-foreground",
  retirado: "bg-destructive text-destructive-foreground",
  completado: "bg-primary text-primary-foreground",
};

export default function EnrollmentsPage() {
  const { data: enrollments, loading } = useFetch(() => enrollmentsApi.getAll(), []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Matrículas</h1>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-muted-foreground text-sm p-6">Cargando…</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Matrícula</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(enrollments || []).map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.customer}</TableCell>
                      <TableCell>{e.coursename}</TableCell>
                      <TableCell>
                        <Badge className={statusColor[e.status] || ""}>{e.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(e.enrollment_date).toLocaleDateString("es-PE")}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(enrollments || []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No hay matrículas.</TableCell>
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

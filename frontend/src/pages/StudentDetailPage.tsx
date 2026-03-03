import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  BookOpen,
  Hash,
  Pencil,
  UserX,
  UserCheck,
  Receipt,
  Plus,
} from "lucide-react";
import { mockStudents, mockEnrollments, mockCourses, mockPayments } from "@/lib/mock-data";
import { EnrollmentStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

function StatusBadge({ status }: { status: EnrollmentStatus }) {
  const map: Record<string, { label: string; className: string }> = {
    ENROLLED:     { label: "Matriculado",   className: "bg-success/15 text-success border-success/20" },
    WAITING_LIST: { label: "En espera",     className: "bg-warning/15 text-warning border-warning/20" },
    PENDING:      { label: "Pendiente",     className: "bg-muted text-muted-foreground border-border" },
    APPROVED:     { label: "Aprobado",      className: "bg-primary/10 text-primary border-primary/20" },
    REJECTED:     { label: "Rechazado",     className: "bg-destructive/15 text-destructive border-destructive/20" },
    SUSPENDED:    { label: "Suspendido",    className: "bg-warning/15 text-warning border-warning/20" },
    COMPLETED:    { label: "Completado",    className: "bg-success/15 text-success border-success/20" },
  };
  const cfg = map[status] ?? { label: status, className: "bg-muted text-muted-foreground" };
  return <Badge className={`${cfg.className} border text-xs`}>{cfg.label}</Badge>;
}

function PaymentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    PAID: { label: "Pagado", className: "bg-success/15 text-success border-success/20" },
    PENDING: { label: "Pendiente", className: "bg-warning/15 text-warning border-warning/20" },
    FAILED: { label: "Fallido", className: "bg-destructive/15 text-destructive border-destructive/20" },
    REFUNDED: { label: "Reembolsado", className: "bg-muted text-muted-foreground border-border" },
  };
  const cfg = map[status] ?? { label: status, className: "bg-muted text-muted-foreground" };
  return <Badge className={`${cfg.className} border text-xs`}>{cfg.label}</Badge>;
}

const StudentDetailPage = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const { toast } = useToast();
  const student = mockStudents.find((s) => String(s.id) === studentId);

  const [isActive, setIsActive] = useState(true);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: student?.firstName ?? "",
    lastName: student?.lastName ?? "",
    email: student?.email ?? "",
  });
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [enrollCourseId, setEnrollCourseId] = useState("");

  if (!student) {
    return (
      <div className="space-y-6">
        <Link to="/students" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Volver a Estudiantes
        </Link>
        <p className="text-muted-foreground">Estudiante no encontrado.</p>
      </div>
    );
  }

  const studentEnrollments = mockEnrollments.filter((e) => e.studentId === student.id);
  const enrolledCourses = studentEnrollments.map((enrollment) => {
    const course = mockCourses.find((c) => c.id === enrollment.courseId);
    return { enrollment, course };
  });

  const studentPayments = mockPayments.filter((p) => p.studentId === student.id);
  const enrolledCourseIds = studentEnrollments.map((e) => e.courseId);
  const availableCourses = mockCourses.filter((c) => !enrolledCourseIds.includes(c.id));

  const handleEditSave = () => {
    toast({ title: "Estudiante actualizado", description: `${editForm.firstName} ${editForm.lastName} actualizado.` });
    setEditOpen(false);
  };

  const handleDeactivate = () => {
    setIsActive(!isActive);
    toast({
      title: isActive ? "Estudiante desactivado" : "Estudiante reactivado",
      description: `${student.fullName} fue ${isActive ? "desactivado" : "reactivado"}.`,
    });
    setDeactivateOpen(false);
  };

  const handleManualEnroll = () => {
    if (!enrollCourseId) return;
    const course = mockCourses.find((c) => String(c.id) === enrollCourseId);
    toast({ title: "Matrícula manual", description: `${student.fullName} matriculado en ${course?.name ?? "curso"}.` });
    setEnrollOpen(false);
    setEnrollCourseId("");
  };

  return (
    <div className="space-y-6">
      <Link to="/students" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Volver a Estudiantes
      </Link>

      {/* Student Profile Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${isActive ? "bg-primary/10" : "bg-destructive/10"}`}>
            <User className={`h-7 w-7 ${isActive ? "text-primary" : "text-destructive"}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-3xl font-bold text-foreground">{student.fullName}</h1>
              {!isActive && <Badge className="bg-destructive/15 text-destructive border-destructive/20 border text-xs">Desactivado</Badge>}
            </div>
            <p className="text-sm text-muted-foreground font-mono">@{student.username}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setEditOpen(true)}>
            <Pencil className="h-3.5 w-3.5" /> Editar
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setEnrollOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Matricular
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={`gap-1.5 ${isActive ? "text-destructive border-destructive/30 hover:bg-destructive/10" : "text-success border-success/30 hover:bg-success/10"}`}
            onClick={() => setDeactivateOpen(true)}
          >
            {isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
            {isActive ? "Desactivar" : "Reactivar"}
          </Button>
        </div>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-lg">Información Personal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground">{student.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">DNI</p>
                <p className="text-sm font-medium text-foreground">{student.dni ?? "No registrado"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Teléfono</p>
                <p className="text-sm font-medium text-foreground">{student.phone ?? "No registrado"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Moodle ID</p>
                <p className="text-sm font-medium text-foreground">{student.moodleId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Registrado</p>
                <p className="text-sm font-medium text-foreground">{new Date(student.createdAt).toLocaleDateString("es-ES")}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Courses */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <BookOpen className="h-5 w-5 text-primary" />
            Cursos Matriculados ({enrolledCourses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {enrolledCourses.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Este estudiante no está matriculado en ningún curso.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {enrolledCourses.map(({ enrollment, course }) => (
                <Link key={enrollment.id} to={`/courses/${enrollment.courseId}`}>
                  <div className="group flex flex-col gap-2 rounded-lg border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <StatusBadge status={enrollment.status} />
                    </div>
                    <p className="font-semibold text-foreground text-sm leading-snug">{course?.name ?? "Curso desconocido"}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Inscrito: {new Date(enrollment.createdAt).toLocaleDateString("es-ES")}
                      </span>
                      {course && <Badge variant="outline" className="text-xs">{course.category}</Badge>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <Receipt className="h-5 w-5 text-primary" />
            Historial de Pagos ({studentPayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {studentPayments.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No hay pagos registrados.</p>
          ) : (
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Curso</TableHead>
                    <TableHead>Transacción</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentPayments.map((p) => {
                    const course = mockCourses.find((c) => c.id === p.courseId);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="text-sm">{course?.name ?? "—"}</TableCell>
                        <TableCell className="font-mono text-xs">{p.transactionId}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{p.paymentMethod}</Badge></TableCell>
                        <TableCell><PaymentStatusBadge status={p.paymentStatus} /></TableCell>
                        <TableCell className="font-medium text-sm">S/ {p.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-sm">{new Date(p.paymentDate).toLocaleDateString("es-PE")}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Estudiante</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={editForm.firstName} onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Apellidos</Label>
                <Input value={editForm.lastName} onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Enroll Dialog */}
      <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Matrícula Manual</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">Selecciona un curso para matricular a {student.fullName}.</p>
            <Select value={enrollCourseId} onValueChange={setEnrollCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar curso" />
              </SelectTrigger>
              <SelectContent>
                {availableCourses.length === 0 ? (
                  <SelectItem value="none" disabled>Ya está en todos los cursos</SelectItem>
                ) : (
                  availableCourses.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnrollOpen(false)}>Cancelar</Button>
            <Button onClick={handleManualEnroll} disabled={!enrollCourseId}>Matricular</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation */}
      <AlertDialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isActive ? "¿Desactivar estudiante?" : "¿Reactivar estudiante?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isActive
                ? `Esto desactivará la cuenta de ${student.fullName}. No podrá acceder a los cursos hasta ser reactivado.`
                : `Esto reactivará la cuenta de ${student.fullName} y restaurará su acceso a los cursos.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className={isActive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-success text-success-foreground hover:bg-success/90"}
              onClick={handleDeactivate}
            >
              {isActive ? "Desactivar" : "Reactivar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StudentDetailPage;

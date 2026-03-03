import {
  Course,
  Student,
  Enrollment,
  CourseStudent,
  CourseWithStats,
  PaymentTransaction,
  ManagedCourse,
} from "./types";

// ─────────────────────────────────────────────────────────────
// COURSES
// ─────────────────────────────────────────────────────────────
export const mockCourses: Course[] = [
  {
    id: 1,
    moodleCourseId: 101,
    name: "Desarrollo Web Full Stack",
    description:
      "Aprende HTML, CSS, JavaScript, React y Node.js desde cero hasta nivel avanzado. Incluye proyectos reales y despliegue en la nube.",
    startDate: "2025-02-01",
    endDate: "2025-07-31",
    category: "Tecnología",
    createdAt: "2025-01-10T08:00:00Z",
    updatedAt: "2025-01-10T08:00:00Z",
  },
  {
    id: 2,
    moodleCourseId: 102,
    name: "Diseño Gráfico y UX",
    description:
      "Fundamentos del diseño visual, tipografía, color y usabilidad. Herramientas: Figma, Adobe XD e Illustrator.",
    startDate: "2025-03-01",
    endDate: "2025-08-31",
    category: "Diseño",
    createdAt: "2025-01-15T09:00:00Z",
    updatedAt: "2025-01-15T09:00:00Z",
  },
  {
    id: 3,
    moodleCourseId: 103,
    name: "Matemáticas para Ingeniería",
    description:
      "Cálculo diferencial e integral, álgebra lineal, estadística y probabilidad orientadas a aplicaciones de ingeniería.",
    startDate: "2025-02-15",
    endDate: "2025-06-30",
    category: "Ciencias",
    createdAt: "2025-01-20T10:00:00Z",
    updatedAt: "2025-01-20T10:00:00Z",
  },
  {
    id: 4,
    moodleCourseId: 104,
    name: "Inglés Nivel Intermedio B2",
    description:
      "Comprensión lectora y auditiva, expresión oral y escrita orientadas a entornos profesionales. Preparación certificación Cambridge.",
    startDate: "2025-01-20",
    endDate: "2025-06-20",
    category: "Idiomas",
    createdAt: "2025-01-05T11:00:00Z",
    updatedAt: "2025-01-05T11:00:00Z",
  },
  {
    id: 5,
    moodleCourseId: 105,
    name: "Administración de Empresas",
    description:
      "Gestión estratégica, finanzas empresariales, marketing digital y liderazgo de equipos en entornos competitivos.",
    startDate: "2025-04-01",
    endDate: "2025-09-30",
    category: "Negocios",
    createdAt: "2025-02-01T12:00:00Z",
    updatedAt: "2025-02-01T12:00:00Z",
  },
  {
    id: 6,
    moodleCourseId: 106,
    name: "Ciberseguridad Fundamentos",
    description:
      "Principios de seguridad informática, análisis de vulnerabilidades, criptografía y respuesta ante incidentes.",
    startDate: "2025-03-15",
    endDate: "2025-08-15",
    category: "Tecnología",
    createdAt: "2025-02-10T08:30:00Z",
    updatedAt: "2025-02-10T08:30:00Z",
  },
];

// ─────────────────────────────────────────────────────────────
// STUDENTS
// ─────────────────────────────────────────────────────────────
export const mockStudents: Student[] = [
  {
    id: 1,
    moodleId: 2001,
    firstName: "Carlos",
    lastName: "García López",
    fullName: "Carlos García López",
    username: "cgarcia",
    email: "carlos.garcia@ejemplo.es",
    dni: "12345678A",
    phone: "+34 612 345 678",
    status: "ENROLLED",
    createdAt: "2025-01-15T09:00:00Z",
    updatedAt: "2025-01-15T09:00:00Z",
  },
  {
    id: 2,
    moodleId: 2002,
    firstName: "María",
    lastName: "Fernández Ruiz",
    fullName: "María Fernández Ruiz",
    username: "mfernandez",
    email: "maria.fernandez@ejemplo.es",
    dni: "23456789B",
    phone: "+34 623 456 789",
    status: "ENROLLED",
    createdAt: "2025-01-20T10:00:00Z",
    updatedAt: "2025-01-20T10:00:00Z",
  },
  {
    id: 3,
    moodleId: 2003,
    firstName: "Alejandro",
    lastName: "Martínez Sánchez",
    fullName: "Alejandro Martínez Sánchez",
    username: "amartinez",
    email: "alejandro.martinez@ejemplo.es",
    dni: "34567890C",
    phone: "+34 634 567 890",
    status: "WAITING_LIST",
    createdAt: "2025-02-01T11:00:00Z",
    updatedAt: "2025-02-01T11:00:00Z",
  },
  {
    id: 4,
    moodleId: 2004,
    firstName: "Laura",
    lastName: "Pérez Gómez",
    fullName: "Laura Pérez Gómez",
    username: "lperez",
    email: "laura.perez@ejemplo.es",
    dni: "45678901D",
    phone: "+34 645 678 901",
    status: "ENROLLED",
    createdAt: "2025-02-05T08:30:00Z",
    updatedAt: "2025-02-05T08:30:00Z",
  },
  {
    id: 5,
    moodleId: 2005,
    firstName: "Javier",
    lastName: "Rodríguez Díaz",
    fullName: "Javier Rodríguez Díaz",
    username: "jrodriguez",
    email: "javier.rodriguez@ejemplo.es",
    dni: "56789012E",
    phone: "+34 656 789 012",
    status: "WAITING_LIST",
    createdAt: "2025-02-10T09:00:00Z",
    updatedAt: "2025-02-10T09:00:00Z",
  },
  {
    id: 6,
    moodleId: 2006,
    firstName: "Ana",
    lastName: "López Torres",
    fullName: "Ana López Torres",
    username: "alopez",
    email: "ana.lopez@ejemplo.es",
    dni: "67890123F",
    phone: "+34 667 890 123",
    status: "ENROLLED",
    createdAt: "2025-02-12T10:15:00Z",
    updatedAt: "2025-02-12T10:15:00Z",
  },
  {
    id: 7,
    moodleId: 2007,
    firstName: "Pablo",
    lastName: "Sánchez Moreno",
    fullName: "Pablo Sánchez Moreno",
    username: "psanchez",
    email: "pablo.sanchez@ejemplo.es",
    dni: "78901234G",
    phone: "+34 678 901 234",
    status: "ENROLLED",
    createdAt: "2025-02-14T08:00:00Z",
    updatedAt: "2025-02-14T08:00:00Z",
  },
  {
    id: 8,
    moodleId: 2008,
    firstName: "Sofía",
    lastName: "González Castro",
    fullName: "Sofía González Castro",
    username: "sgonzalez",
    email: "sofia.gonzalez@ejemplo.es",
    dni: "89012345H",
    phone: "+34 689 012 345",
    status: "PENDING",
    createdAt: "2025-02-16T11:30:00Z",
    updatedAt: "2025-02-16T11:30:00Z",
  },
  {
    id: 9,
    moodleId: 2009,
    firstName: "Diego",
    lastName: "Navarro Flores",
    fullName: "Diego Navarro Flores",
    username: "dnavarro",
    email: "diego.navarro@ejemplo.es",
    dni: "90123456I",
    phone: "+34 690 123 456",
    status: "ENROLLED",
    createdAt: "2025-02-17T09:45:00Z",
    updatedAt: "2025-02-17T09:45:00Z",
  },
  {
    id: 10,
    moodleId: 2010,
    firstName: "Lucía",
    lastName: "Jiménez Vega",
    fullName: "Lucía Jiménez Vega",
    username: "ljimenez",
    email: "lucia.jimenez@ejemplo.es",
    dni: "01234567J",
    phone: "+34 601 234 567",
    status: "WAITING_LIST",
    createdAt: "2025-02-18T10:00:00Z",
    updatedAt: "2025-02-18T10:00:00Z",
  },
  {
    id: 11,
    moodleId: 2011,
    firstName: "Rafael",
    lastName: "Morales Ramos",
    fullName: "Rafael Morales Ramos",
    username: "rmorales",
    email: "rafael.morales@ejemplo.es",
    dni: "11223344K",
    phone: "+34 611 223 344",
    status: "ENROLLED",
    createdAt: "2025-02-19T08:20:00Z",
    updatedAt: "2025-02-19T08:20:00Z",
  },
  {
    id: 12,
    moodleId: 2012,
    firstName: "Elena",
    lastName: "Herrera Campos",
    fullName: "Elena Herrera Campos",
    username: "eherrera",
    email: "elena.herrera@ejemplo.es",
    dni: "22334455L",
    phone: "+34 622 334 455",
    status: "APPROVED",
    createdAt: "2025-02-19T09:10:00Z",
    updatedAt: "2025-02-19T09:10:00Z",
  },
];

// ─────────────────────────────────────────────────────────────
// ENROLLMENTS — student ↔ course relationships
// ─────────────────────────────────────────────────────────────
export const mockEnrollments: Enrollment[] = [
  // Curso 1 – Desarrollo Web Full Stack
  { id: 1,  studentId: 1,  courseId: 1, status: "ENROLLED",      moodleEnrollmentStatus: "ENROLLED",     courseAccessStatus: "ACTIVE",    createdAt: "2025-01-15T09:00:00Z", updatedAt: "2025-01-16T09:00:00Z" },
  { id: 2,  studentId: 6,  courseId: 1, status: "ENROLLED",      moodleEnrollmentStatus: "ENROLLED",     courseAccessStatus: "ACTIVE",    createdAt: "2025-02-12T10:15:00Z", updatedAt: "2025-02-13T10:15:00Z" },
  { id: 3,  studentId: 7,  courseId: 1, status: "ENROLLED",      moodleEnrollmentStatus: "ENROLLED",     courseAccessStatus: "ACTIVE",    createdAt: "2025-02-14T08:00:00Z", updatedAt: "2025-02-15T08:00:00Z" },
  { id: 4,  studentId: 3,  courseId: 1, status: "WAITING_LIST",  moodleEnrollmentStatus: "NOT_ENROLLED", courseAccessStatus: "DISABLED",  createdAt: "2025-02-01T11:00:00Z", updatedAt: "2025-02-01T11:00:00Z" },
  { id: 5,  studentId: 10, courseId: 1, status: "WAITING_LIST",  moodleEnrollmentStatus: "NOT_ENROLLED", courseAccessStatus: "DISABLED",  createdAt: "2025-02-18T10:00:00Z", updatedAt: "2025-02-18T10:00:00Z" },

  // Curso 2 – Diseño Gráfico y UX
  { id: 6,  studentId: 2,  courseId: 2, status: "ENROLLED",      moodleEnrollmentStatus: "ENROLLED",     courseAccessStatus: "ACTIVE",    createdAt: "2025-01-20T10:00:00Z", updatedAt: "2025-01-21T10:00:00Z" },
  { id: 7,  studentId: 4,  courseId: 2, status: "ENROLLED",      moodleEnrollmentStatus: "ENROLLED",     courseAccessStatus: "ACTIVE",    createdAt: "2025-02-05T08:30:00Z", updatedAt: "2025-02-06T08:30:00Z" },
  { id: 8,  studentId: 9,  courseId: 2, status: "ENROLLED",      moodleEnrollmentStatus: "ENROLLED",     courseAccessStatus: "ACTIVE",    createdAt: "2025-02-17T09:45:00Z", updatedAt: "2025-02-18T09:45:00Z" },
  { id: 9,  studentId: 12, courseId: 2, status: "APPROVED",      moodleEnrollmentStatus: "NOT_ENROLLED", courseAccessStatus: "DISABLED",  createdAt: "2025-02-19T09:10:00Z", updatedAt: "2025-02-19T09:10:00Z" },

  // Curso 3 – Matemáticas para Ingeniería
  { id: 10, studentId: 1,  courseId: 3, status: "ENROLLED",      moodleEnrollmentStatus: "ENROLLED",     courseAccessStatus: "ACTIVE",    createdAt: "2025-02-01T09:00:00Z", updatedAt: "2025-02-02T09:00:00Z" },
  { id: 11, studentId: 5,  courseId: 3, status: "WAITING_LIST",  moodleEnrollmentStatus: "NOT_ENROLLED", courseAccessStatus: "DISABLED",  createdAt: "2025-02-10T09:00:00Z", updatedAt: "2025-02-10T09:00:00Z" },
  { id: 12, studentId: 8,  courseId: 3, status: "PENDING",       moodleEnrollmentStatus: "NOT_ENROLLED", courseAccessStatus: "DISABLED",  createdAt: "2025-02-16T11:30:00Z", updatedAt: "2025-02-16T11:30:00Z" },
  { id: 13, studentId: 11, courseId: 3, status: "ENROLLED",      moodleEnrollmentStatus: "ENROLLED",     courseAccessStatus: "ACTIVE",    createdAt: "2025-02-19T08:20:00Z", updatedAt: "2025-02-20T08:20:00Z" },

  // Curso 4 – Inglés Nivel Intermedio B2
  { id: 14, studentId: 4,  courseId: 4, status: "ENROLLED",      moodleEnrollmentStatus: "ENROLLED",     courseAccessStatus: "ACTIVE",    createdAt: "2025-01-22T08:00:00Z", updatedAt: "2025-01-23T08:00:00Z" },
  { id: 15, studentId: 6,  courseId: 4, status: "ENROLLED",      moodleEnrollmentStatus: "ENROLLED",     courseAccessStatus: "ACTIVE",    createdAt: "2025-02-13T10:00:00Z", updatedAt: "2025-02-14T10:00:00Z" },
  { id: 16, studentId: 2,  courseId: 4, status: "ENROLLED",      moodleEnrollmentStatus: "SUSPENDED",    courseAccessStatus: "ACTIVE",    createdAt: "2025-01-25T09:00:00Z", updatedAt: "2025-02-01T09:00:00Z" },
  { id: 17, studentId: 10, courseId: 4, status: "WAITING_LIST",  moodleEnrollmentStatus: "NOT_ENROLLED", courseAccessStatus: "DISABLED",  createdAt: "2025-02-18T10:30:00Z", updatedAt: "2025-02-18T10:30:00Z" },

  // Curso 5 – Administración de Empresas
  { id: 18, studentId: 5,  courseId: 5, status: "WAITING_LIST",  moodleEnrollmentStatus: "NOT_ENROLLED", courseAccessStatus: "DISABLED",  createdAt: "2025-02-10T09:30:00Z", updatedAt: "2025-02-10T09:30:00Z" },
  { id: 19, studentId: 7,  courseId: 5, status: "ENROLLED",      moodleEnrollmentStatus: "ENROLLED",     courseAccessStatus: "ACTIVE",    createdAt: "2025-02-15T08:00:00Z", updatedAt: "2025-02-16T08:00:00Z" },
  { id: 20, studentId: 11, courseId: 5, status: "ENROLLED",      moodleEnrollmentStatus: "ENROLLED",     courseAccessStatus: "ACTIVE",    createdAt: "2025-02-19T08:00:00Z", updatedAt: "2025-02-20T08:00:00Z" },
  { id: 21, studentId: 3,  courseId: 5, status: "WAITING_LIST",  moodleEnrollmentStatus: "NOT_ENROLLED", courseAccessStatus: "DISABLED",  createdAt: "2025-02-02T11:00:00Z", updatedAt: "2025-02-02T11:00:00Z" },

  // Curso 6 – Ciberseguridad Fundamentos
  { id: 22, studentId: 9,  courseId: 6, status: "ENROLLED",      moodleEnrollmentStatus: "ENROLLED",     courseAccessStatus: "ACTIVE",    createdAt: "2025-02-17T10:00:00Z", updatedAt: "2025-02-18T10:00:00Z" },
  { id: 23, studentId: 12, courseId: 6, status: "APPROVED",      moodleEnrollmentStatus: "NOT_ENROLLED", courseAccessStatus: "DISABLED",  createdAt: "2025-02-19T09:15:00Z", updatedAt: "2025-02-19T09:15:00Z" },
  { id: 24, studentId: 8,  courseId: 6, status: "PENDING",       moodleEnrollmentStatus: "NOT_ENROLLED", courseAccessStatus: "DISABLED",  createdAt: "2025-02-16T12:00:00Z", updatedAt: "2025-02-16T12:00:00Z" },
];

// ─────────────────────────────────────────────────────────────
// Helper – build CourseStudent rows for a given course
// ─────────────────────────────────────────────────────────────
export function getCourseStudents(courseId: number): CourseStudent[] {
  return mockEnrollments
    .filter((e) => e.courseId === courseId)
    .map((e) => {
      const student = mockStudents.find((s) => s.id === e.studentId)!;
      return {
        ...student,
        enrollmentId: e.id,
        enrollmentStatus: e.status,
        moodleEnrollmentStatus: e.moodleEnrollmentStatus,
        courseAccessStatus: e.courseAccessStatus,
      };
    });
}

// ─────────────────────────────────────────────────────────────
// Helper – build CourseWithStats list
// ─────────────────────────────────────────────────────────────
export function getCoursesWithStats(): CourseWithStats[] {
  return mockCourses.map((course) => {
    const enrollments = mockEnrollments.filter((e) => e.courseId === course.id);
    return {
      ...course,
      studentCount: enrollments.length,
      enrolledCount: enrollments.filter((e) => e.status === "ENROLLED").length,
      waitingCount: enrollments.filter((e) => e.status === "WAITING_LIST").length,
    };
  });
}

// Re-export COURSES for EnrollPage backward compat
export const COURSES = mockCourses.map((c) => ({ id: String(c.id), name: c.name }));

// ─────────────────────────────────────────────────────────────
// PAYMENT TRANSACTIONS — mock Culqi data
// ─────────────────────────────────────────────────────────────
const methods: PaymentTransaction["paymentMethod"][] = ["CARD", "YAPE", "TRANSFER", "CASH"];
const statuses: PaymentTransaction["paymentStatus"][] = ["PAID", "PENDING", "FAILED", "REFUNDED"];

export const mockPayments: PaymentTransaction[] = mockEnrollments.map((e, i) => {
  const rng = (e.studentId * 7 + e.courseId * 13 + i) % 100;
  const status = rng < 65 ? "PAID" : rng < 80 ? "PENDING" : rng < 92 ? "FAILED" : "REFUNDED";
  const method = methods[(e.studentId + e.courseId) % methods.length];
  const amount = [149.90, 199.90, 249.90, 99.90, 179.90, 299.90][e.courseId - 1] ?? 149.90;
  return {
    id: i + 1,
    enrollmentId: e.id,
    studentId: e.studentId,
    courseId: e.courseId,
    transactionId: `CQ-${(1000000 + e.id * 1234 + i * 567).toString(36).toUpperCase()}`,
    paymentMethod: method,
    paymentStatus: status,
    amount,
    currency: "PEN" as const,
    paymentDate: e.createdAt,
    createdAt: e.createdAt,
  };
});

// ─────────────────────────────────────────────────────────────
// MANAGED COURSES — course management with price/status
// ─────────────────────────────────────────────────────────────
export const mockManagedCourses: ManagedCourse[] = mockCourses.map((c, i) => ({
  ...c,
  price: [149.90, 199.90, 249.90, 99.90, 179.90, 299.90][i] ?? 149.90,
  currency: "PEN" as const,
  status: i === 4 ? "INACTIVE" : "ACTIVE",
  imageUrl: null,
}));

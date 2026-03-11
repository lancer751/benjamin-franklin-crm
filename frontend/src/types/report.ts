export interface SalesReport {
  filters: {
    startDate: string;
    endDate: string;
    courseId: string | null;
    paymentMethod: string | null;
  };
  summary: {
    totalRevenue: number;
    totalPayments: number;
    totalCompletedEnrollments: number;
    uniqueCoursesWithRevenue: number;
  };
  studentsPerCourse: { cursoId: string; cursoNombre: string; count: number }[];
  revenuePerCourse: { cursoId: string; cursoNombre: string; totalRevenue: number }[];
  revenuePerMonth: { month: string; totalRevenue: number }[];
  paymentMethodDistribution: { method: string; count: number; totalAmount: number }[];
}

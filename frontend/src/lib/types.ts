// ──────────────────────────────────────────────
// Enrollment status — mirrors backend EnrollmentStatus enum
// ──────────────────────────────────────────────
export type EnrollmentStatus =
  | "PENDING"
  | "WAITING_LIST"
  | "APPROVED"
  | "ENROLLED"
  | "REJECTED"
  | "CANCELLED"
  | "DROPPED"
  | "COMPLETED"
  | "SUSPENDED";

export type MoodleEnrollmentStatus = "NOT_ENROLLED" | "ENROLLED" | "SUSPENDED";
export type CourseAccessStatus = "ACTIVE" | "DISABLED";

// ──────────────────────────────────────────────
// Student — mirrors backend Student model
// ──────────────────────────────────────────────
export interface Student {
  id: number;
  moodleId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  email: string;
  dni: string | null;
  phone: string | null;
  status: EnrollmentStatus;
  createdAt: string;
  updatedAt: string;
}

// ──────────────────────────────────────────────
// Course — mirrors backend Course model
// ──────────────────────────────────────────────
export interface Course {
  id: number;
  moodleCourseId: number;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

// ──────────────────────────────────────────────
// Enrollment — mirrors backend Enrollment model
// ──────────────────────────────────────────────
export interface Enrollment {
  id: number;
  studentId: number;
  courseId: number;
  status: EnrollmentStatus;
  moodleEnrollmentStatus: MoodleEnrollmentStatus;
  courseAccessStatus: CourseAccessStatus;
  createdAt: string;
  updatedAt: string;
}

// ──────────────────────────────────────────────
// Derived / view types used by UI
// ──────────────────────────────────────────────

/** Student row inside a Course Detail page */
export interface CourseStudent extends Student {
  enrollmentId: number;
  enrollmentStatus: EnrollmentStatus;
  moodleEnrollmentStatus: MoodleEnrollmentStatus;
  courseAccessStatus: CourseAccessStatus;
}

/** Course card enriched with student count */
export interface CourseWithStats extends Course {
  studentCount: number;
  enrolledCount: number;
  waitingCount: number;
}

// ──────────────────────────────────────────────
// Payment types (Culqi mock)
// ──────────────────────────────────────────────
export type PaymentMethod = "CARD" | "YAPE" | "TRANSFER" | "CASH";
export type PaymentStatus = "PAID" | "PENDING" | "FAILED" | "REFUNDED";
export type Currency = "PEN" | "USD";

export interface PaymentTransaction {
  id: number;
  enrollmentId: number;
  studentId: number;
  courseId: number;
  transactionId: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  amount: number;
  currency: Currency;
  paymentDate: string;
  createdAt: string;
}

// ──────────────────────────────────────────────
// Course management extensions
// ──────────────────────────────────────────────
export type CourseStatus = "ACTIVE" | "INACTIVE";

export interface ManagedCourse extends Course {
  price: number;
  currency: Currency;
  status: CourseStatus;
  imageUrl: string | null;
}

// ──────────────────────────────────────────────
// Legacy alias kept for backward-compat (EnrollPage)
// ──────────────────────────────────────────────
export const COURSES: { id: string; name: string }[] = [];

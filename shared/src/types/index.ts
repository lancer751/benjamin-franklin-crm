export type ErrorResponse = {
  success: false;
  error: string;
  isFormError?: boolean;
};

export * from "../schemas/campaing.schema"
export * from "../schemas/professors/professor.schema"
export * from "../schemas/course.schema"
export * from "../schemas/lead.schema"
export * from "../schemas/order.schema"
export * from "../schemas/payment.schema"
export * from "../schemas/product.schema"
export * from "../schemas/users/users.index"
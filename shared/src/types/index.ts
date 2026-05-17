export type ErrorResponse = {
  success: false;
  error: string;
  isFormError?: boolean;
};

export * from "../schemas/users/users.index"
export * from "../schemas/campaing.schema"
export * from "../schemas/academic/academic.index"
export * from "../schemas/lead.schema"
export * from "../schemas/order.schema"
export * from "../schemas/payment.schema"
export * from "../schemas/products/product.index"
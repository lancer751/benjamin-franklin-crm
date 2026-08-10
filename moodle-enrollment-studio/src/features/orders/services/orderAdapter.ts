import type {
  AttendanceMode,
  OrderDetailResponse,
  OrderDisplayItem,
  OrderLeadSummary,
  OrderListResponse,
  OrderPayment,
  OrderPaymentPlan,
  OrderResponse,
  OrderSeller,
  OrderStatus,
  PaymentModality,
} from "../types";
import { ORDER_STATUSES } from "../orderStatus";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => typeof value === "object" && value !== null;
const text = (value: unknown): string => typeof value === "string" ? value : "";
const nullableText = (value: unknown): string | null => typeof value === "string" ? value : null;
const number = (value: unknown, fallback = 0): number => Number.isFinite(Number(value)) ? Number(value) : fallback;
const isOrderStatus = (value: unknown): value is OrderStatus => ORDER_STATUSES.some((status) => status === value);
const isAttendanceMode = (value: unknown): value is AttendanceMode => ["VIRTUAL", "PRESENCIAL", "HEREDADO"].includes(text(value));
const isPaymentModality = (value: unknown): value is PaymentModality => ["FULL", "INSTALLMENTS"].includes(text(value));

const cleanName = (person: { first_name?: string | null; last_name?: string | null } | null): string =>
  [person?.first_name, person?.last_name]
    .filter((part): part is string => typeof part === "string" && Boolean(part.trim()))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

function adaptLead(value: unknown): OrderLeadSummary {
  const lead = isRecord(value) ? value : {};
  const phones = Array.isArray(lead.phones)
    ? lead.phones.flatMap((phone) => isRecord(phone) && text(phone.number) ? [{
      number: text(phone.number),
      type: text(phone.type) || undefined,
      isPrincipal: phone.isPrincipal === true || phone.is_principal === true,
    }] : [])
    : [];
  return {
    id: text(lead.id),
    first_name: nullableText(lead.first_name),
    middle_name: nullableText(lead.middle_name),
    last_name: nullableText(lead.last_name),
    email: nullableText(lead.email),
    dni: nullableText(lead.dni),
    phones,
  };
}

function adaptPaymentPlan(value: unknown): OrderPaymentPlan | null {
  if (!isRecord(value)) return null;
  return {
    id: text(value.id) || undefined,
    total_installments: number(value.total_installments),
    total_amount: text(value.total_amount) || number(value.total_amount).toFixed(2),
    start_date: text(value.start_date),
    status: text(value.status) || "PENDING",
    installments: Array.isArray(value.installments) ? value.installments.flatMap((item) => isRecord(item) ? [{
      id: text(item.id) || undefined,
      number: number(item.number),
      due_date: text(item.due_date),
      due_amount: text(item.due_amount) || number(item.due_amount).toFixed(2),
      status: text(item.status) || "PENDING",
      payments: Array.isArray(item.payments) ? item.payments.flatMap((payment) =>
        isRecord(payment) && text(payment.id) ? [{
          id: text(payment.id),
          payment_status: text(payment.payment_status),
          ...(text(payment.payment_date) && { payment_date: text(payment.payment_date) }),
        }] : []) : [],
    }] : []) : [],
  };
}

function adaptOrderDetail(value: unknown): OrderDetailResponse | null {
  if (!isRecord(value)) return null;
  const product = isRecord(value.product) ? value.product : {};
  const category = isRecord(product.category) ? product.category : null;
  const discountCode = isRecord(value.discountCode) ? value.discountCode : null;
  const paymentPlan = adaptPaymentPlan(value.paymentPlan);
  const productId = text(value.product_id) || text(product.id);
  if (!productId) return null;
  return {
    id: text(value.id) || undefined,
    product_id: productId,
    price: text(value.price) || number(value.price).toFixed(2),
    discount_code: text(value.discount_code) || text(discountCode?.code) || null,
    ...(isAttendanceMode(value.attendance_mode) && { attendance_mode: value.attendance_mode }),
    ...(isPaymentModality(value.payment_modality) && { payment_modality: value.payment_modality }),
    product: {
      id: productId,
      name: text(product.name) || "Producto no disponible",
      image_url: nullableText(product.image_url),
      installments_min_number: number(product.installments_min_number),
      installments_max_number: number(product.installments_max_number),
      enrollment_fee: text(product.enrollment_fee) || number(product.enrollment_fee).toFixed(2),
      edition: isRecord(product.edition) ? { modality: nullableText(product.edition.modality) } : null,
      category: category ? { name: nullableText(category.name) } : null,
    },
    paymentPlan,
  };
}

function adaptDisplayItem(value: unknown): OrderDisplayItem | null {
  if (!isRecord(value)) return null;
  const product = isRecord(value.product) ? value.product : null;
  const category = product && isRecord(product.category) ? product.category : null;
  const discountCode = isRecord(value.discountCode) ? value.discountCode : null;
  const productId = text(value.product_id) || text(product?.id);
  if (!productId) return null;

  return {
    detailId: text(value.id),
    productId,
    productName: text(product?.name) || "Producto no disponible",
    categoryName: text(category?.name) || "Sin categoría",
    imageUrl: nullableText(product?.image_url),
    basePrice: text(value.base_price) || number(value.base_price).toFixed(2),
    discountAmount: text(value.discount_amount) || number(value.discount_amount).toFixed(2),
    finalPrice: text(value.price) || number(value.price).toFixed(2),
    paymentModality: isPaymentModality(value.payment_modality) ? value.payment_modality : null,
    discountCode: text(discountCode?.code) || text(value.discount_code) || null,
    paymentPlan: adaptPaymentPlan(value.paymentPlan),
    attendanceMode: isAttendanceMode(value.attendance_mode) ? value.attendance_mode : null,
    editionModality: product && isRecord(product.edition) ? nullableText(product.edition.modality) : null,
    enrollmentFee: text(product?.enrollment_fee) || number(product?.enrollment_fee).toFixed(2),
    installmentsMin: number(product?.installments_min_number, 1),
    installmentsMax: number(product?.installments_max_number, 1),
  };
}

function adaptPayment(value: unknown): OrderPayment | null {
  if (!isRecord(value)) return null;
  return {
    id: text(value.id) || undefined,
    amount: text(value.amount) || number(value.amount).toFixed(2),
    payment_method: text(value.payment_method),
    payment_date: text(value.payment_date),
    payment_status: text(value.payment_status) || undefined,
    type: text(value.type) || undefined,
    currency: nullableText(value.currency),
    transaccion_id: nullableText(value.transaccion_id),
    payment_receipt: nullableText(value.payment_receipt),
    scheduled_payment_id: nullableText(value.scheduled_payment_id),
    order_detail_id: nullableText(value.order_detail_id),
  };
}

function adaptPerson(value: unknown) {
  if (!isRecord(value) || !text(value.id)) return null;
  return {
    id: text(value.id),
    first_name: nullableText(value.first_name),
    last_name: nullableText(value.last_name),
  };
}

function adaptSeller(value: unknown): OrderSeller | null {
  if (!isRecord(value) || !text(value.id)) return null;
  const user = isRecord(value.user) ? value.user : null;
  return {
    id: text(value.id),
    ...(Number.isFinite(Number(value.sales_target)) && { sales_target: number(value.sales_target) }),
    ...(Number.isFinite(Number(value.total_orders)) && { total_orders: number(value.total_orders) }),
    ...(Number.isFinite(Number(value.completed_orders)) && { completed_orders: number(value.completed_orders) }),
    ...(Number.isFinite(Number(value.canceled_orders)) && { canceled_orders: number(value.canceled_orders) }),
    user: user ? {
      first_name: nullableText(user.first_name),
      middle_name: nullableText(user.middle_name),
      last_name: nullableText(user.last_name),
      email: nullableText(user.email),
      corporate_email: nullableText(user.corporate_email),
      ...(typeof user.is_active === "boolean" && { is_active: user.is_active }),
    } : null,
  };
}

export function adaptOrderResponse(value: unknown): OrderResponse {
  const order = isRecord(value) ? value : {};
  const member = isRecord(order.member) ? order.member : {};
  const lead = adaptLead(isRecord(member.lead) ? member.lead : order.lead);
  const assignedUser = adaptPerson(order.assignedUser);
  const userCreator = adaptPerson(order.userCreator);
  const details = Array.isArray(order.orderDetails)
    ? order.orderDetails.map(adaptOrderDetail).filter((item): item is OrderDetailResponse => item !== null)
    : [];
  const items = Array.isArray(order.orderDetails)
    ? order.orderDetails.map(adaptDisplayItem).filter((item): item is OrderDisplayItem => item !== null)
    : [];
  const nestedPlans = details.flatMap((detail) => detail.paymentPlan ? [detail.paymentPlan] : []);
  const legacySeller = adaptSeller(order.seller);
  const memberId = text(order.member_id) || text(member.id);
  const leadId = lead.id;
  const campaignId = text(member.campaing_id) || text(member.campaign_id);
  const orderCode = text(order.order_code);
  const status = isOrderStatus(order.order_status) ? order.order_status : "PENDING";
  const createdAt = text(order.created_at);
  const updatedAt = text(order.updated_at);
  const subtotal = text(order.sub_total) || number(order.sub_total).toFixed(2);
  const discountAmount = text(order.discount) || number(order.discount).toFixed(2);
  const total = text(order.total_amount) || number(order.total_amount).toFixed(2);
  const paymentPlan = items.find((item) => item.paymentPlan)?.paymentPlan ?? null;

  return {
    id: text(order.id),
    orderCode,
    status,
    createdAt,
    updatedAt,
    subtotal,
    discountAmount,
    total,
    member_id: memberId,
    memberId,
    lead_id: leadId || undefined,
    leadId,
    leadName: cleanName(lead) || "Prospecto no disponible",
    campaignId,
    assignedUserName: cleanName(assignedUser) || "Asesor no asignado",
    creatorName: cleanName(userCreator) || "Creador no disponible",
    generated_by: nullableText(order.generated_by),
    sub_total: subtotal,
    total_amount: total,
    discount: discountAmount,
    order_status: status,
    order_code: orderCode,
    created_at: createdAt,
    updated_at: updatedAt,
    lead,
    member: {
      id: text(member.id) || text(order.member_id),
      campaignId: text(member.campaing_id) || text(member.campaign_id),
      lead,
    },
    userCreator,
    assignedUser,
    orderDetails: details,
    items,
    paymentPlan,
    paymentPlans: nestedPlans,
    payments: Array.isArray(order.payments)
      ? order.payments.map(adaptPayment).filter((item): item is OrderPayment => item !== null)
      : [],
    seller: assignedUser ? {
      id: assignedUser.id,
      user: {
        first_name: assignedUser.first_name,
        last_name: assignedUser.last_name,
      },
    } : legacySeller,
  };
}

export function adaptOrderListResponse(value: unknown): OrderListResponse {
  const body = isRecord(value) ? value : {};
  const data = isRecord(body.data) ? body.data : {};
  const rawOrders = Array.isArray(data.orders) ? data.orders : Array.isArray(body.data) ? body.data : [];
  return {
    success: true,
    message: text(body.message) || "Orders retrieved",
    data: {
      orders: rawOrders.map(adaptOrderResponse),
      total: number(data.total, rawOrders.length),
      page: number(data.page, 1),
      limit: number(data.limit, 20),
    },
  };
}

export function adaptSingleOrderResponse(value: unknown): { success: true; message: string; data: OrderResponse } {
  const body = isRecord(value) ? value : {};
  const data = isRecord(body.data) ? body.data : null;
  const rawOrder = data && Array.isArray(data.orders) ? data.orders[0] : body.data;
  return {
    success: true,
    message: text(body.message) || "Order retrieved",
    data: adaptOrderResponse(rawOrder),
  };
}

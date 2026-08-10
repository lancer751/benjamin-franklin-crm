import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { orderQueryKeys } from "@/features/orders/queryKeys";
import { useAuthStore } from "@/store/useAuthStore";
import { paymentPlanKeys, paymentsKeys } from "../queryKeys";
import {
  createPayment,
  deletePayment,
  getPaymentById,
  getPaymentReceiptUrl,
  getPayments,
  mapPaymentApiError,
  requestEvidenceUpload,
  updatePaymentStatus,
  uploadEvidence,
} from "../services/paymentService";
import { mapPaymentResponseToDetail, mapPaymentResponseToListItem } from "../services/paymentMappers";
import type {
  CreatePaymentPayload,
  PaymentDetail,
  PaymentListItem,
  PaymentMethod,
  PaymentStatus,
  UpdatePaymentStatusPayload,
} from "../types";
import { normalizePaymentSearch } from "../utils/paymentLogic";

const EMPTY_PAYMENTS: PaymentListItem[] = [];

export function invalidatePaymentQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  paymentId?: string,
  orderId?: string,
  detailId?: string,
) {
  void queryClient.invalidateQueries({ queryKey: paymentsKeys.lists() });
  if (paymentId) void queryClient.invalidateQueries({ queryKey: paymentsKeys.detail(paymentId) });
  void queryClient.invalidateQueries({ queryKey: orderQueryKeys.lists() });
  if (orderId) void queryClient.invalidateQueries({ queryKey: orderQueryKeys.detail(orderId) });
  if (orderId && detailId) void queryClient.invalidateQueries({ queryKey: paymentPlanKeys.detail(orderId, detailId) });
}

export function usePaymentsView() {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.user?.role.name);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | PaymentStatus>(role === "COLLECTIONS" ? "PENDING" : "ALL");
  const filters = useMemo(() => ({ limit: 100, ...(status !== "ALL" && { payment_status: status }) }), [status]);
  const query = useQuery({
    queryKey: paymentsKeys.list(filters),
    queryFn: async () => {
      const response = await getPayments(filters);
      return response.data.payments.map(mapPaymentResponseToListItem);
    },
  });
  const payments = query.data ?? EMPTY_PAYMENTS;
  const filteredPayments = useMemo(() => {
    const needle = normalizePaymentSearch(search);
    if (!needle) return payments;
    return payments.filter((payment) => normalizePaymentSearch([
      payment.transactionId,
      payment.orderCode,
      payment.clientName,
      payment.productName,
      payment.registeredBy,
    ].filter(Boolean).join(" ")).includes(needle));
  }, [payments, search]);

  return {
    payments,
    filteredPayments,
    permissions: getPaymentPermissions(role),
    search,
    status,
    isLoading: query.isLoading,
    isError: query.isError,
    setSearch,
    setStatus,
    retry: () => void query.refetch(),
    navigateToDetail: (payment: PaymentListItem) => navigate(`/pagos/${payment.id}`),
  };
}

export function usePayment(id?: string) {
  return useQuery({
    queryKey: paymentsKeys.detail(id ?? ""),
    enabled: Boolean(id),
    queryFn: async (): Promise<PaymentDetail> => {
      const response = await getPaymentById(id as string);
      return mapPaymentResponseToDetail(response.data);
    },
  });
}

export function useRegisterPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ payload, file }: { payload: Omit<CreatePaymentPayload, "payment_receipt">; file: File }) => {
      const upload = await requestEvidenceUpload({
        file_name: file.name,
        content_type: file.type as "image/jpeg" | "image/png" | "image/webp" | "application/pdf",
      });
      await uploadEvidence(file, upload);
      return createPayment({ ...payload, payment_receipt: upload.key });
    },
    onSuccess: (response) => {
      invalidatePaymentQueries(queryClient, response.data.id, response.data.order_id, response.data.order_detail_id ?? undefined);
      toast.success("Pago registrado. Pendiente de validación.");
    },
    onError: (error) => toast.error(mapPaymentApiError(error)),
  });
}

export function useReviewPayment(payment?: PaymentListItem | PaymentDetail) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePaymentStatusPayload) => updatePaymentStatus(payment?.id ?? "", payload),
    onSuccess: (_, variables) => {
      invalidatePaymentQueries(queryClient, payment?.id, payment?.orderId, payment?.orderDetailId ?? undefined);
      toast.success(variables.payment_status === "CONFIRMED" ? "Pago confirmado." : "Pago rechazado.");
    },
    onError: (error) => toast.error(mapPaymentApiError(error)),
  });
}

export function useDeletePayment(payment?: PaymentListItem | PaymentDetail) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: () => deletePayment(payment?.id ?? ""),
    onSuccess: () => {
      invalidatePaymentQueries(queryClient, payment?.id, payment?.orderId, payment?.orderDetailId ?? undefined);
      toast.success("Pago eliminado correctamente");
      navigate("/pagos");
    },
    onError: (error) => toast.error(mapPaymentApiError(error)),
  });
}

export function usePaymentReceipt(id?: string) {
  return useQuery({
    queryKey: paymentsKeys.receipt(id ?? ""),
    enabled: false,
    queryFn: () => getPaymentReceiptUrl(id as string),
  });
}

export function getPaymentPermissions(role?: string) {
  const canAccess = ["ADMIN", "SALES_REP", "SALES_SUPERVISOR", "COLLECTIONS"].includes(role ?? "");
  return {
    canAccess,
    canCreate: ["ADMIN", "SALES_REP", "SALES_SUPERVISOR"].includes(role ?? ""),
    canReview: ["ADMIN", "SALES_SUPERVISOR", "COLLECTIONS"].includes(role ?? ""),
    canDelete: ["ADMIN", "SALES_REP", "SALES_SUPERVISOR"].includes(role ?? ""),
  };
}

export const paymentMethods: PaymentMethod[] = ["YAPE", "BANK_TRANSFER", "POS", "CASH", "ONLINE"];
export const paymentStatuses: PaymentStatus[] = ["PENDING", "CONFIRMED", "FAILED", "REFUNDED"];

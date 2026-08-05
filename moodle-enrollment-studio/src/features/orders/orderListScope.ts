import type { OrderCreationOrder, OrderStatus } from "./types";

export interface OrderListScope {
  isSalesRep: boolean;
  generatedBy?: string;
  isReady: boolean;
}

export const resolveOrderListScope = (
  role?: string,
  userId?: string,
): OrderListScope => {
  const isSalesRep = role === "SALES_REP";
  const generatedBy = userId?.trim();

  return {
    isSalesRep,
    ...(isSalesRep && generatedBy ? { generatedBy } : {}),
    isReady: !isSalesRep || Boolean(generatedBy),
  };
};

export interface OrderListQueryInput {
  page: number;
  limit: number;
  status: OrderStatus | "ALL";
  creationOrder: OrderCreationOrder;
  generatedBy?: string;
  memberId?: string;
}

export const buildOrderListQuery = ({
  page,
  limit,
  status,
  creationOrder,
  generatedBy,
  memberId,
}: OrderListQueryInput) => ({
  page,
  limit,
  creation_order: creationOrder,
  ...(status !== "ALL" ? { order_status: status } : {}),
  ...(memberId?.trim() ? { member_id: memberId.trim() } : {}),
  ...(generatedBy?.trim() ? { generated_by: generatedBy.trim() } : {}),
});

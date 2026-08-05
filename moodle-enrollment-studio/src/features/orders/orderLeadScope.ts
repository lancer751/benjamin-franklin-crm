export interface OrderLeadScope {
  isSalesRep: boolean;
  effectiveAssignedTo?: string;
  isReady: boolean;
}

export function resolveOrderLeadScope(
  role?: string,
  userId?: string,
): OrderLeadScope {
  const isSalesRep = role === "SALES_REP";
  const effectiveAssignedTo = userId?.trim();

  return {
    isSalesRep,
    ...(isSalesRep && effectiveAssignedTo ? { effectiveAssignedTo } : {}),
    isReady: !isSalesRep || Boolean(effectiveAssignedTo),
  };
}

import { useAuthStore } from "@/store/useAuthStore";
import { AdminLeadForm } from "./AdminLeadForm";
import { SalesManualLeadForm } from "./SalesManualLeadForm";

export default function LeadFormView() {
  const { user } = useAuthStore();
  const isSalesRep = user?.role?.name === "SALES_REP";

  return isSalesRep ? <SalesManualLeadForm /> : <AdminLeadForm />;
}


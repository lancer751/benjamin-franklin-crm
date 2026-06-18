import { useAuthStore } from "@/store/useAuthStore";
import { SalesProspectsBoard } from "./SalesProspectsBoard";
import { AdminProspectsBoard } from "./AdminProspectsBoard";

export const ProspectsView = () => {
  const { user } = useAuthStore();
  const isSalesRep = user?.role?.name === "SALES_REP";

  return (
    <div className="flex flex-col w-full h-full">
      {isSalesRep ? <SalesProspectsBoard /> : <AdminProspectsBoard />}
    </div>
  );
};

export default ProspectsView;
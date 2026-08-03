import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/core/components/ui/button";
import PaymentForm from "../components/PaymentForm";

export default function CreatePaymentView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return (
    <div className="space-y-6">
      <header className="flex items-start gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Volver a pagos"
          onClick={() => navigate("/pagos")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Registrar pago</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Registra un pago completo o configura un plan de cuotas.
          </p>
        </div>
      </header>
      <PaymentForm preselectedOrderId={searchParams.get("orderId")} />
    </div>
  );
}

import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/core/components/ui/button";

export default function CreatePaymentView() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-2xl rounded-xl border bg-card p-8 text-center">
      <ShoppingCart className="mx-auto h-10 w-10 text-primary" />
      <h1 className="mt-4 text-xl font-bold">Registra el pago desde la orden</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Selecciona la cuota o el producto correspondiente para mantener el monto y el destino del pago protegidos.
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <Button variant="outline" onClick={() => navigate("/pagos")}><ArrowLeft className="mr-2 h-4 w-4" />Volver</Button>
        <Button onClick={() => navigate("/ordenes")}>Ir a órdenes</Button>
      </div>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/core/components/ui/button";

interface Props { isMissingId: boolean; onRetry: () => void; }

export function SellerDetailError({ isMissingId, onRetry }: Props) {
  const navigate = useNavigate();
  return (
    <div className="mx-auto mt-16 max-w-lg rounded-2xl border border-rose-100 bg-white p-7 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50"><AlertTriangle className="h-6 w-6 text-rose-500" /></div>
      <h2 className="mt-4 text-lg font-bold text-slate-900">No se pudo cargar el perfil</h2>
      <p className="mt-2 text-sm text-slate-500">{isMissingId ? "No se pudo identificar al vendedor autenticado." : "El perfil solicitado no está disponible o ocurrió un error al consultarlo."}</p>
      <div className="mt-5 flex justify-center gap-2">
        <Button onClick={() => navigate(-1)} variant="outline" size="sm"><ArrowLeft className="h-4 w-4" />Volver</Button>
        <Button onClick={onRetry} size="sm" className="bg-blue-600 hover:bg-blue-700"><RefreshCw className="h-4 w-4" />Reintentar</Button>
      </div>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { useSellerCampaigns } from "@/features/campaigns/hooks/useSellerCampaigns";
import { Loader2, Layers, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";

const SellerCampaignsView = () => {
  const navigate = useNavigate();
  const { campaigns, isLoading, isError } = useSellerCampaigns();

  if (isLoading) {
    return (
      <div className="bg-slate-50/50 min-h-screen p-6 md:p-8 flex flex-col items-center justify-center text-muted-foreground gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium">Cargando tus campañas asignadas...</p>
      </div>
    );
  }

  const hasCampaigns = campaigns && campaigns.length > 0;

  return (
    <div className="bg-slate-50/50 min-h-screen p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
      {/* Cabecera limpia */}
      <div className="space-y-1.5">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Mis Campañas Asignadas
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
          Selecciona una campaña activa para comenzar a gestionar tus prospectos y registrar interacciones de llamadas.
        </p>
      </div>

      {/* Estado vacío o error */}
      {!hasCampaigns || isError ? (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <Layers size={24} />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">
            No tienes campañas asignadas actualmente
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Contacta al supervisor de ventas para que te asigne a una campaña activa.
          </p>
        </div>
      ) : (
        /* Grid de acceso directo */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {campaigns.map((c: any) => {
            const campaignId = c.id;
            return (
              <Card
                key={campaignId}
                onClick={() => navigate(`/admin/campaigns/seller/leads/${campaignId}`)}
                className="group cursor-pointer hover:shadow-md border-slate-200/80 bg-white hover:border-primary/40 transition-all duration-300 rounded-xl overflow-hidden flex flex-col justify-between"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-base text-slate-800 group-hover:text-primary transition-colors line-clamp-2">
                      {c.name || "Campaña sin nombre"}
                    </h3>
                    <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200/85 shrink-0 text-[10px] font-semibold uppercase tracking-wider">
                      {c.platform || "Meta Ads"}
                    </Badge>
                  </div>

                  {c.relatedProduct?.name && (
                    <p className="text-xs text-slate-400">
                      Curso: <span className="font-medium text-slate-600">{c.relatedProduct.name}</span>
                    </p>
                  )}

                  {/* Indicador sutil de gestión */}
                  <div className="pt-2 flex items-center justify-between text-xs text-slate-400 group-hover:text-primary transition-colors border-t border-slate-100">
                    <span className="font-semibold flex items-center gap-1.5">
                      Gestionar Leads
                    </span>
                    <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SellerCampaignsView;

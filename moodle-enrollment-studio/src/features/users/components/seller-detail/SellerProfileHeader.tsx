import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, RefreshCw, ShieldCheck } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import type { CleanSellerProfile } from "../../adapters/seller.adapter";

interface Props {
  seller: CleanSellerProfile;
  isSelfView: boolean;
  onRefresh: () => void;
}

export function SellerProfileHeader({ seller, isSelfView, onRefresh }: Props) {
  return (
    <div className="space-y-3">
      <Link
        to={isSelfView ? "/seller/campanas" : "/comercial/seguimiento-equipo"}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-blue-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {isSelfView ? "Volver a campañas" : "Volver al seguimiento del equipo"}
      </Link>

      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-black text-white shadow-sm">
            {seller.initials}
          </div>
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                {seller.fullName}
              </h1>
              <Badge className={seller.isActive
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                : "border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-100"}
              >
                <ShieldCheck className="mr-1 h-3 w-3" />
                {seller.isActive ? "Activo" : "Inactivo"}
              </Badge>
              <Badge variant="outline" className="text-slate-600">Asesor de ventas</Badge>
            </div>
            <div className="flex flex-col gap-1.5 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:gap-x-5">
              <span className="flex min-w-0 items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{seller.email}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                {seller.phone ?? "No registrado"}
              </span>
            </div>
          </div>
        </div>
        <Button onClick={onRefresh} variant="outline" size="sm" className="self-end sm:self-auto">
          <RefreshCw className="h-4 w-4" /> Actualizar
        </Button>
      </section>
    </div>
  );
}

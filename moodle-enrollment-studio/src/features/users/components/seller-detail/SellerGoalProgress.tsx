import { CheckCircle2, CircleDashed, Rocket, Target } from "lucide-react";
import type { CleanSellerProfile } from "../../adapters/seller.adapter";
import { formatInteger, formatPercentage } from "./presentation";

interface Props { seller: CleanSellerProfile; isSelfView: boolean; }

export function SellerGoalProgress({ seller, isSelfView }: Props) {
  const hasGoal = seller.salesTarget > 0;
  const exceeded = hasGoal && seller.goalCompletion > 100;
  const reached = hasGoal && seller.goalCompletion >= 100;
  const Icon = !hasGoal ? CircleDashed : exceeded ? Rocket : reached ? CheckCircle2 : Target;
  const status = !hasGoal ? "Sin meta asignada" : exceeded ? "Meta superada" : reached ? "Meta alcanzada" : "En progreso";

  return (
    <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">{isSelfView ? "Cumplimiento de mi meta" : "Cumplimiento de meta"}</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                {hasGoal ? `${formatInteger(seller.totalSales)} de ${formatInteger(seller.salesTarget)} ventas` : "Sin meta asignada"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-slate-950">{formatPercentage(seller.goalCompletion)}</p>
              <p className="text-[11px] font-semibold text-slate-500">{status}</p>
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/80">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all" style={{ width: `${Math.min(seller.goalCompletion, 100)}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}

import { Progress } from "@/core/components/ui/progress";

interface ProductFormProgressProps {
  progress: number;
  pendingCount: number;
}

const ProductFormProgress = ({ progress, pendingCount }: ProductFormProgressProps) => (
  <div className="min-w-[190px] space-y-1.5">
    <div className="flex items-center justify-between text-[11px] font-semibold">
      <span className="text-slate-500">Progreso general</span>
      <span className="text-slate-800">{progress}%</span>
    </div>
    <Progress value={progress} className="h-2" />
    <p className="text-[10px] text-slate-400">
      {pendingCount === 0 ? "Listo para revisión" : `${pendingCount} campo${pendingCount === 1 ? "" : "s"} pendiente${pendingCount === 1 ? "" : "s"}`}
    </p>
  </div>
);

export default ProductFormProgress;

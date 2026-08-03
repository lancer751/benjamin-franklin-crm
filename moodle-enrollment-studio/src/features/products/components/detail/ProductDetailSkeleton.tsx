import { Skeleton } from "@/core/components/ui/skeleton";

const ProductDetailSkeleton = () => (
  <div className="mx-auto max-w-7xl space-y-6 pb-12">
    <div className="flex items-start gap-4">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-7 w-3/5" />
        <Skeleton className="h-4 w-2/5" />
      </div>
    </div>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <Skeleton className="h-[360px] rounded-2xl" />
      <div className="space-y-4">
        <Skeleton className="aspect-video rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
      </div>
    </div>
    <Skeleton className="h-12 rounded-2xl" />
    <Skeleton className="h-72 rounded-2xl" />
  </div>
);

export default ProductDetailSkeleton;

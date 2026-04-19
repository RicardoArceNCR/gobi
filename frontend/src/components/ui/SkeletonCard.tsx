// /src/components/ui/SkeletonCard.tsx
export function SkeletonCard() {
  return (
    <div className="border rounded-xl p-4 animate-pulse bg-white">
      <div className="flex justify-between mb-3">
        <div className="h-3 w-16 bg-gray-200 rounded" />
        <div className="h-5 w-24 bg-gray-200 rounded-full" />
      </div>
      <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-full bg-gray-200 rounded mb-1" />
      <div className="h-4 w-2/3 bg-gray-200 rounded mb-3" />
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}

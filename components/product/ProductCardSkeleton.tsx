const ProductCardSkeleton = () => (
  <div className="min-w-[200px] w-[200px] rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden animate-pulse">
    <div className="aspect-square bg-neutral-100" />
    <div className="p-4 space-y-2">
      <div className="h-3 bg-neutral-100 rounded-full w-3/4" />
      <div className="h-3 bg-neutral-100 rounded-full w-1/2" />
      <div className="h-3 bg-neutral-100 rounded-full w-1/3" />
    </div>
  </div>
);

export default ProductCardSkeleton;

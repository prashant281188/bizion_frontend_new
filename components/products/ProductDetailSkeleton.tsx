export const ProductDetailSkeleton = () => (
  <div className="w-full bg-white">
    <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-6 sm:py-10">
      <div className="h-9 w-24 rounded-full bg-neutral-100 animate-pulse" />
      <div className="mt-6 sm:mt-8 grid gap-8 md:grid-cols-[380px_1fr]">
        <div className="aspect-square max-w-sm mx-auto w-full md:max-w-none rounded-3xl bg-neutral-100 animate-pulse" />
        <div className="space-y-4 pt-2">
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-full bg-neutral-100 animate-pulse" />
            <div className="h-6 w-16 rounded-full bg-neutral-100 animate-pulse" />
          </div>
          <div className="h-10 w-3/4 rounded-xl bg-neutral-100 animate-pulse" />
          <div className="h-5 w-1/3 rounded-full bg-neutral-100 animate-pulse" />
          <div className="space-y-2 pt-2">
            {[1, 0.8, 0.6].map((w, i) => (
              <div
                key={i}
                className="h-3.5 rounded-full bg-neutral-100 animate-pulse"
                style={{ width: `${w * 100}%` }}
              />
            ))}
          </div>
          <div className="pt-4 grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 rounded-2xl bg-neutral-100 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

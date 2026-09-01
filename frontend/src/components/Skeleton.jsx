export const Skeleton = ({ className = '', ...props }) => (
  <div className={`skeleton ${className}`} {...props} />
);

export const SkeletonCard = () => (
  <div className="card space-y-2.5 animate-fade-in">
    <div className="flex items-center gap-2.5">
      <Skeleton className="w-9 h-9 rounded-lg" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-2.5 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-2.5 w-full" />
    <Skeleton className="h-2.5 w-2/3" />
    <div className="flex justify-between pt-1.5">
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-5 w-12" />
    </div>
  </div>
);

export const SkeletonStat = () => (
  <div className="card animate-fade-in">
    <Skeleton className="h-2.5 w-20 mb-2.5" />
    <Skeleton className="h-6 w-28 mb-1.5" />
    <Skeleton className="h-1.5 w-full" />
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="card p-0 overflow-hidden">
    <div className="px-4 py-2.5 border-b border-white/[0.04]">
      <div className="flex gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-2.5 flex-1" />
        ))}
      </div>
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="px-4 py-3 border-b border-white/[0.03] last:border-0">
        <div className="flex gap-3 items-center">
          <Skeleton className="h-3.5 flex-1" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-1.5 w-20" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-3.5 w-16" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonDashboard = () => (
  <div className="space-y-5 animate-fade-in">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {Array.from({ length: 3 }).map((_, i) => <SkeletonStat key={i} />)}
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)}
    </div>
    <div className="card">
      <Skeleton className="h-3.5 w-40 mb-3.5" />
      <Skeleton className="h-[200px] w-full" />
    </div>
    <div className="grid lg:grid-cols-3 gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card space-y-2.5">
          <Skeleton className="h-3.5 w-36" />
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} className="flex justify-between">
              <Skeleton className="h-2.5 w-28" />
              <Skeleton className="h-2.5 w-12" />
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

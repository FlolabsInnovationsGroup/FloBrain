export default function ModelsLoading() {
  return (
    <div className="min-h-screen bg-[#0a0015] px-6 py-8 animate-pulse">
      {/* Provider cards skeleton */}
      <div className="mb-8">
        <div className="h-6 w-48 rounded bg-white/10 mb-4" />
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 w-48 rounded-xl bg-white/5" />
          ))}
        </div>
      </div>

      {/* Agent role slots skeleton */}
      <div className="mb-8">
        <div className="h-6 w-48 rounded bg-white/10 mb-4" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-white/5" />
          ))}
        </div>
      </div>

      {/* Model marketplace skeleton */}
      <div>
        <div className="h-6 w-48 rounded bg-white/10 mb-4" />
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-20 rounded-lg bg-white/5" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}

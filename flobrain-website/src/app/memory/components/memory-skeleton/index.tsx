import { Search, Filter } from "lucide-react";

export const MemorySkeleton = () => {
  return (
    <div
      data-testid="memory-skeleton-root"
      className="fb-memory-page flex min-h-[100dvh] flex-col px-3 pb-24 pt-[5rem] sm:px-4 sm:pb-28 sm:pt-[5.5rem] md:px-5 md:pb-5 md:pt-[5.5rem]"
    >
      <div className="fb-memory-shell mx-auto my-2 flex min-h-0 w-full max-w-[1600px] flex-1 flex-col overflow-hidden rounded-xl border backdrop-blur-xl sm:my-3 sm:rounded-2xl">

        <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 lg:flex-row lg:gap-6 lg:p-6">
          <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[min(100%,320px)]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--fb-memory-text-subtle)]" />
              <div className="h-12 w-full animate-pulse rounded-2xl bg-[var(--fb-memory-skeleton)]" />
            </div>
            <div className="fb-memory-input flex h-12 items-center gap-2 rounded-2xl border px-4">
              <Filter className="size-4 text-[var(--fb-memory-text-subtle)]" />
              <div className="h-4 flex-1 animate-pulse rounded bg-[var(--fb-memory-skeleton)]" />
            </div>
            <div className="h-10 w-28 animate-pulse rounded bg-[var(--fb-memory-skeleton)]" />
            <div className="h-12 w-full animate-pulse rounded-2xl bg-[var(--fb-memory-skeleton)]" />

            <div className="hidden flex-1 lg:block" />

            <div className="fb-memory-surface rounded-2xl border p-4">
              <div className="mb-3 h-4 w-32 animate-pulse rounded bg-[var(--fb-memory-skeleton)]" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`legend-${index}`}
                    data-testid={`legend-${index}`}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-0.5 size-9 shrink-0 animate-pulse rounded-xl bg-[var(--fb-memory-skeleton)]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-28 animate-pulse rounded bg-[var(--fb-memory-skeleton)]" />
                      <div className="h-3 w-full animate-pulse rounded bg-[var(--fb-memory-skeleton)]" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-[var(--fb-memory-header-border)] pt-3">
                <div className="h-4 w-full animate-pulse rounded bg-[var(--fb-memory-skeleton)]" />
              </div>
            </div>
          </aside>

          <section className="fb-memory-canvas relative min-h-[min(42vh,520px)] flex-1 overflow-hidden rounded-xl border sm:min-h-[min(48vh,560px)] sm:rounded-2xl lg:min-h-0">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-[400px] w-full max-w-[600px]">
                {Array.from({ length: 8 }).map((_, index) => {
                  const positions = [
                    { top: "20%", left: "30%" },
                    { top: "15%", left: "60%" },
                    { top: "40%", left: "20%" },
                    { top: "35%", left: "70%" },
                    { top: "60%", left: "40%" },
                    { top: "65%", left: "65%" },
                    { top: "75%", left: "25%" },
                    { top: "80%", left: "80%" },
                  ];
                  const colors = [
                    "var(--fb-memory-chunks)",
                    "var(--fb-memory-summaries)",
                    "var(--fb-memory-interactions)",
                    "var(--fb-memory-workflows)",
                  ];
                  return (
                    <div
                      key={`node-${index}`}
                      data-testid={`node-${index}`}
                      className="absolute rounded-full opacity-40"
                      style={{
                        background: colors[index % 4],
                        top: positions[index].top,
                        left: positions[index].left,
                        width: `${16 + (index % 3) * 10}px`,
                        height: `${16 + (index % 3) * 10}px`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

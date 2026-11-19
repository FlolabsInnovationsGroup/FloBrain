"use client";

export function ProjectRightPanel() {
  return (
    <div
      className="flex h-full min-h-[600px] flex-col gap-6 p-4"
      style={{ color: "var(--fb-v2-text)" }}
    >
      <section>
        <h2 className="mb-3 text-sm font-semibold" style={{ color: "var(--fb-v2-heading)" }}>
          Flo-Timer
        </h2>

        <div
          className="rounded-xl border p-4 text-center"
          style={{
            background: "var(--fb-v2-surface)",
            borderColor: "var(--fb-v2-border)",
          }}
        >
          <p className="text-2xl font-semibold tabular-nums">00:00:00</p>

          <p className="mt-1 text-xs" style={{ color: "var(--fb-v2-text-muted)" }}>
            Ready to focus
          </p>

          <div
            className="mt-4 rounded-lg px-3 py-2 text-xs font-medium"
            style={{
              background: "var(--fb-v2-accent)",
              color: "var(--fb-v2-on-accent)",
            }}
          >
            Start Focus
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold" style={{ color: "var(--fb-v2-heading)" }}>
          Buddies - AI Agents
        </h2>

        <div className="space-y-3">
          {[
            {
              name: "AI Assistant",
              description: "Your personal AI buddy",
            },
            {
              name: "Code Assistant",
              description: "Get help with development",
            },
          ].map((agent) => (
            <div
              key={agent.name}
              className="rounded-xl border p-3"
              style={{
                background: "var(--fb-v2-surface)",
                borderColor: "var(--fb-v2-border)",
              }}
            >
              <p className="text-sm font-medium">{agent.name}</p>

              <p className="mt-1 text-xs" style={{ color: "var(--fb-v2-text-muted)" }}>
                {agent.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

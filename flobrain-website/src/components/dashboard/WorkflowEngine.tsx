import { AlertCircle } from "lucide-react";
import { workflowEngineData } from "@/data/dashboardData";

export default function WorkflowEngine() {
  const { errors } = workflowEngineData;

  return (
    <div className="rounded-2xl p-6 border border-white/10" style={{ background: "#FCFCFC29" }}>
      <h2 className="text-xl font-semibold mb-4">Workflow Engine</h2>

      <div className="mb-3">
        <h3 className="text-lg font-medium text-zinc-300 mb-3">Recent Errors</h3>

        {errors.map((error: { id: number; title: string; description: string; timestamp: string }) => (
          <div
            key={error.id}
            className={`rounded-lg p-4 ${error.id !== errors.length ? "mb-3" : ""}`}
            style={{ background: "#FC444736", border: "2px solid #D00003" }}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="mb-1">
                  <span className="text-black font-medium">{error.title}</span>
                </div>
                <p className="text-sm text-zinc-400 mb-2">{error.description}</p>
                <span className="text-xs text-zinc-500">{error.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

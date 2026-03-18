"use client";

import { useQueryClient } from "@tanstack/react-query";
import { api, type ProviderConnection } from "@/lib/api";

interface ProviderCardProps {
  provider: "openai" | "anthropic" | "ollama";
  label: string;
  icon: string;
  connection: ProviderConnection | undefined;
  modelCount?: number;
  onConnect: () => void;
}

function ProviderCard({ provider, label, icon, connection, modelCount, onConnect }: ProviderCardProps) {
  const queryClient = useQueryClient();
  const isConnected = !!connection?.is_active;

  async function handleDisconnect() {
    await api.disconnectProvider(provider);
    await queryClient.invalidateQueries({ queryKey: ["provider-connections"] });
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#3d1f6e]/50 bg-[#150025] px-5 py-4 min-w-[180px]">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{label}</p>
        {provider === "ollama" && modelCount !== undefined ? (
          <p className="text-xs text-zinc-500">{modelCount} model{modelCount !== 1 ? "s" : ""} available</p>
        ) : isConnected ? (
          <span className="inline-flex items-center gap-1 text-xs text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            Connected
          </span>
        ) : (
          <span className="text-xs text-zinc-600">Not connected</span>
        )}
      </div>
      {isConnected ? (
        <button
          onClick={handleDisconnect}
          className="shrink-0 rounded-lg border border-red-700/30 bg-red-900/20 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-900/40 transition-colors"
        >
          Disconnect
        </button>
      ) : (
        <button
          onClick={onConnect}
          className="shrink-0 rounded-lg bg-[#7c3aed] px-3 py-1 text-xs font-semibold text-white hover:bg-[#9333ea] transition-colors"
        >
          Connect
        </button>
      )}
    </div>
  );
}

interface ProviderSectionProps {
  connections: ProviderConnection[];
  ollamaModelCount: number;
  onConnect: (provider: "openai" | "anthropic" | "ollama") => void;
}

export function ProviderSection({ connections, ollamaModelCount, onConnect }: ProviderSectionProps) {
  const byProvider = Object.fromEntries(connections.map((c) => [c.provider, c]));

  return (
    <div className="flex flex-wrap gap-4">
      <ProviderCard
        provider="openai"
        label="OpenAI"
        icon="🟢"
        connection={byProvider["openai"]}
        onConnect={() => onConnect("openai")}
      />
      <ProviderCard
        provider="anthropic"
        label="Anthropic (Claude)"
        icon="🟠"
        connection={byProvider["anthropic"]}
        onConnect={() => onConnect("anthropic")}
      />
      <ProviderCard
        provider="ollama"
        label="Ollama"
        icon="🔵"
        connection={byProvider["ollama"]}
        modelCount={ollamaModelCount}
        onConnect={() => onConnect("ollama")}
      />
    </div>
  );
}

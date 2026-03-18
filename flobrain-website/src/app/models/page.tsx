"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { api, type ModelCatalogEntry } from "@/lib/api";
import { ModelCard } from "./components/ModelCard";
import { AgentRoleSlot } from "./components/AgentRoleSlot";
import { ProviderSection } from "./components/ProviderSection";
import { ConnectProviderDialog } from "./components/ConnectProviderDialog";

type ProviderKey = "openai" | "anthropic" | "ollama";
type TabKey = "all" | ProviderKey;

const AGENT_ROLES = [
  {
    role: "control" as const,
    label: "Control Agent",
    icon: "🧭",
    description: "Routes your request to the right agent",
  },
  {
    role: "general" as const,
    label: "General Agent",
    icon: "💬",
    description: "Handles open-ended conversation",
  },
  {
    role: "notion" as const,
    label: "Notion Agent",
    icon: "📋",
    description: "Manages your Notion workspace",
  },
  {
    role: "judge" as const,
    label: "Judge Agent",
    icon: "⚖️",
    description: "Reviews response quality",
  },
] as const;

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "openai", label: "OpenAI" },
  { key: "anthropic", label: "Anthropic" },
  { key: "ollama", label: "Local" },
];

export default function ModelsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [connectingProvider, setConnectingProvider] = useState<ProviderKey | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const { data: catalog } = useQuery({
    queryKey: ["model-catalog"],
    queryFn: () => api.getModelCatalog().then((r) => r.data),
  });

  const { data: connections = [] } = useQuery({
    queryKey: ["provider-connections"],
    queryFn: () => api.getProviderConnections().then((r) => r.data ?? []),
  });

  const { data: activeConfig } = useQuery({
    queryKey: ["active-model-config"],
    queryFn: () => api.getActiveModelConfig().then((r) => r.data),
  });

  const connectedProviders = new Set(
    connections.filter((c) => c.is_active).map((c) => c.provider)
  );
  // Ollama is always treated as "local"
  connectedProviders.add("ollama");

  function getModelsForTab(): Array<{ model: ModelCatalogEntry; provider: string }> {
    if (!catalog) return [];
    if (activeTab === "all") {
      return [
        ...(catalog.openai ?? []).map((m) => ({ model: m, provider: "openai" })),
        ...(catalog.anthropic ?? []).map((m) => ({ model: m, provider: "anthropic" })),
        ...(catalog.ollama ?? []).map((m) => ({ model: m, provider: "ollama" })),
      ];
    }
    if (activeTab === "ollama") return (catalog.ollama ?? []).map((m) => ({ model: m, provider: "ollama" }));
    if (activeTab === "openai") return (catalog.openai ?? []).map((m) => ({ model: m, provider: "openai" }));
    if (activeTab === "anthropic") return (catalog.anthropic ?? []).map((m) => ({ model: m, provider: "anthropic" }));
    return [];
  }

  function getDraggingModel(): { model: ModelCatalogEntry; provider: string } | null {
    if (!draggingId || !catalog) return null;
    const [provider, ...rest] = draggingId.split(":");
    const modelId = rest.join(":");
    const list = catalog[provider as ProviderKey] ?? [];
    const model = list.find((m) => m.id === modelId);
    if (!model) return null;
    return { model, provider };
  }

  function handleDragStart(event: DragStartEvent) {
    setDraggingId(String(event.active.id));
  }

  async function handleDragEnd(event: DragEndEvent) {
    setDraggingId(null);
    const { active, over } = event;
    if (!over) return;
    const [provider, ...rest] = String(active.id).split(":");
    const modelId = rest.join(":");
    const role = String(over.id);
    await api.selectModel(role, provider, modelId);
    await queryClient.invalidateQueries({ queryKey: ["active-model-config"] });
  }

  const draggingEntry = getDraggingModel();
  const models = getModelsForTab();
  const ollamaCount = catalog?.ollama?.length ?? 0;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-[#0a0015] px-6 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Models</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Connect AI providers, browse models, and assign them to agent roles.
            </p>
          </div>

          {/* Section A: Connected providers */}
          <section className="mb-8">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Provider Connections
            </h2>
            <ProviderSection
              connections={connections}
              ollamaModelCount={ollamaCount}
              onConnect={(p) => setConnectingProvider(p)}
            />
          </section>

          {/* Section B: Agent role slots */}
          <section className="mb-8">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Agent Role Assignments
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {AGENT_ROLES.map(({ role, label, icon, description }) => (
                <AgentRoleSlot
                  key={role}
                  role={role}
                  label={label}
                  icon={icon}
                  description={description}
                  currentModel={activeConfig?.[role] ?? null}
                  onModelSelect={async (r, provider, model) => {
                    await api.selectModel(r, provider, model);
                    await queryClient.invalidateQueries({ queryKey: ["active-model-config"] });
                  }}
                />
              ))}
            </div>
          </section>

          {/* Section C: Model marketplace */}
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Model Marketplace
            </h2>

            {/* Tabs */}
            <div className="mb-5 flex gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors
                    ${activeTab === tab.key
                      ? "bg-[#7c3aed] text-white"
                      : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Grid */}
            {models.length === 0 ? (
              <p className="text-sm text-zinc-600">
                {catalog ? "No models available for this provider." : "Loading catalog…"}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {models.map(({ model, provider }) => (
                  <ModelCard
                    key={`${provider}:${model.id}`}
                    model={model}
                    provider={provider}
                    isConnected={connectedProviders.has(provider)}
                    isDragging={draggingId === `${provider}:${model.id}`}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {draggingEntry && (
          <div className="rotate-2 opacity-90 shadow-2xl">
            <ModelCard
              model={draggingEntry.model}
              provider={draggingEntry.provider}
              isConnected
            />
          </div>
        )}
      </DragOverlay>

      {/* Connect provider dialog */}
      {connectingProvider && (
        <ConnectProviderDialog
          provider={connectingProvider}
          onClose={() => setConnectingProvider(null)}
        />
      )}
    </DndContext>
  );
}

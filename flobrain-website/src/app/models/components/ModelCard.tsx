"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { ModelCatalogEntry } from "@/lib/api";

interface ModelCardProps {
  model: ModelCatalogEntry;
  provider: string;
  isConnected: boolean;
  isDragging?: boolean;
  onSelect?: (provider: string, modelId: string) => void;
}

const providerBadgeClass: Record<string, string> = {
  openai: "bg-green-900/50 text-green-300 border border-green-700/40",
  anthropic: "bg-orange-900/50 text-orange-300 border border-orange-700/40",
  ollama: "bg-blue-900/50 text-blue-300 border border-blue-700/40",
};

const providerLabel: Record<string, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  ollama: "Ollama",
};

function formatContext(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(0)}M context`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}K context`;
  return `${tokens} context`;
}

export function ModelCard({ model, provider, isConnected, isDragging, onSelect }: ModelCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `${provider}:${model.id}`,
    disabled: !isConnected,
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex flex-col gap-2 rounded-xl border p-4 transition-all
        ${isDragging ? "opacity-50" : ""}
        ${isConnected
          ? "border-[#3d1f6e]/60 bg-[#150025] hover:border-[#7c3aed]/70 hover:shadow-[0_0_12px_rgba(124,58,237,0.2)] cursor-grab active:cursor-grabbing"
          : "border-white/5 bg-[#0d0018] opacity-50 cursor-not-allowed"
        }`}
      onClick={() => isConnected && onSelect?.(provider, model.id)}
      {...attributes}
    >
      {/* Drag handle + lock */}
      <div className="absolute right-3 top-3 flex items-center gap-1.5">
        {!isConnected && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        )}
        {isConnected && (
          <span
            {...listeners}
            className="cursor-grab text-zinc-500 hover:text-zinc-300 select-none text-base leading-none"
            title="Drag to assign"
          >
            ⠿
          </span>
        )}
      </div>

      {/* Provider badge */}
      <span className={`self-start rounded-full px-2 py-0.5 text-xs font-medium ${providerBadgeClass[provider] ?? "bg-white/10 text-zinc-300"}`}>
        {providerLabel[provider] ?? provider}
      </span>

      {/* Model name */}
      <h3 className={`text-sm font-semibold leading-tight pr-6 ${isConnected ? "text-white" : "text-zinc-500"}`}>
        {model.name}
      </h3>

      {/* Description */}
      <p className="text-xs text-zinc-400 line-clamp-2">{model.description}</p>

      {/* Footer */}
      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-xs text-zinc-500">{formatContext(model.context_window)}</span>
        {model.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-zinc-400">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

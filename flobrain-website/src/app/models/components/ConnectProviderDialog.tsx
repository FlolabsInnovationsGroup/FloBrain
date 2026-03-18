"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

interface ConnectProviderDialogProps {
  provider: "openai" | "anthropic" | "ollama";
  onClose: () => void;
}

const providerMeta = {
  openai: {
    label: "OpenAI",
    icon: "🟢",
    hasApiKey: true,
    hasBaseUrl: true,
    baseUrlPlaceholder: "https://api.openai.com/v1 (optional, for Azure/compatible)",
    keyLink: "https://platform.openai.com/api-keys",
    keyLabel: "OpenAI API Key",
  },
  anthropic: {
    label: "Anthropic (Claude)",
    icon: "🟠",
    hasApiKey: true,
    hasBaseUrl: false,
    baseUrlPlaceholder: "",
    keyLink: "https://console.anthropic.com/settings/keys",
    keyLabel: "Anthropic API Key",
  },
  ollama: {
    label: "Ollama (Local)",
    icon: "🔵",
    hasApiKey: false,
    hasBaseUrl: true,
    baseUrlPlaceholder: "http://localhost:11434",
    keyLink: "",
    keyLabel: "",
  },
};

export function ConnectProviderDialog({ provider, onClose }: ConnectProviderDialogProps) {
  const meta = providerMeta[provider];
  const queryClient = useQueryClient();

  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleConnect() {
    setLoading(true);
    setError(null);
    const result = await api.connectProvider(
      provider,
      meta.hasApiKey ? apiKey || undefined : undefined,
      meta.hasBaseUrl ? baseUrl || undefined : undefined
    );
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      await queryClient.invalidateQueries({ queryKey: ["provider-connections"] });
      setTimeout(onClose, 800);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-[#3d1f6e]/60 bg-[#130020] p-6 shadow-[0_0_40px_rgba(124,58,237,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-2xl">{meta.icon}</span>
          <div>
            <h2 className="text-lg font-semibold text-white">Connect {meta.label}</h2>
            <p className="text-xs text-zinc-500">Credentials are stored securely on the server</p>
          </div>
          <button onClick={onClose} className="ml-auto text-zinc-500 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* API Key */}
          {meta.hasApiKey ? (
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center justify-between text-sm font-medium text-zinc-300">
                {meta.keyLabel}
                {meta.keyLink && (
                  <a
                    href={meta.keyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#a855f7] hover:underline"
                  >
                    Get API key →
                  </a>
                )}
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/40"
              />
            </div>
          ) : (
            <p className="rounded-lg border border-blue-700/30 bg-blue-900/20 px-4 py-3 text-sm text-blue-300">
              No API key required — Ollama runs locally on your machine.
            </p>
          )}

          {/* Base URL */}
          {meta.hasBaseUrl && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-300">
                Base URL <span className="text-zinc-600">(optional)</span>
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder={meta.baseUrlPlaceholder}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/40"
              />
            </div>
          )}

          {/* Error / Success */}
          {error && (
            <p className="rounded-lg border border-red-700/30 bg-red-900/20 px-4 py-2 text-sm text-red-300">{error}</p>
          )}
          {success && (
            <p className="rounded-lg border border-green-700/30 bg-green-900/20 px-4 py-2 text-sm text-green-300">
              Connected successfully!
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleConnect}
            disabled={loading || success}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#7c3aed] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_16px_rgba(124,58,237,0.3)] transition-colors hover:bg-[#9333ea] disabled:opacity-60"
          >
            {loading && (
              <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? "Testing connection…" : "Test & Connect"}
          </button>
        </div>
      </div>
    </div>
  );
}

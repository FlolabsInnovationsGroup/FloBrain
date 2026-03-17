"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/layout/dialog";
import { api } from "@/lib/api";

type MemoryTypeOption = "user_fact" | "knowledge" | "workflow";

const TYPE_LABELS: Record<MemoryTypeOption, { label: string; description: string; color: string }> = {
  user_fact:    { label: "Interaction",  description: "A fact about you",         color: "#10b981" },
  knowledge:    { label: "Summary",      description: "Knowledge or note",         color: "#a78bfa" },
  workflow:     { label: "Workflow",     description: "Automated / process result", color: "#fbbf24" },
};

interface AddMemoryDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onAdded?: () => void;
}

export const AddMemoryDialog = ({ open, setOpen, onAdded }: AddMemoryDialogProps) => {
  const [text, setText] = useState("");
  const [memoryType, setMemoryType] = useState<MemoryTypeOption>("user_fact");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    setError(null);
    const result = await api.addMemoryFact(text.trim(), memoryType);
    setSaving(false);
    if (result.error) {
      setError(result.error);
    } else {
      setText("");
      setMemoryType("user_fact");
      setOpen(false);
      onAdded?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-[#1a0033] text-white border border-[#4c1d95]/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#e194ff]">Add memory</DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {/* Text input */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Memory text <span className="text-zinc-600 text-xs">(Ctrl+Enter to save)</span>
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. My name is Oliver and I work at FloLabs"
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-[#2a1a4a] border border-[#4c1d95]/60 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#8b5cf6]/80 resize-none"
            />
          </div>

          {/* Memory type selector */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Memory type</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(TYPE_LABELS) as [MemoryTypeOption, typeof TYPE_LABELS[MemoryTypeOption]][]).map(
                ([key, { label, description, color }]) => (
                  <button
                    key={key}
                    onClick={() => setMemoryType(key)}
                    className={`flex flex-col items-start px-3 py-2 rounded-xl border text-left transition-all ${
                      memoryType === key
                        ? "border-[#8b5cf6] bg-[#4c1d95]/40"
                        : "border-[#4c1d95]/40 bg-[#2a1a4a] hover:border-[#6b21a8]/60"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 text-xs font-medium text-white">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      {label}
                    </span>
                    <span className="text-[10px] text-zinc-500 mt-0.5 leading-tight">
                      {description}
                    </span>
                  </button>
                )
              )}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !text.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Saving…
                </>
              ) : (
                "Save memory"
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/layout/dialog";
import type { memoryNode } from "@/types/MemoryNodes";
import { api } from "@/lib/api";

interface MemoryNodeDetailsDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  node?: memoryNode | null;
  onDeleted?: (id: string) => void;
}

export const MemoryNodeDetailsDialog = ({
  open,
  setOpen,
  node,
  onDeleted,
}: MemoryNodeDetailsDialogProps) => {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const name = node?.name ?? "";
  const fullText = node?.full_text ?? name;
  const group = node?.group ?? "";
  const memoryType = node?.memory_type ?? "";
  const relevance = node?.relevance != null ? String(node.relevance) : "";
  const createdAt = node?.created_at
    ? new Date(node.created_at).toLocaleString()
    : null;
  const nodeId = node?.id ? String(node.id) : null;

  const handleDelete = async () => {
    if (!nodeId) return;
    setDeleting(true);
    setDeleteError(null);
    const result = await api.deleteMemoryFact(nodeId);
    setDeleting(false);
    if (result.error) {
      setDeleteError(result.error);
    } else {
      onDeleted?.(nodeId);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-[#1a0033] text-white border border-[#4c1d95]/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#e194ff]">Memory node</DialogTitle>
          <DialogDescription className="text-zinc-300 leading-snug">
            {fullText || "No description"}
          </DialogDescription>
        </DialogHeader>

        {(group || memoryType || relevance || createdAt) && (
          <div className="mt-2 text-sm text-zinc-400 space-y-1">
            {group && <p><span className="text-zinc-500">Group:</span> {group}</p>}
            {memoryType && <p><span className="text-zinc-500">Type:</span> {memoryType}</p>}
            {relevance && <p><span className="text-zinc-500">Relevance:</span> {relevance}</p>}
            {createdAt && <p><span className="text-zinc-500">Stored:</span> {createdAt}</p>}
          </div>
        )}

        {deleteError && (
          <p className="text-red-400 text-sm mt-2">{deleteError}</p>
        )}

        {nodeId && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 text-red-300 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full" />
                  Deleting…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                  Delete memory
                </>
              )}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

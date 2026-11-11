import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/layout/dialog";
import type { memoryNode } from "@/types/MemoryNodes";

interface MemoryNodeDetailsDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  node?: memoryNode | null;
}
export const MemoryNodeDetailsDialog = ({
  open,
  setOpen,
  node,
}: MemoryNodeDetailsDialogProps) => {
  const name = node?.name ?? "";
  const group = node?.group ?? "";
  const memoryType = node?.memory_type ?? "";
  const relevance = node?.relevance != null ? String(node.relevance) : "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="fb-memory-panel border text-[var(--fb-memory-text)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--fb-memory-heading)]">Memory node</DialogTitle>
          <DialogDescription className="text-[var(--fb-memory-text-muted)]">{name || "No description"}</DialogDescription>
        </DialogHeader>
        {(group || memoryType || relevance) && (
          <div className="mt-2 text-sm text-[var(--fb-memory-text-muted)] space-y-1">
            {group && <p>Group: {group}</p>}
            {memoryType && <p>Type: {memoryType}</p>}
            {relevance && <p>Relevance: {relevance}</p>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

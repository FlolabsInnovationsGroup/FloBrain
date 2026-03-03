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
      <DialogContent className="bg-black text-white">
        <DialogHeader>
          <DialogTitle>Memory node</DialogTitle>
          <DialogDescription>{name || "No description"}</DialogDescription>
        </DialogHeader>
        {(group || memoryType || relevance) && (
          <div className="mt-2 text-sm text-zinc-400 space-y-1">
            {group && <p>Group: {group}</p>}
            {memoryType && <p>Type: {memoryType}</p>}
            {relevance && <p>Relevance: {relevance}</p>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

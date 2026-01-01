"use client"
import { useState } from "react";
import { MemoryGraph } from "./components/MemoryGraph";
import { MemoryNodeDetailsDialog } from "./components/MemoryNodeDetailsDialog";
import { memoryNode } from "@/types/MemoryNode";

export default function Memory() {
  const [selectedNode, setSelectedNode] = useState<memoryNode | null>(null);
  const [openMemoryNodeDialog, setOpenMemoryNodeDialog] = useState<boolean>(false);

  function onOpenMemoryNodeDialog (node: memoryNode) {
      setSelectedNode(node);
      setOpenMemoryNodeDialog(true);
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 ">
      <h1 className="text-4xl font-bold text-[var(--color-memory)]">Universal Memory</h1>
      <MemoryGraph onOpenMemoryNodeDialog={onOpenMemoryNodeDialog}/>
      <MemoryNodeDetailsDialog open={openMemoryNodeDialog} setOpen={setOpenMemoryNodeDialog} description={selectedNode?.name}/>
    </main>
  );
}

"use client"
import { ReactFlow } from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import {  defaultEdgeOptions, nodeTypes } from "./flowSettings";
import { edgeType, nodeType } from "@/types/MemoryNode";
import { useMemoryNodes } from "./hooks/useMemoryNodes";

export default function Memory() {
  const [nodes, setNodes] = useState<nodeType[]>([]);
  const [edges, setEdges] = useState<edgeType[]>([]);
  
  const onSetNodes = useCallback((nodes: nodeType[]) => {
    if (nodes) setNodes(nodes);
  }, []);
  
  const onSetEdges = useCallback((edges: edgeType[]) => {
    if (edges) setEdges(edges);
  }, []);
  
  const {getNodesAndEdges} = useMemoryNodes({onSetNodes, onSetEdges});

  useEffect(()=>{
    getNodesAndEdges();
  },[getNodesAndEdges]);
  
  return (
    <main >
      <div className="w-[100vw] h-[100vh]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          nodesConnectable={false} 
          elementsSelectable={false} 
          nodesDraggable={false}
          fitView
          fitViewOptions={{ padding: 0.5 }}
          minZoom={0.1}
        />
      </div>
    </main>
  );
}

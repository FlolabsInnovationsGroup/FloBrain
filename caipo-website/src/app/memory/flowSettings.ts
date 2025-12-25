import { MemoryNode } from "./components/MemoryNode";

export const defaultEdgeOptions = {
  style: { stroke: '#FFFF', strokeWidth: 1 }, 
  type: 'smoothstep',                         
  animated: true,                             
};

export const nodeTypes = {
  customNode: MemoryNode, 
};
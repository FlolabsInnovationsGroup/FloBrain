import { edgeType, nodeType } from "@/types/MemoryNode"
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, SimulationLinkDatum, SimulationNodeDatum } from "d3-force";
import { memoryParticles } from "../mockData";
import { useCallback } from "react";

interface UseMemoryNodesProps {
    onSetNodes: (nodes: nodeType[]) => void;
    onSetEdges: (edges: edgeType[]) => void;
}
export const useMemoryNodes=({onSetEdges, onSetNodes}:UseMemoryNodesProps)=>{
  const particles = memoryParticles;

  const runSimulation = useCallback( (nodes: nodeType[], edges: edgeType[]) => {
        type D3Node = SimulationNodeDatum & { id: string };

        const d3Nodes: D3Node[] = nodes.map((n) => ({ id: n.id, x: n.position.x, y: n.position.y}));
        const d3Links = edges.map((e) => ({ source: e.source, target: e.target }));
        const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 400;
        const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 400;

        if(d3Nodes.length>0) {
            const simulation = forceSimulation(d3Nodes)
            .force("link", forceLink<D3Node, SimulationLinkDatum<D3Node>>(d3Links)
              .id((d) => d.id) 
              .distance(300))
            .force("charge", forceManyBody().strength(-1000)) 
            .force("center", forceCenter(centerX, centerY))
            .force("collision", forceCollide().radius(70))
            .stop();
        
            for (let i = 0; i < 300; ++i) simulation.tick();
        
            const positionedNodes: nodeType[] = d3Nodes
              .map((d3Node) => {
                const originalNode = nodes.find((n) => n.id === d3Node.id);
                if (!originalNode) return null;

                return {
                  ...originalNode,
                  position: { x: d3Node.x ?? 0, y: d3Node.y ?? 0 },
                };
              })
              .filter((node): node is nodeType => node !== null);
          
            onSetNodes(positionedNodes);
        }
    }, [onSetNodes]);

  const getNodesAndEdges = useCallback(() => {
  if (particles.length > 0) {
    const edges: edgeType[] = [];
    const validNodeIds = new Set(particles.map(p => p.id));

    const nodes = particles.map((particle) => {
      if (particle.relations.length > 0) {
        particle.relations.forEach((relation) => {
         if (relation && validNodeIds.has(relation)) {
            edges.push({
              id: `${particle.id}-${relation}`,
              source: particle.id,
              target: relation,
            });
          }
        });
      }

      return {
        id: particle.id,
        position: { x: 0, y: 0 },
        data: {
          label: particle.description,
        },
        type: "customNode",
      };
    });

    onSetEdges(edges);
    runSimulation(nodes, edges);
  }
}, [particles, onSetEdges, runSimulation]);

    return {getNodesAndEdges}
}
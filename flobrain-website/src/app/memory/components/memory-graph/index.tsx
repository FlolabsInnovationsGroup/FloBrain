"use client"
import dynamic from "next/dynamic";
import { memoryLinks, memoryNodes } from '../../mockData';
import { useEffect, useRef, useState } from "react";
import { memoryNode } from "../../../../types/MemoryNodes";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
})

interface MemoryGraphProps {
    onOpenMemoryNodeDialog: (node: memoryNode) => void;
    graphActive: boolean;
    setGraphActive: (active: boolean) => void;
}

export const MemoryGraph = ({onOpenMemoryNodeDialog, graphActive, setGraphActive}: MemoryGraphProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const handleOutsideClick = (e: React.MouseEvent) => {
        // Deactivate when clicking outside the border
        if (e.target === e.currentTarget && graphActive) {
            setGraphActive(false);
        }
    };

    const handleBorderClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Activate when clicking inside the border
        if (!graphActive) {
            setGraphActive(true);
        }
    };

    return (
        <div 
            ref={containerRef} 
            className="w-full h-full relative"
            onClick={handleOutsideClick}
        >
            {/* Instruction Message */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-black/50 text-white px-4 py-2 rounded-lg text-sm">
                {graphActive 
                    ? "Click outside the graph to navigate the memory page"
                    : "Click inside the border to interact with the graph"
                }
            </div>

            {/* Graph Container with Border */}
            <div 
                className={`w-full h-full border-4 rounded-xl transition-all duration-300 ${
                    graphActive 
                        ? 'border-[#a78bfa] shadow-lg shadow-[#a78bfa]/50' 
                        : 'border-[#4c1d95]/50'
                }`}
                onClick={handleBorderClick}
            >
                <div 
                    className="w-full h-full bg-transparent relative overflow-hidden rounded-lg"
                    style={{ pointerEvents: graphActive ? 'auto' : 'none' }}
                >
                    <ForceGraph2D
                        graphData={{nodes: memoryNodes, links: memoryLinks}}
                        width={dimensions.width}
                        height={dimensions.height}
                        nodeAutoColorBy="group"
                        nodeLabel="name"
                        onNodeClick={(node) => {
                            if (graphActive) {
                                onOpenMemoryNodeDialog(node);
                            }
                        }}
                        nodeCanvasObject={(node: memoryNode, ctx, globalScale) => {
                            const label = node.name.length>10 ? `${node.name.slice(0, 10)}...` : node.name;
                            const fontSize = 12 / globalScale;
                            ctx.font = `${fontSize}px Sans-Serif`;
                            const textWidth = ctx.measureText(label).width;
                            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillStyle = node.color;
                            ctx.fillText(label, node.x??0, node.y??0);
                            node.__bckgDimensions = bckgDimensions;
                        }}
                        nodePointerAreaPaint={(node: memoryNode, color, ctx) => {
                            ctx.fillStyle = color;
                            const bckgDimensions = node.__bckgDimensions;
                            const nodeX = node.x??0;
                            const nodeY = node.y??0;

                            if (bckgDimensions) {
                                ctx.fillRect(
                                    nodeX - bckgDimensions[0] / 2,
                                    nodeY - bckgDimensions[1] / 2,
                                    bckgDimensions[0],
                                    bckgDimensions[1]
                                );
                            }

                        }}
                        linkColor={() => "#ffffff"}
                        backgroundColor="rgba(0,0,0,0)"
                        enableNodeDrag={graphActive}
                        enableZoomInteraction={graphActive}
                        enablePanInteraction={graphActive}
                    />
                </div>
            </div>
        </div>
    )
}

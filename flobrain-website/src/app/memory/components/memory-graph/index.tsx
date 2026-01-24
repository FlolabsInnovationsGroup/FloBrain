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
}

export const MemoryGraph = ({onOpenMemoryNodeDialog}: MemoryGraphProps) => {
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

    return (
        <div ref={containerRef} className="w-full h-full bg-transparent relative overflow-hidden ">
            <ForceGraph2D
            graphData={{nodes: memoryNodes, links: memoryLinks}}
            width={dimensions.width}
            nodeAutoColorBy="group"
            nodeLabel="name"
            onNodeClick={(node) => onOpenMemoryNodeDialog(node)}
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

                bckgDimensions &&
                    ctx.fillRect(
                    nodeX - bckgDimensions[0] / 2,
                    nodeY - bckgDimensions[1] / 2,
                    bckgDimensions[0],
                    bckgDimensions[1]
                    )
            }}
            linkColor={() => "#ffffff"}
            backgroundColor="rgba(0,0,0,0)"
            />
        </div>
    )
}

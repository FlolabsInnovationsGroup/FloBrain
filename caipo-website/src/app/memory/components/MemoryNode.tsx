import { Handle, Position } from "@xyflow/react"

interface MemoryNodeProps {
    data: {label:string};
}
export const MemoryNode = ({data}:MemoryNodeProps) => {
    return (
        <div className="rounded-xl p-5 size-[100px] bg-white flex items-center justify-center">
            <Handle type="target" position={Position.Top} className="opacity-0"/>
            
            <div className="text-sm text-black truncate">
                {data.label}
            </div>

            <Handle type="source" position={Position.Bottom} className="opacity-0"/>
            
        </div>
    )
}
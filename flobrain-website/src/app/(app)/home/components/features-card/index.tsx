import React from "react";

interface FeaturesCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
}

export const FeaturesCard = ({icon, title, description, color}: FeaturesCardProps) =>{
    return (
        <div className="w-full h-[300] p-7 bg-white/17 rounded-[16px]">
            <div className="w-full px-5 py-4 rounded-[8px]" style={{backgroundColor: `color-mix(in srgb, ${color} 50%, transparent)`}}>
                {icon}    
            </div>
            <div className="font-bold mt-8">{title}</div>
            <div className="mt-4">{description}</div>
        </div>
    )
}
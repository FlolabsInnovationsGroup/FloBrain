import React from "react";

interface ApplicationsCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  tags: string[];
}

export const ApplicationsCard = ({ icon, title, description, tags }: ApplicationsCardProps) => {
  return (
    <div className="w-full h-[300] p-7 bg-white/17 rounded-[16px]">
      <div className="flex flex-row w-full gap-2 items-center">
        <div className="p-4 rounded-[8px] bg-[#53E1FD]/50">{icon}</div>
        <div className="font-bold">{title}</div>
      </div>
      <div className="mt-7">{description}</div>
      <div className="grid grid-cols-2 gap-x-7 gap-y-5 mt-[50px]">
        {tags.map((tag) => (
          <div className="px-3 py-2 bg-white/17 rounded-[16px] text-xs text-center" key={tag}>
            {tag}
          </div>
        ))}
      </div>
    </div>
  );
};

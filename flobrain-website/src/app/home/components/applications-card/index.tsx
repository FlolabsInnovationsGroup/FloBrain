import React from "react";

interface ApplicationsCardProps {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
  tags: string[];
}

export const ApplicationsCard = ({
  icon,
  iconColor,
  title,
  description,
  tags,
}: ApplicationsCardProps) => {
  return (
    <div className="w-full rounded-2xl p-6 md:p-7 fb-app-card text-left transition-colors">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-center gap-4">
          <div
            className="flex shrink-0 w-12 h-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${iconColor}30` }}
          >
            {icon}
          </div>
          <h3 className="text-2xl font-semibold text-white">{title}</h3>
        </div>
        <p className="text-sm font-normal leading-relaxed text-zinc-400">{description}</p>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            className="fb-app-card__tag inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300"
            key={tag}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

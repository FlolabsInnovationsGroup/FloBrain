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
    <div
      className="h-full w-full rounded-2xl p-3 md:p-6 bg-[#181024] light:bg-[var(--fb-card-bg)] border border-white/[0.08] light:border-[var(--fb-card-border)] text-left transition-colors flex flex-col"
    >
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
            className="inline-flex items-center rounded-lg border border-white/20 light:border-[var(--fb-card-border)] bg-[#FFFFFF0D] light:bg-white/40 px-3 py-1.5 text-xs font-medium text-[#9CA3AF] light:text-[var(--fb-text-muted)]"
            style={{ fontFamily: "Consolas, monospace" }}
            key={tag}
          >
            &lt;{tag} /&gt;
          </span>
        ))}
      </div>
    </div>
  );
};

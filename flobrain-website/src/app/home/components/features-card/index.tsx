import React from "react";

interface FeaturesCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

export const FeaturesCard = ({ icon, title, description, color }: FeaturesCardProps) => {
  return (
    <div className="fb-feature-card w-full overflow-hidden rounded-2xl text-left transition-colors dark:shadow-[0_0_48px_-12px_rgba(236,72,153,0.08)]">
      <div
        className="fb-feature-card__header flex items-center gap-3 px-6 py-4"
        style={{ backgroundColor: color }}
      >
        <div className="flex shrink-0 items-center justify-center [&_svg]:text-white">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      <div className="fb-feature-card__body p-8 pt-6">
        <p className="w-[90%] text-sm font-normal leading-relaxed text-slate-300/90 dark:text-slate-300/90">
          {description}
        </p>
      </div>
    </div>
  );
};

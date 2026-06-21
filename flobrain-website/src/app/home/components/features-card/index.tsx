import React from "react";

interface FeaturesCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

export const FeaturesCard = ({ icon, title, description, color }: FeaturesCardProps) => {
  return (
<<<<<<< HEAD
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
=======
    <div
      className="h-full w-full rounded-2xl p-2 md:p-8 flex flex-col justify-between text-left bg-[#E3E3E31A] border border-white/[0.06] transition-colors"
      style={{
        boxShadow:
          "0 0 0 1px rgba(168, 85, 247, 0.08), 0 0 24px -4px rgba(168, 85, 247, 0.15), 0 0 48px -12px rgba(236, 72, 153, 0.08)",
      }}
    >
      <div className="flex items-start justify-start">{icon}</div>
      <h3 className="mt-6 text-lg font-bold text-white">{title}</h3>
      <p className="mt-4 text-sm font-normal leading-relaxed text-slate-300/90 w-[80%]">
        {description}
      </p>
>>>>>>> origin/main
    </div>
  );
};

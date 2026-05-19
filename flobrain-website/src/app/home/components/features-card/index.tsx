import React from "react";

interface FeaturesCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

export const FeaturesCard = ({ icon, title, description }: FeaturesCardProps) => {
  return (
    <div className="w-full rounded-2xl p-8 text-left fb-feature-card transition-colors dark:shadow-[0_0_48px_-12px_rgba(236,72,153,0.08)]">
      <div className="flex items-start justify-start">{icon}</div>
      <h3 className="mt-6 text-lg font-bold text-white">{title}</h3>
      <p className="mt-4 text-sm font-normal leading-relaxed text-slate-300/90 w-[80%] dark:text-slate-300/90">
        {description}
      </p>
    </div>
  );
};

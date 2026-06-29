"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { settingsCardClass } from "../settings-styles";
import { cn } from "@/lib/utils";

const faqItems = [
  "FAQ Placeholder Question 1",
  "FAQ Placeholder Question 2",
  "FAQ Placeholder Question 3",
  "FAQ Placeholder Question 4",
];

export default function HelpSettings() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {faqItems.map((item, index) => (
        <button
          key={index}
          type="button"
          onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
          className={cn(
            settingsCardClass,
            "group flex w-full items-center justify-between text-left transition-colors hover:border-white/20"
          )}
        >
          <span className="font-medium text-white">{item}</span>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-white/70 transition-transform",
              expandedIndex === index && "rotate-180"
            )}
          />
        </button>
      ))}
    </div>
  );
}

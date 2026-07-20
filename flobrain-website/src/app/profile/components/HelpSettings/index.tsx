"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqItems = [
  "FAQ Placeholder Question 1",
  "FAQ Placeholder Question 2",
  "FAQ Placeholder Question 3",
  "FAQ Placeholder Question 4",
];

export default function HelpSettings() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqItems.map((item, index) => (
        <button
          key={index}
          type="button"
          onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
          className="fb-profile-card group flex w-full items-center justify-between rounded-xl px-4 py-4 text-left transition-colors hover:opacity-95"
        >
          <span className="fb-profile-title text-sm font-medium">{item}</span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 transition-transform fb-profile-label ${
              expandedIndex === index ? "rotate-180" : ""
            }`}
          />
        </button>
      ))}
    </div>
  );
}

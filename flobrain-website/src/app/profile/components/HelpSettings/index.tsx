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
    <div className="space-y-4">
      {faqItems.map((item, index) => (
        <button
          key={index}
          onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
          className="w-full flex items-center justify-between p-4 bg-[#281C30] border border-zinc-500/50 rounded-lg hover:border-zinc-400/50 transition-colors text-left group"
        >
          <span className="text-white font-medium">{item}</span>
          <ChevronDown
            className={`w-5 h-5 text-white/70 transition-transform ${
              expandedIndex === index ? "rotate-180" : ""
            }`}
          />
        </button>
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { settingsCardClass } from "../settings-styles";
import { cn } from "@/lib/utils";

const faqItems = [
  {
    question:
      'What are "Memory Chunks" and "Summaries" in the Load Memory module?',
    answer: (
      <>
        To provide deep long-term context, FloBrain breaks down your past
        interactions and uploaded data into an interconnected knowledge graph.{" "}
        <strong>Memory Chunks</strong> represent raw semantic data vectors,
        while <strong>Summaries</strong> are condensed, high-level abstractions
        of major topics or projects. These nodes are dynamically activated
        during relevant conversations to eliminate context drift.
      </>
    ),
  },
  {
    question:
      'Why does my System Dashboard say "Offline" under System Health?',
    answer: (
      <>
        The &quot;Offline&quot; indicator on your System Dashboard typically
        means the local bridge agent or database connection to your hardware
        node is temporarily interrupted, even if the primary cloud services
        remain online. Check your internet connection, refresh your credentials
        under the Preferences panel, or contact technical support.
      </>
    ),
  },
  {
    question:
      'How are "Confidence" percentages and latency metrics calculated?',
    answer: (
      <>
        Latency measures the round-trip time, in milliseconds, from your prompt
        submission to the model&apos;s initial token generation. The Confidence
        score is derived from our proprietary meta-evaluation layer, which ranks
        how well a model&apos;s predicted output aligns with the contextual
        boundaries and constraints defined in your system architecture.
      </>
    ),
  },
  {
    question: "How does FloBrain decide which AI model to use for my prompt?",
    answer: (
      <>
        FloBrain utilizes a real-time semantic routing orchestration engine.
        When you submit a prompt, our system evaluates the complexity, context,
        and required capabilities of the request against the real-time
        availability, latency, and confidence scores of our connected models,
        including GPT-4o, Claude 3.5, and Gemini 1.5, to deliver the optimal
        response.
      </>
    ),
  },
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
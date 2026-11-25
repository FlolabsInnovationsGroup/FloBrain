import type { Metadata } from "next";
import { QuickPromptsScreen } from "@/components/v2/chats/QuickPromptsScreen";

export const metadata: Metadata = {
  title: "Quick prompts",
};

export default function QuickPromptsPage() {
  return <QuickPromptsScreen />;
}

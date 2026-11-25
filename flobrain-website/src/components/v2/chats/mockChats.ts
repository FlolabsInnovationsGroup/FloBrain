import type {
  AssistantContent,
  ChatConversation,
  ChatModelOption,
  ChatSummary,
  ChatUser,
  QuickPrompt,
  TeamRoom,
} from "./chatTypes";

/**
 * Mock data for the V2 chat flow. The pages are not wired to the chat API yet;
 * swap these for TanStack Query calls through src/lib/api.ts when the backend lands.
 */

export const mockChatUser: ChatUser = {
  name: "Chilo Cynthia",
  firstName: "Chilo Cynthia",
  plan: "Free plan",
};

export const mockRecentChats: ChatSummary[] = [
  { id: "benefits-of-ux-design", title: "Benefits of UX design" },
  { id: "website-launch-plan", title: "Website launch plan" },
  { id: "summarize-design-notes", title: "Summarize design notes" },
];

/** "Auto" is the default in every frame; the rest follow feature 3 (choose an LLM). */
export const mockModelOptions: ChatModelOption[] = [
  { value: "auto", label: "Auto" },
  { value: "claude", label: "Claude" },
  { value: "gpt", label: "GPT" },
  { value: "gemini", label: "Gemini" },
];

export const newChatSuggestions = [
  {
    id: "summarize",
    icon: "file" as const,
    title: "Summarize a document",
    description: "Find the key points, without the information overload.",
    prompt: "Summarize a document for me and pull out the key points.",
  },
  {
    id: "explore",
    icon: "idea" as const,
    title: "Explore an idea",
    description: "Turn a rough thought into a clear starting point.",
    prompt: "Help me explore an idea and turn it into a clear starting point.",
  },
  {
    id: "plan",
    icon: "plan" as const,
    title: "Make a plan",
    description: "Break a big goal into small, practical steps.",
    prompt: "Help me break a big goal into small, practical steps.",
  },
];

export const quickPromptFilters = [
  { value: "all", label: "All prompts" },
  { value: "writing", label: "Writing" },
  { value: "ideas", label: "Ideas" },
  { value: "planning", label: "Planning" },
] as const;

export const mockQuickPrompts: QuickPrompt[] = [
  {
    id: "summarize-document",
    category: "summarize",
    title: "Summarize a document",
    description: "Turn a long document into a short, clear summary with the key takeaways.",
    prompt: "Summarize this document into a short, clear summary with the key takeaways.",
  },
  {
    id: "explore-design-idea",
    category: "ideas",
    title: "Explore a design idea",
    description: "Brainstorm practical directions for your next creative project.",
    prompt: "Brainstorm practical directions for my next creative project.",
  },
  {
    id: "write-case-study",
    category: "writing",
    title: "Write a case study",
    description: "Shape your work into a simple story: the challenge, process, and outcome.",
    prompt: "Help me write a case study covering the challenge, the process, and the outcome.",
  },
  {
    id: "plan-project",
    category: "planning",
    title: "Plan a project",
    description: "Create a step-by-step plan with clear priorities and milestones.",
    prompt: "Create a step-by-step project plan with clear priorities and milestones.",
  },
];

const uxAnswer: AssistantContent = {
  heading: "Good design makes life easier.",
  paragraphs: [
    "UI is how a product looks. UX is how it works and feels.",
    "Together, they help people get things done with less effort.",
  ],
  points: [
    {
      title: "Less confusion",
      body: "Clear labels and familiar patterns help people find their way.",
    },
    {
      title: "More confidence",
      body: "Consistent feedback makes every next step feel predictable.",
    },
    {
      title: "Better results",
      body: "A simpler journey helps people complete what they came to do.",
    },
  ],
  followUp: "How can I improve my website's UX?",
};

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

export function getMockConversation(id: string): ChatConversation | undefined {
  const summary = mockRecentChats.find((chat) => chat.id === id);
  if (!summary) return undefined;

  if (id === "benefits-of-ux-design") {
    return {
      ...summary,
      messages: [
        {
          id: "m1",
          author: "user",
          sentAt: hoursAgo(2),
          text: "What are the benefits of UI/UX design?",
        },
        { id: "m2", author: "assistant", sentAt: hoursAgo(2), content: uxAnswer },
      ],
    };
  }

  return {
    ...summary,
    messages: [
      { id: "m1", author: "user", sentAt: hoursAgo(30), text: summary.title },
      {
        id: "m2",
        author: "assistant",
        sentAt: hoursAgo(30),
        content: {
          paragraphs: [
            "This is a saved sample conversation. Real history will load here once chats are connected to the backend.",
          ],
        },
      },
    ],
  };
}

/**
 * Placeholder reply shown after the loading state, until the AI chat API is connected.
 */
export function mockAssistantReply(prompt: string, documentName?: string): AssistantContent {
  const subject = documentName ? `"${documentName}"` : "your message";
  return {
    paragraphs: [
      `FloBrain received ${subject}. Answers will appear here once this page is connected to the AI chat service.`,
      `You asked: ${prompt}`,
    ],
  };
}

export const mockTeamRooms: TeamRoom[] = [
  {
    id: "product-design-team",
    name: "Product Design Team",
    members: ["Chilo Cynthia", "Alex Morgan", "Sam Lee"],
    suggestions: [
      {
        id: "latest-notes",
        title: "Summarize our latest notes",
        prompt: "Summarize our latest notes.",
      },
      {
        id: "next-work",
        title: "What should we work on next?",
        prompt: "What should we work on next?",
      },
    ],
    resources: [
      {
        id: "website-redesign",
        title: "Website redesign · Design notes",
        meta: "Updated today by Cynthia · 2 documents in this room",
      },
    ],
  },
];

export function getMockTeamRoom(id: string): TeamRoom | undefined {
  return mockTeamRooms.find((room) => room.id === id);
}

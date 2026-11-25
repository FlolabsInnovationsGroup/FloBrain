"use client";

import { ArrowRight, ClipboardList, FileText, Lightbulb } from "lucide-react";
import { ChatScreen } from "./ChatScreen";
import { mockChatUser, newChatSuggestions } from "./mockChats";

const SUGGESTION_ICONS = {
  file: FileText,
  idea: Lightbulb,
  plan: ClipboardList,
} as const;

export function NewChatScreen({ initialPrompt }: { initialPrompt?: string }) {
  return (
    <ChatScreen
      title="New chat"
      subtitle="Your personal AI workspace"
      initialPrompt={initialPrompt}
      renderWelcome={(send) => (
        <>
          <p className="fb-v2-chat-kicker">A little clarity, every day</p>
          <h2 className="fb-v2-chat-hero">Hi, {mockChatUser.firstName}</h2>
          <p className="fb-v2-chat-lede">What would you like to make easier today?</p>
          <div className="fb-v2-chat-cards">
            {newChatSuggestions.map((suggestion) => {
              const Icon = SUGGESTION_ICONS[suggestion.icon];
              return (
                <button
                  key={suggestion.id}
                  type="button"
                  className="fb-v2-chat-card"
                  onClick={() => send(suggestion.prompt)}
                >
                  <Icon size={16} aria-hidden="true" />
                  <span className="fb-v2-chat-card-title">{suggestion.title}</span>
                  <span className="fb-v2-chat-card-text">{suggestion.description}</span>
                  <ArrowRight size={14} className="fb-v2-chat-card-arrow" aria-hidden="true" />
                </button>
              );
            })}
          </div>
          <p className="fb-v2-chat-hint">
            Start with a suggestion, or ask your own question below.
          </p>
        </>
      )}
    />
  );
}

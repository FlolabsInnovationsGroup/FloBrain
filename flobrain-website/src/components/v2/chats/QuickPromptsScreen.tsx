"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BookOpen, ClipboardList, FileText, Lightbulb, Search } from "lucide-react";
import { ChatScreen } from "./ChatScreen";
import type { PromptCategory } from "./chatTypes";
import { mockQuickPrompts, quickPromptFilters } from "./mockChats";

type FilterValue = (typeof quickPromptFilters)[number]["value"];

const CATEGORY_ICONS: Record<PromptCategory, typeof FileText> = {
  summarize: FileText,
  ideas: Lightbulb,
  writing: BookOpen,
  planning: ClipboardList,
};

export function filterQuickPrompts(filter: FilterValue, query: string) {
  const normalized = query.trim().toLowerCase();
  return mockQuickPrompts.filter((prompt) => {
    if (filter !== "all" && prompt.category !== filter) return false;
    if (!normalized) return true;
    return `${prompt.title} ${prompt.description}`.toLowerCase().includes(normalized);
  });
}

export function QuickPromptsScreen() {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [query, setQuery] = useState("");
  const prompts = filterQuickPrompts(filter, query);

  return (
    <ChatScreen
      title="Quick prompts"
      subtitle="A little help getting started"
      renderWelcome={() => (
        <>
          <p className="fb-v2-chat-lede">Choose a prompt, add your details, and make it yours.</p>
          <label className="fb-v2-chat-prompt-search">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">Search prompts</span>
            <input
              type="search"
              placeholder="Search prompts"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="fb-v2-chat-chips" role="group" aria-label="Prompt categories">
            {quickPromptFilters.map((option) => (
              <button
                key={option.value}
                type="button"
                className="fb-v2-chat-chip"
                aria-pressed={filter === option.value}
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          {prompts.length ? (
            <div className="fb-v2-chat-cards fb-v2-chat-cards-2">
              {prompts.map((prompt) => {
                const Icon = CATEGORY_ICONS[prompt.category];
                return (
                  <Link
                    key={prompt.id}
                    href={`/chats?prompt=${encodeURIComponent(prompt.prompt)}`}
                    className="fb-v2-chat-card fb-v2-chat-card-lg"
                  >
                    <span className="fb-v2-chat-card-top">
                      <span className="fb-v2-chat-card-tag">
                        <Icon size={16} aria-hidden="true" />
                        {prompt.category}
                      </span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </span>
                    <span className="fb-v2-chat-card-title">{prompt.title}</span>
                    <span className="fb-v2-chat-card-text">{prompt.description}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="fb-v2-chat-empty">No prompts match your search.</p>
          )}
        </>
      )}
    />
  );
}

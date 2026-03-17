"use client";

import type { Message } from '@/types/chat';
import { useEffect, useRef, useState, useMemo } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import synthesizingCircle from '@/assets/images/synthesiznig-circle.svg';

const ANSWER_TABS = ['ChatGPT', 'Claude', 'Gemini'] as const;
type AnswerTab = (typeof ANSWER_TABS)[number];

/** Selected tab: full background. Unselected: border in same color (no fill). */
const TAB_COLORS: Record<AnswerTab, string> = {
  ChatGPT: '#029AA2',
  Claude: '#9A02A2',
  Gemini: '#A27A02',
};

interface ChatAreaProps {
  messages: Message[];
  isLoading?: boolean;
}

function MessageBubble({ message }: { message: Message }) {
  const gradientId = `brainGradient-${message.id}`;
  return (
    <div
      className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {message.type === 'assistant' && (
        <div className="w-10 h-10 flex-shrink-0">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" fill={`url(#${gradientId})`} opacity="0.2"/>
            <circle cx="20" cy="12" r="3" fill={`url(#${gradientId})`}/>
            <circle cx="12" cy="20" r="3" fill={`url(#${gradientId})`}/>
            <circle cx="28" cy="20" r="3" fill={`url(#${gradientId})`}/>
            <circle cx="16" cy="28" r="3" fill={`url(#${gradientId})`}/>
            <circle cx="24" cy="28" r="3" fill={`url(#${gradientId})`}/>
            <line x1="20" y1="15" x2="15" y2="18" stroke={`url(#${gradientId})`} strokeWidth="1.5"/>
            <line x1="20" y1="15" x2="25" y2="18" stroke={`url(#${gradientId})`} strokeWidth="1.5"/>
            <line x1="12" y1="23" x2="16" y2="26" stroke={`url(#${gradientId})`} strokeWidth="1.5"/>
            <line x1="28" y1="23" x2="24" y2="26" stroke={`url(#${gradientId})`} strokeWidth="1.5"/>
            <line x1="15" y1="20" x2="16" y2="25" stroke={`url(#${gradientId})`} strokeWidth="1.5"/>
            <line x1="25" y1="20" x2="24" y2="25" stroke={`url(#${gradientId})`} strokeWidth="1.5"/>
            <defs>
              <linearGradient id={gradientId} x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8B5CF6"/>
                <stop offset="1" stopColor="#6366F1"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}
      <div
        className={`max-w-2xl rounded-2xl px-5 py-4 ${
          message.type === 'user'
            ? 'bg-[#7c5dbd]/30 text-white/90'
            : 'bg-[#3d2b5f]/40 text-white/80'
        }`}
      >
        {message.image && (
          <div className="mb-3">
            <Image
              src={message.image}
              alt="User upload"
              width={500}
              height={300}
              className="max-w-full h-auto rounded-lg border border-white/10"
            />
          </div>
        )}
        {message.text && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-white">{message.text}</p>
        )}
      </div>
    </div>
  );
}

function ResponsePanel({
  userMessage,
  assistantMessage,
  isLoading,
  selectedModel,
  onSelectModel,
}: {
  userMessage: Message;
  assistantMessage: Message | null;
  isLoading: boolean;
  selectedModel: AnswerTab;
  onSelectModel: (model: AnswerTab) => void;
}) {
  return (
    <div className="space-y-4 pt-2">
      <MessageBubble message={userMessage} />
      <div className="flex flex-col gap-0">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" aria-hidden />
          <span className="text-sm font-medium text-white/90">FloBrain</span>
        </div>
        <div className="rounded-xl bg-[#0B0719]/80 border border-white/10 overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 p-3 border-b border-white/10">
            {ANSWER_TABS.map((model) => {
              const isSelected = selectedModel === model;
              const color = TAB_COLORS[model];
              return (
                <button
                  key={model}
                  type="button"
                  onClick={() => onSelectModel(model)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    isSelected ? 'text-white' : 'bg-[#0B0719]/60 text-white/90 hover:bg-white/5'
                  }`}
                  style={{
                    backgroundColor: isSelected ? color : undefined,
                    borderColor: color,
                  }}
                >
                  {model}
                </button>
              );
            })}
            <button
              type="button"
              className="ml-1 p-2 rounded-lg border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-colors"
              aria-label="Add model"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 min-h-[120px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] flex-shrink-0">
                  <Image
                    src={synthesizingCircle}
                    alt=""
                    width={240}
                    height={240}
                    className="w-full h-full object-contain animate-pulse"
                  />
                </div>
                <p className="mt-6 text-xl font-semibold text-white tracking-widest">
                  SYNTHESIZING...
                </p>
                <p className="mt-2 text-sm text-white/60">
                  Neural pathways converging • 3 models active
                </p>
              </div>
            ) : assistantMessage?.text ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-white/90">
                {assistantMessage.text}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatArea({ messages, isLoading = false }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedModel, setSelectedModel] = useState<AnswerTab>('ChatGPT');

  const { showResponseBlock, historyMessages, lastUserMessage, lastAssistantMessage } =
    useMemo(() => {
      const last = messages[messages.length - 1];
      const secondLast = messages[messages.length - 2];
      const showLoading =
        messages.length > 0 && last?.type === 'user' && isLoading;
      const showAnswer =
        messages.length >= 2 &&
        last?.type === 'assistant' &&
        secondLast?.type === 'user';
      const show = showLoading || showAnswer;
      return {
        showResponseBlock: show,
        historyMessages: showLoading
          ? messages.slice(0, -1)
          : showAnswer
            ? messages.slice(0, -2)
            : messages,
        lastUserMessage: show ? (showLoading ? last : secondLast) : null,
        lastAssistantMessage: showAnswer ? last : null,
      };
    }, [messages, isLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showResponseBlock]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-16 h-16 mb-4">
              <svg width="64" height="64" viewBox="0 0 32 32" fill="none">
                <path d="M16 4L8 8V14C8 19.5 11.5 24.5 16 26C20.5 24.5 24 19.5 24 14V8L16 4Z" fill="url(#gradient)" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 14L15 17L20 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="gradient" x1="8" y1="4" x2="24" y2="26" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8B5CF6"/>
                    <stop offset="1" stopColor="#6366F1"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white/90 mb-2">Start a conversation</h2>
            <p className="text-white/60">Type a message below to begin chatting with FLOBRAIN AI</p>
          </div>
        ) : (
          <>
            {historyMessages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {showResponseBlock && lastUserMessage && (
              <ResponsePanel
                userMessage={lastUserMessage}
                assistantMessage={lastAssistantMessage ?? null}
                isLoading={isLoading}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
              />
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  );
}
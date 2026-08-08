"use client";

import type { Message } from '@/types/chat';
import { useEffect, useRef, useState, useMemo } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  compactMode?: boolean;
  autoScroll?: boolean;
}

/** Renders assistant text as markdown; Tailwind preflight strips list/heading
 *  defaults, so element styles are restored via arbitrary variants. */
function MarkdownText({ text, compactMode = false }: { text: string; compactMode?: boolean }) {
  return (
    <div
      className={`text-white/90 ${compactMode ? 'text-[13px] leading-6' : 'text-sm leading-relaxed'}
        [&_p]:mb-2 [&_p:last-child]:mb-0
        [&_strong]:font-semibold [&_strong]:text-white
        [&_em]:italic
        [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5
        [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5
        [&_li]:mb-1
        [&_h1]:mt-3 [&_h1]:mb-1 [&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-white
        [&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-white
        [&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:font-semibold [&_h3]:text-white
        [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.9em]
        [&_pre]:mb-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-black/40 [&_pre]:p-3
        [&_pre_code]:bg-transparent [&_pre_code]:p-0
        [&_blockquote]:mb-2 [&_blockquote]:border-l-2 [&_blockquote]:border-white/30 [&_blockquote]:pl-3 [&_blockquote]:text-white/70
        [&_table]:mb-2 [&_table]:w-full [&_table]:border-collapse
        [&_th]:border [&_th]:border-white/20 [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-semibold
        [&_td]:border [&_td]:border-white/20 [&_td]:px-2 [&_td]:py-1
        [&_a]:text-indigo-300 [&_a]:underline
        [&_hr]:my-3 [&_hr]:border-white/20`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  );
}

function MessageBubble({ message, compactMode = false }: { message: Message; compactMode?: boolean }) {
  const gradientId = `brainGradient-${message.id}`;
  return (
    <div
      className={`flex gap-2 sm:gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {message.type === 'assistant' && (
        <div className="h-8 w-8 flex-shrink-0 sm:h-10 sm:w-10">
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
        className={`max-w-[92%] sm:max-w-2xl rounded-2xl ${compactMode ? 'px-3 py-2.5 sm:px-4 sm:py-3' : 'px-4 py-3 sm:px-5 sm:py-4'} ${
          message.type === 'user'
            ? 'bg-[var(--fb-chat-bubble-user)] text-white'
            : 'bg-[var(--fb-chat-bubble-assistant)] fb-text dark:text-white/80'
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
        {message.text &&
          (message.type === 'assistant' ? (
            <MarkdownText text={message.text} compactMode={compactMode} />
          ) : (
            <p
              className={`whitespace-pre-wrap text-white ${
                compactMode ? 'text-[13px] leading-6' : 'text-sm leading-relaxed'
              }`}
            >
              {message.text}
            </p>
          ))}
        {message.type === 'assistant' &&
          (message.prompt_tokens != null || message.completion_tokens != null) && (
            <p
              className="mt-2 text-[10px] sm:text-[11px] opacity-50"
              style={{ color: 'var(--fb-text-subtle)' }}
            >
              {message.prompt_tokens ?? 0} in · {message.completion_tokens ?? 0} out tokens
            </p>
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
  compactMode = false,
}: {
  userMessage: Message;
  assistantMessage: Message | null;
  isLoading: boolean;
  selectedModel: AnswerTab;
  onSelectModel: (model: AnswerTab) => void;
  compactMode?: boolean;
}) {
  return (
    <div className={`${compactMode ? 'space-y-3 pt-1' : 'space-y-4 pt-2'}`}>
      <MessageBubble message={userMessage} compactMode={compactMode} />
      <div className="flex flex-col gap-0">
        <div className={`flex items-center gap-2 ${compactMode ? 'mb-2' : 'mb-3'}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" aria-hidden />
          <span className="text-sm font-medium text-white/90">FloBrain</span>
        </div>
        <div className="rounded-xl bg-[#0B0719]/80 border border-white/10 overflow-hidden">
          <div
            className={`flex flex-wrap items-center gap-1.5 sm:gap-2 border-b border-white/10 ${
              compactMode ? 'p-2' : 'p-2.5 sm:p-3'
            }`}
          >
            {ANSWER_TABS.map((model) => {
              const isSelected = selectedModel === model;
              const color = TAB_COLORS[model];
              return (
                <button
                  key={model}
                  type="button"
                  onClick={() => onSelectModel(model)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
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
              className="ml-1 rounded-lg border border-white/20 p-1.5 text-white/70 transition-colors hover:border-white/40 hover:text-white sm:p-2"
              aria-label="Add model"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className={`${compactMode ? 'min-h-[96px] p-3' : 'min-h-[120px] p-3 sm:p-4'}`}>
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
              <MarkdownText text={assistantMessage.text} compactMode={compactMode} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatArea({
  messages,
  isLoading = false,
  compactMode = false,
  autoScroll = true,
}: ChatAreaProps) {
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
    if (!autoScroll) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showResponseBlock, autoScroll]);

  return (
    <div className={`flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 ${compactMode ? 'py-3 sm:py-4' : 'py-5 sm:py-8'}`}>
      <div className={`mx-auto max-w-4xl ${compactMode ? 'space-y-3' : 'space-y-4 sm:space-y-6'}`}>
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-12 text-center sm:py-20">
            <div className="mb-4 h-14 w-14 sm:h-16 sm:w-16">
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
            <h2 className="mb-2 text-xl font-semibold text-white/90 sm:text-2xl">Start a conversation</h2>
            <p className="text-sm text-white/60 sm:text-base">Type a message below to begin chatting with FLOBRAIN AI</p>
          </div>
        ) : (
          <>
            {historyMessages.map((message) => (
              <MessageBubble key={message.id} message={message} compactMode={compactMode} />
            ))}

            {showResponseBlock && lastUserMessage && (
              <ResponsePanel
                userMessage={lastUserMessage}
                assistantMessage={lastAssistantMessage ?? null}
                isLoading={isLoading}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                compactMode={compactMode}
              />
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  );
}
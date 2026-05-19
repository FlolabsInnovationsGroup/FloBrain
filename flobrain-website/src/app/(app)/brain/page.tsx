'use client';

import { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ChatHistory, Folder, Message } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { apiChatToChatHistory, apiChatListToChatHistory } from './lib/brainApi';
import { LeftPanel } from '@/app/home/components/left-panel';
import ChatArea from './components/ChatArea/index';
import ChatInput from './components/MessageInput/index';
import jsPDF from 'jspdf';
import { Menu, X } from 'lucide-react';

const WELCOME_MESSAGE: Message = {
  id: 'msg-welcome',
  type: 'assistant',
  text: "Hello! I'm FLOBRAIN AI. How can I assist you today?",
  timestamp: new Date(),
};

function sortChatsByLastUsed(chats: ChatHistory[]): ChatHistory[] {
  return [...chats].sort((a, b) => {
    const tA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
    const tB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
    return tB - tA; // newest first
  });
}

function BrainPageFallback() {
  return (
    <div className="flex h-screen bg-[#1a0b2e] text-white items-center justify-center">
      <div className="animate-pulse text-white/60">Loading...</div>
    </div>
  );
}

type BrainPreferences = {
  showConfidencePanel: boolean;
  compactMode: boolean;
  autoScroll: boolean;
  enableVoiceInput: boolean;
  enableImageUpload: boolean;
};

const DEFAULT_PREFERENCES: BrainPreferences = {
  showConfidencePanel: true,
  compactMode: false,
  autoScroll: true,
  enableVoiceInput: true,
  enableImageUpload: true,
};

function PreferenceToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="mt-1 text-xs text-white/60">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
          checked ? 'bg-violet-500' : 'bg-white/20'
        }`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-white transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

function PreferencesModal({
  open,
  preferences,
  onClose,
  onChange,
}: {
  open: boolean;
  preferences: BrainPreferences;
  onClose: () => void;
  onChange: (prefs: BrainPreferences) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-violet-400/30 bg-[#120724] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Preferences</h2>
            <p className="text-xs text-white/60">Control Brain page features and layout.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Close preferences"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3 p-5">
          <PreferenceToggle
            label="Show confidence panel"
            description="Display model confidence cards on the right side."
            checked={preferences.showConfidencePanel}
            onChange={(showConfidencePanel) => onChange({ ...preferences, showConfidencePanel })}
          />
          <PreferenceToggle
            label="Compact mode"
            description="Reduce spacing in the chat feed."
            checked={preferences.compactMode}
            onChange={(compactMode) => onChange({ ...preferences, compactMode })}
          />
          <PreferenceToggle
            label="Auto-scroll"
            description="Scroll to the latest message automatically."
            checked={preferences.autoScroll}
            onChange={(autoScroll) => onChange({ ...preferences, autoScroll })}
          />
          <PreferenceToggle
            label="Voice input"
            description="Enable microphone capture in the composer."
            checked={preferences.enableVoiceInput}
            onChange={(enableVoiceInput) => onChange({ ...preferences, enableVoiceInput })}
          />
          <PreferenceToggle
            label="Image upload"
            description="Enable image upload in the composer."
            checked={preferences.enableImageUpload}
            onChange={(enableImageUpload) => onChange({ ...preferences, enableImageUpload })}
          />
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-white/10 px-5 py-4">
          <button
            type="button"
            onClick={() => onChange(DEFAULT_PREFERENCES)}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfidencePanel() {
  const cards = [
    { model: 'GPT-4o', confidence: 87, latency: '151ms', tokens: '2.9K' },
    { model: 'Claude 3.5', confidence: 94, latency: '149ms', tokens: '3.0K' },
    { model: 'Gemini 1.5', confidence: 73, latency: '120ms', tokens: '3.4K' },
  ];
  return (
    <aside
      className="w-full shrink-0 rounded-xl border p-4 xl:w-[300px] light:border-[#9b8ab8]/40"
      style={{
        background: "var(--fb-confidence-panel-bg)",
        borderColor: "var(--fb-panel-border)",
      }}
    >
      <h3 className="mb-3 text-sm font-semibold text-white">Confidence</h3>
      <div className="space-y-3">
        {cards.map((card) => (
          <div key={card.model} className="rounded-lg border border-white/10 bg-[#130A2D] p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white">{card.model}</p>
              <span className="text-xs text-white/80">{card.confidence}%</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#6C63FF] to-[#A855F7]"
                style={{ width: `${card.confidence}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-white/60">
              <span>Latency {card.latency}</span>
              <span>Tokens {card.tokens}</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function BrainPageContent() {
  const { isAuthenticated } = useAuth();
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [_folders, setFolders] = useState<Folder[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialInputValue, setInitialInputValue] = useState<string | null>(null);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [preferences, setPreferences] = useState<BrainPreferences>(DEFAULT_PREFERENCES);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Store pending message to send after chat creation
  const pendingMessageRef = useRef<{ text: string; image?: string } | null>(null);

  // Fetch chats from backend when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      queueMicrotask(() => setChatsLoading(false));
      return;
    }
    queueMicrotask(() => {
      setChatsLoading(true);
      setError(null);
    });
    api
      .getChats()
      .then((res) => {
        if (res.error) {
          setError(res.error);
          return;
        }
        if (res.data) {
          const list = apiChatListToChatHistory(res.data);
          setChatHistory(sortChatsByLastUsed(list));
        }
      })
      .finally(() => setChatsLoading(false));
  }, [isAuthenticated]);

  const applyChatFromApi = useCallback((chat: ChatHistory) => {
    setChatHistory((prev) => {
      const idx = prev.findIndex((c) => c.id === chat.id);
      if (idx === -1) return sortChatsByLastUsed([chat, ...prev]);
      const next = [...prev];
      next[idx] = chat;
      return sortChatsByLastUsed(next);
    });
  }, []);

  // Unused "New Chat" = title is "New Chat" and no user messages yet
  const isUnusedNewChat = useCallback((chat: ChatHistory) => {
    if (chat.title !== 'New Chat') return false;
    const hasUserMessage = chat.messages.some((m) => m.type === 'user');
    return !hasUserMessage;
  }, []);

  // New chat: reuse existing unused "New Chat" if any; otherwise create one (max one empty new chat in history).
  // Always move the (reused or new) chat to the top of the list and open it.
  const handleNewChat = useCallback(async () => {
    const existingUnused = chatHistory.find(isUnusedNewChat);
    if (existingUnused) {
      setCurrentChatId(existingUnused.id);
      const msgs =
        existingUnused.messages.length > 0
          ? existingUnused.messages
          : [WELCOME_MESSAGE];
      setMessages(msgs);
      setChatHistory((prev) =>
        sortChatsByLastUsed(
          prev.map((c) =>
            c.id === existingUnused.id
              ? { ...c, timestamp: new Date() }
              : c
          )
        )
      );
      return;
    }

    if (isAuthenticated) {
      const res = await api.createChat('New Chat');
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.data) {
        const chat = apiChatToChatHistory(res.data);
        const msgs = chat.messages.length > 0 ? chat.messages : [WELCOME_MESSAGE];
        setChatHistory((prev) => sortChatsByLastUsed([chat, ...prev]));
        setCurrentChatId(chat.id);
        setMessages(msgs);
      }
      return;
    }

    const newChatId = Date.now();
    const newChat: ChatHistory = {
      id: newChatId,
      title: 'New Chat',
      timestamp: new Date(),
      messages: [WELCOME_MESSAGE],
    };
    setChatHistory((prev) => sortChatsByLastUsed([newChat, ...prev]));
    setCurrentChatId(newChatId);
    setMessages(newChat.messages);
  }, [isAuthenticated, chatHistory, isUnusedNewChat]);

  // Initialize from URL param (e.g., /brain?initialMessage=...)
  useEffect(() => {
    const messageFromUrl = searchParams.get('initialMessage');
    if (!messageFromUrl) return;

    // Defer setState to avoid synchronous setState in effect (react-hooks/set-state-in-effect)
    queueMicrotask(() => setInitialInputValue(messageFromUrl));

    if (!currentChatId) {
      queueMicrotask(() => void handleNewChat());
    }

    // Clean the URL so the param is not persistent
    router.replace('/brain');
  }, [searchParams, currentChatId, handleNewChat, router]);

  // Send pending message after chat is created (API flow)
  useEffect(() => {
    if (!currentChatId || !pendingMessageRef.current || !isAuthenticated) return;
    const { text, image } = pendingMessageRef.current;
    pendingMessageRef.current = null;

    queueMicrotask(() => setIsLoading(true));
    api
      .sendMessage(currentChatId, text, image)
      .then((res) => {
        if (res.error) {
          setError(res.error);
          return;
        }
        if (res.data) {
          const chat = apiChatToChatHistory(res.data);
          setMessages(chat.messages);
          applyChatFromApi(chat);
        }
      })
      .finally(() => setIsLoading(false));
  }, [currentChatId, isAuthenticated, applyChatFromApi]);

  // Send pending message after chat is created (local flow)
  useEffect(() => {
    if (!currentChatId || !pendingMessageRef.current || isAuthenticated) return;
    const { text, image } = pendingMessageRef.current;
    pendingMessageRef.current = null;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      text,
      image,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setChatHistory((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: [...chat.messages, userMessage],
              title:
                chat.title === 'New Chat'
                  ? text.slice(0, 30) + (text.length > 30 ? '...' : '')
                  : chat.title,
            }
          : chat
      )
    );

    setIsLoading(true);
    setTimeout(() => {
      const aiMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        type: 'assistant',
        text: `I understand you're asking about "${text}". This is a demo response. Sign in to sync with the backend.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setChatHistory((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, aiMessage] }
            : chat
        )
      );
      setIsLoading(false);
    }, 800);
  }, [currentChatId, isAuthenticated]);

  const handleSendMessage = useCallback(
    async (text: string, image?: string) => {
      if (!currentChatId) {
        pendingMessageRef.current = { text, image };
        handleNewChat();
        return;
      }

      if (isAuthenticated) {
        setIsLoading(true);
        const res = await api.sendMessage(currentChatId, text, image);
        if (res.error) {
          setError(res.error);
          setIsLoading(false);
          return;
        }
        if (res.data) {
          const chat = apiChatToChatHistory(res.data);
          setMessages(chat.messages);
          applyChatFromApi(chat);
        }
        setIsLoading(false);
        return;
      }

      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        type: 'user',
        text,
        image,
        timestamp: new Date(),
      };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setChatHistory((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: newMessages,
                title:
                  chat.title === 'New Chat'
                    ? text.slice(0, 30) + (text.length > 30 ? '...' : '')
                    : chat.title,
              }
            : chat
        )
      );

      setIsLoading(true);
      setTimeout(() => {
        const aiMessage: Message = {
          id: `msg-${Date.now()}-ai`,
          type: 'assistant',
          text: `I understand you're asking about "${text}". This is a demo response. Sign in to sync with the backend.`,
          timestamp: new Date(),
        };
        const updated = [...newMessages, aiMessage];
        setMessages(updated);
        setChatHistory((prev) =>
          sortChatsByLastUsed(
            prev.map((chat) =>
              chat.id === currentChatId
                ? { ...chat, messages: updated, timestamp: new Date() }
                : chat
            )
          )
        );
        setIsLoading(false);
      }, 800);
    },
    [currentChatId, messages, isAuthenticated, handleNewChat, applyChatFromApi]
  );

  const handleLoadChat = useCallback(
    async (id: number) => {
      setIsMobileMenuOpen(false);
      setCurrentChatId(id);

      const bumpAndSort = (prev: ChatHistory[]) =>
        sortChatsByLastUsed(
          prev.map((c) =>
            c.id === id ? { ...c, timestamp: new Date() } : c
          )
        );

      const local = chatHistory.find((c) => c.id === id);
      if (local && local.messages.length > 0) {
        setMessages(local.messages);
        setChatHistory(bumpAndSort);
        return;
      }
      if (isAuthenticated) {
        const res = await api.getChat(id);
        if (res.error) return;
        if (res.data) {
          const chat = apiChatToChatHistory(res.data);
          setMessages(chat.messages);
          setChatHistory((prev) => {
            const idx = prev.findIndex((c) => c.id === id);
            const next = [...prev];
            const updated = { ...chat, timestamp: new Date() };
            if (idx >= 0) next[idx] = updated;
            else next.unshift(updated);
            return sortChatsByLastUsed(next);
          });
        }
      } else if (local) {
        setMessages(local.messages);
        setChatHistory(bumpAndSort);
      }
    },
    [chatHistory, isAuthenticated]
  );

  const _handleDeleteChat = useCallback(
    async (id: number) => {
      if (isAuthenticated) {
        const res = await api.deleteChat(id);
        if (res.error) return;
      }
      setChatHistory((prev) => prev.filter((c) => c.id !== id));
      if (currentChatId === id) {
        setCurrentChatId(null);
        setMessages([]);
      }
    },
    [isAuthenticated, currentChatId]
  );

  const _handleRenameChat = useCallback(
    async (id: number, newTitle: string) => {
      if (isAuthenticated) {
        const res = await api.updateChat(id, newTitle);
        if (res.error) return;
      }
      setChatHistory((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
      );
    },
    [isAuthenticated]
  );

  const _handleClearAll = useCallback(async () => {
    if (!window.confirm('Are you sure you want to delete all chats?')) return;
    if (isAuthenticated && chatHistory.length > 0) {
      await Promise.all(chatHistory.map((c) => api.deleteChat(c.id)));
    }
    setChatHistory([]);
    setCurrentChatId(null);
    setMessages([]);
  }, [isAuthenticated, chatHistory]);

  const _handleCreateFolder = (name: string) => {
    setFolders((prev) => [...prev, { id: Date.now(), name, chats: [] }]);
  };

  const _handleDeleteFolder = (id: number) => {
    if (!window.confirm('Delete this folder? Chats will be moved to root.')) return;
    setChatHistory((prev) =>
      prev.map((c) => (c.folderId === id ? { ...c, folderId: undefined } : c))
    );
    setFolders((prev) => prev.filter((f) => f.id !== id));
  };

  const _handleRenameFolder = (id: number, newName: string) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: newName } : f))
    );
  };

  const _handleMoveToFolder = (chatId: number, folderId: number | null) => {
    setChatHistory((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? { ...c, folderId: folderId === null ? undefined : folderId }
          : c
      )
    );
  };

  const _handleExportChat = (id: number, format: 'pdf' | 'txt' | 'json') => {
    const chat = chatHistory.find((c) => c.id === id);
    if (!chat) return;

    const ts = chat.timestamp instanceof Date ? chat.timestamp : new Date(chat.timestamp);
    const msgTs = (msg: Message) =>
      msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp ?? 0);

    if (format === 'txt') {
      let content = `${chat.title}\n`;
      content += `Date: ${ts.toLocaleString()}\n`;
      content += `${'='.repeat(50)}\n\n`;
      chat.messages.forEach((msg) => {
        content += `[${msg.type.toUpperCase()}] ${msgTs(msg).toLocaleString()}\n`;
        content += `${msg.text || '[No text content]'}\n\n`;
      });
      const blob = new Blob([content], { type: 'text/plain' });
      downloadFile(blob, `${chat.title}.txt`);
    } else if (format === 'json') {
      const jsonContent = JSON.stringify(chat, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      downloadFile(blob, `${chat.title}.json`);
    } else if (format === 'pdf') {
      try {
        const doc = new jsPDF();
        let yPos = 20;
        doc.setFontSize(16);
        doc.text(chat.title, 20, yPos);
        yPos += 10;
        doc.setFontSize(10);
        doc.text(`Date: ${ts.toLocaleString()}`, 20, yPos);
        yPos += 15;
        doc.setFontSize(12);
        chat.messages.forEach((msg) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.setFont('', 'bold');
          doc.text(`${msg.type.toUpperCase()}:`, 20, yPos);
          yPos += 7;
          doc.setFont('', 'normal');
          const lines = doc.splitTextToSize(msg.text || '[No text content]', 170);
          doc.text(lines, 20, yPos);
          yPos += lines.length * 7 + 5;
        });
        doc.save(`${chat.title}.pdf`);
      } catch (e) {
        console.error('PDF export error:', e);
        alert('PDF export failed. Using TXT instead.');
        _handleExportChat(id, 'txt');
      }
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="fb-chat-page mx-auto mb-2 flex h-[calc(100dvh-5rem)] w-full max-w-[1800px] flex-col overflow-y-auto fb-page px-2 pt-[5.5rem] font-[Inter] text-slate-300 sm:px-4 sm:pt-[6.25rem] lg:h-[calc(100vh-5rem)] lg:overflow-hidden lg:px-6 dark:text-slate-300">
      {error && (
        <div className="fixed top-4 right-4 z-[100] bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm shadow-lg">
          {error}
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="fb-chat-shell relative flex min-h-0 flex-1 gap-2 overflow-visible rounded-2xl p-2 sm:gap-3 sm:p-3 xl:overflow-hidden">
        <div className="hidden lg:flex">
          <LeftPanel
            variant="chats"
            chatHistory={chatHistory}
            currentChatId={currentChatId}
            onLoadChat={handleLoadChat}
            onNewChat={handleNewChat}
            onSearch={() => {}}
            onPreferences={() => setIsPreferencesOpen(true)}
            onSettings={() => {}}
            chatsLoading={chatsLoading}
          />
        </div>

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-[100] bg-black/60 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden
          />
        )}

        <div
          className={`fixed inset-y-0 left-0 z-[110] w-[84%] max-w-xs transform transition-transform duration-200 lg:hidden ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full bg-[#0B0719]">
            <div className="flex items-center justify-end px-4 pt-4">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-md p-2 text-white/80 hover:bg-white/10 hover:text-white"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <LeftPanel
              variant="chats"
              chatHistory={chatHistory}
              currentChatId={currentChatId}
              onLoadChat={handleLoadChat}
              onNewChat={() => {
                setIsMobileMenuOpen(false);
                void handleNewChat();
              }}
              onSearch={() => {}}
              onPreferences={() => {
                setIsMobileMenuOpen(false);
                setIsPreferencesOpen(true);
              }}
              onSettings={() => {}}
              chatsLoading={chatsLoading}
            />
          </div>
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 sm:gap-3 xl:flex-row">
          <div className="lg:hidden">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="rounded-lg border border-white/20 bg-[#0B0719]/80 p-2 text-white/90 hover:bg-[#1b1032]"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
          <section
            className="relative flex min-h-[60dvh] min-w-0 flex-1 flex-col overflow-hidden rounded-xl border xl:min-h-0 backdrop-blur-sm"
            style={{
              background: "var(--fb-chat-area-bg)",
              borderColor: "var(--fb-panel-border)",
            }}
          >
            {currentChatId ? (
              <>
                <ChatArea
                  messages={messages}
                  isLoading={isLoading}
                  compactMode={preferences.compactMode}
                  autoScroll={preferences.autoScroll}
                />
                <ChatInput
                  key={initialInputValue ?? 'default'}
                  onSendMessage={handleSendMessage}
                  disabled={isLoading}
                  initialText={initialInputValue ?? undefined}
                  allowVoiceInput={preferences.enableVoiceInput}
                  allowImageUpload={preferences.enableImageUpload}
                  compactMode={preferences.compactMode}
                />
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center overflow-y-auto p-4 sm:p-6">
                <div className="max-w-md text-center">
                  <div className="mx-auto mb-4 h-16 w-16 opacity-50 sm:mb-6 sm:h-20 sm:w-20">
                    <svg viewBox="0 0 100 100" fill="none">
                      <path
                        d="M50 10L20 25V45C20 62.5 35 77.5 50 82.5C65 77.5 80 62.5 80 45V25L50 10Z"
                        fill="url(#mainGradient)"
                        stroke="white"
                        strokeWidth="3"
                      />
                      <path
                        d="M35 45L45 55L65 35"
                        stroke="white"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <defs>
                        <linearGradient
                          id="mainGradient"
                          x1="20"
                          y1="10"
                          x2="80"
                          y2="82.5"
                        >
                          <stop stopColor="#8B5CF6" />
                          <stop offset="1" stopColor="#6366F1" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
                    Welcome to FLOBRAIN
                  </h2>
                  <p className="mb-6 text-sm text-white/60 sm:mb-8 sm:text-base">
                    Start a new conversation to chat with our AI assistant.
                    {isAuthenticated
                      ? ' Your chats are saved on the server.'
                      : ' Sign in to save chats.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleNewChat}
                    className="w-full rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] px-6 py-3 text-base font-semibold text-white shadow-lg shadow-[#8B5CF6]/30 transition-all duration-200 hover:opacity-90 hover:shadow-[#8B5CF6]/50 sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
                  >
                    Start New Chat
                  </button>
                </div>
              </div>
            )}
          </section>
          {preferences.showConfidencePanel && <ConfidencePanel />}
        </div>
      </div>
      <PreferencesModal
        open={isPreferencesOpen}
        preferences={preferences}
        onClose={() => setIsPreferencesOpen(false)}
        onChange={setPreferences}
      />
    </main>
  );
}

export default function BrainPage() {
  return (
    <Suspense fallback={<BrainPageFallback />}>
      <BrainPageContent />
    </Suspense>
  );
}

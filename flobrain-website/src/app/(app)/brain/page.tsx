'use client';

import { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ChatHistory, Folder, Message } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { apiChatToChatHistory, apiChatListToChatHistory } from './lib/brainApi';
import { LeftPanel } from '@/app/home/components/left-panel';
import ChatArea from './components/ChatArea/index';
import ChatInput from './components/MessageInput/index';
import jsPDF from 'jspdf';
import { BarChart3, PanelLeft, X } from 'lucide-react';

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

const CONFIDENCE_CARDS = [
  { model: 'GPT-4o', confidence: 87, latency: '151ms', tokens: '2.9K' },
  { model: 'Claude 3.5', confidence: 94, latency: '149ms', tokens: '3.0K' },
  { model: 'Gemini 1.5', confidence: 73, latency: '120ms', tokens: '3.4K' },
] as const;

function ConfidencePanelContent({ headingClassName }: { headingClassName?: string }) {
  return (
    <>
      <h3 className={cn('mb-3 text-sm font-semibold text-white', headingClassName)}>Confidence</h3>
      <div className="space-y-3">
        {CONFIDENCE_CARDS.map((card) => (
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
    </>
  );
}

/** Desktop (md+): fixed column; hidden below md (mobile uses drawer). */
function ConfidencePanel() {
  return (
    <aside className="max-md:hidden flex w-[300px] shrink-0 flex-col rounded-xl border border-white/10 bg-[#0B0719]/55 p-4 min-h-0">
      <ConfidencePanelContent />
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
  const [preferences, setPreferences] = useState<BrainPreferences>(DEFAULT_PREFERENCES);
  const [mobileSessionsOpen, setMobileSessionsOpen] = useState(false);
  const [mobileConfidenceOpen, setMobileConfidenceOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const closeMobileSidebars = useCallback(() => {
    setMobileSessionsOpen(false);
    setMobileConfidenceOpen(false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileSidebars();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeMobileSidebars]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => {
      if (mq.matches) closeMobileSidebars();
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [closeMobileSidebars]);

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
      setChatHistory((prev) =>
        sortChatsByLastUsed(
          prev.map((c) =>
            c.id === existingUnused.id
              ? { ...c, timestamp: new Date() }
              : c
          )
        )
      );
      if (isAuthenticated) {
        const res = await api.getChat(existingUnused.id);
        if (res.error) {
          setError(res.error);
          return;
        }
        if (res.data) {
          const chat = apiChatToChatHistory(res.data);
          const msgs =
            chat.messages.length > 0 ? chat.messages : [WELCOME_MESSAGE];
          setMessages(msgs);
          applyChatFromApi(chat);
        }
      } else {
        const msgs =
          existingUnused.messages.length > 0
            ? existingUnused.messages
            : [WELCOME_MESSAGE];
        setMessages(msgs);
      }
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
  }, [isAuthenticated, chatHistory, isUnusedNewChat, applyChatFromApi]);

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
      setCurrentChatId(id);
      setError(null);

      const bumpAndSort = (prev: ChatHistory[]) =>
        sortChatsByLastUsed(
          prev.map((c) =>
            c.id === id ? { ...c, timestamp: new Date() } : c
          )
        );

      if (isAuthenticated) {
        const res = await api.getChat(id);
        if (res.error) {
          setError(res.error);
          return;
        }
        if (res.data) {
          const chat = apiChatToChatHistory(res.data);
          const msgs =
            chat.messages.length > 0 ? chat.messages : [WELCOME_MESSAGE];
          setMessages(msgs);
          setChatHistory((prev) => {
            const idx = prev.findIndex((c) => c.id === id);
            const next = [...prev];
            const updated = { ...chat, timestamp: new Date() };
            if (idx >= 0) next[idx] = updated;
            else next.unshift(updated);
            return sortChatsByLastUsed(next);
          });
        }
        return;
      }

      const local = chatHistory.find((c) => c.id === id);
      if (local) {
        const msgs =
          local.messages.length > 0 ? local.messages : [WELCOME_MESSAGE];
        setMessages(msgs);
        setChatHistory(bumpAndSort);
      }
    },
    [chatHistory, isAuthenticated]
  );

  const handleLoadChatMobile = useCallback(
    async (id: number) => {
      await handleLoadChat(id);
      setMobileSessionsOpen(false);
    },
    [handleLoadChat]
  );

  const handleNewChatMobile = useCallback(async () => {
    await handleNewChat();
    setMobileSessionsOpen(false);
  }, [handleNewChat]);

  const openMobileSessions = useCallback(() => {
    setMobileConfidenceOpen(false);
    setMobileSessionsOpen(true);
  }, []);

  const openMobileConfidence = useCallback(() => {
    setMobileSessionsOpen(false);
    setMobileConfidenceOpen(true);
  }, []);

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
    <main className="box-border mb-2 flex h-screen max-w-full min-h-0 flex-col overflow-y-hidden bg-[linear-gradient(90deg,#290036_0%,#070014_100%)] px-3 pb-24 pt-24 font-[Inter] text-slate-300 sm:px-4 sm:pb-28 sm:pt-28 md:mx-auto md:w-[92%] md:px-0 md:pb-3 md:pt-[7rem]">
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

      <div className="mb-2 flex shrink-0 items-center gap-2 md:hidden">
        <button
          type="button"
          onClick={openMobileSessions}
          aria-expanded={mobileSessionsOpen}
          aria-controls="brain-sessions-drawer"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0B0719]/60 py-2.5 text-xs font-semibold uppercase tracking-wide text-white/90 shadow-sm"
        >
          <PanelLeft className="h-4 w-4 shrink-0" aria-hidden />
          Chats
        </button>
        {preferences.showConfidencePanel && (
          <button
            type="button"
            onClick={openMobileConfidence}
            aria-expanded={mobileConfidenceOpen}
            aria-controls="brain-confidence-drawer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0B0719]/60 py-2.5 text-xs font-semibold uppercase tracking-wide text-white/90 shadow-sm"
          >
            <BarChart3 className="h-4 w-4 shrink-0" aria-hidden />
            Confidence
          </button>
        )}
      </div>

      <div className="relative flex min-h-0 min-w-0 flex-1 gap-2 sm:gap-3">
        {mobileSessionsOpen && (
          <button
            type="button"
            aria-label="Close chat list"
            className="fixed inset-0 z-[85] bg-black/55 md:hidden"
            onClick={() => setMobileSessionsOpen(false)}
          />
        )}

        <div
          id="brain-sessions-drawer"
          className={cn(
            'fixed bottom-24 left-0 top-24 z-[90] w-[min(100vw-1.5rem,320px)] max-w-[88vw] transition-transform duration-300 ease-out md:static md:top-auto md:bottom-auto md:z-0 md:flex md:h-auto md:max-w-none md:w-[20%] md:shrink-0 md:translate-x-0',
            mobileSessionsOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none md:pointer-events-auto md:translate-x-0'
          )}
        >
          <LeftPanel
            variant="chats"
            className="h-full w-full min-w-0 rounded-r-xl border border-white/10 bg-[#0B0719]/50 shadow-2xl md:rounded-xl md:border-transparent md:shadow-none"
            chatHistory={chatHistory}
            currentChatId={currentChatId}
            onLoadChat={handleLoadChatMobile}
            onNewChat={handleNewChatMobile}
            onSearch={() => {}}
            onPreferences={() => setIsPreferencesOpen(true)}
            onSettings={() => {}}
            chatsLoading={chatsLoading}
          />
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 gap-2 sm:gap-3">
          <section className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0B0719]/30">
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
              <div className="flex flex-1 items-center justify-center overflow-y-auto">
                <div className="max-w-md px-4 text-center sm:px-6">
                  <div className="mx-auto mb-5 h-16 w-16 opacity-50 sm:mb-6 sm:h-20 sm:w-20">
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
                  <h2 className="mb-2 text-2xl font-bold tracking-tight text-white sm:mb-3 sm:text-3xl">
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
                    className="rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] px-6 py-3 text-base font-semibold text-white shadow-lg shadow-[#8B5CF6]/30 transition-all duration-200 hover:opacity-90 hover:shadow-[#8B5CF6]/50 sm:px-8 sm:py-4 sm:text-lg"
                  >
                    Start New Chat
                  </button>
                </div>
              </div>
            )}
          </section>
          {preferences.showConfidencePanel && (
            <>
              <ConfidencePanel />
              {mobileConfidenceOpen && (
                <button
                  type="button"
                  aria-label="Close confidence panel"
                  className="fixed inset-0 z-[85] bg-black/55 md:hidden"
                  onClick={() => setMobileConfidenceOpen(false)}
                />
              )}
              <aside
                id="brain-confidence-drawer"
                className={cn(
                  'fixed bottom-24 right-0 top-24 z-[90] w-[min(100vw-1.5rem,300px)] max-w-[90vw] overflow-y-auto rounded-l-xl border border-white/10 bg-[#0B0719]/55 p-4 shadow-2xl transition-transform duration-300 ease-out md:hidden',
                  mobileConfidenceOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
                )}
              >
                <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-base font-semibold text-white">Confidence</span>
                  <button
                    type="button"
                    onClick={() => setMobileConfidenceOpen(false)}
                    className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                    aria-label="Close confidence panel"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <ConfidencePanelContent headingClassName="sr-only" />
              </aside>
            </>
          )}
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

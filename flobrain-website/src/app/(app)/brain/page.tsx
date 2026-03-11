'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Menu } from 'lucide-react';
import type { ChatHistory, Folder, Message } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { apiChatToChatHistory, apiChatListToChatHistory } from './lib/brainApi';
import Sidebar from './components/Sidebar/index';
import ChatArea from './components/ChatArea/index';
import ChatInput from './components/MessageInput/index';
import jsPDF from 'jspdf';

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

export default function BrainPage() {
  const { isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pendingMessageRef = useRef<{ text: string; image?: string } | null>(null);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

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

  const handleDeleteChat = useCallback(
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

  const handleRenameChat = useCallback(
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

  const handleClearAll = useCallback(async () => {
    if (!window.confirm('Are you sure you want to delete all chats?')) return;
    if (isAuthenticated && chatHistory.length > 0) {
      await Promise.all(chatHistory.map((c) => api.deleteChat(c.id)));
    }
    setChatHistory([]);
    setCurrentChatId(null);
    setMessages([]);
  }, [isAuthenticated, chatHistory]);

  const handleCreateFolder = (name: string) => {
    setFolders((prev) => [...prev, { id: Date.now(), name, chats: [] }]);
  };

  const handleDeleteFolder = (id: number) => {
    if (!window.confirm('Delete this folder? Chats will be moved to root.')) return;
    setChatHistory((prev) =>
      prev.map((c) => (c.folderId === id ? { ...c, folderId: undefined } : c))
    );
    setFolders((prev) => prev.filter((f) => f.id !== id));
  };

  const handleRenameFolder = (id: number, newName: string) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: newName } : f))
    );
  };

  const handleMoveToFolder = (chatId: number, folderId: number | null) => {
    setChatHistory((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? { ...c, folderId: folderId === null ? undefined : folderId }
          : c
      )
    );
  };

  const handleExportChat = (id: number, format: 'pdf' | 'txt' | 'json') => {
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
        handleExportChat(id, 'txt');
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
    <div className="flex h-screen bg-[#1a0b2e] text-white overflow-hidden">
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

      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        chatHistory={chatHistory}
        folders={folders}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
        onLoadChat={handleLoadChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onClearAllChats={handleClearAll}
        onMoveToFolder={handleMoveToFolder}
        onCreateFolder={handleCreateFolder}
        onDeleteFolder={handleDeleteFolder}
        onRenameFolder={handleRenameFolder}
        onExportChat={handleExportChat}
        chatsLoading={chatsLoading}
      />

      <div className="flex flex-1 flex-col min-w-0 relative">
        {!isSidebarOpen && (
          <div className="fixed top-6 left-4 z-[9999]">
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-2 hover:bg-white/10 rounded-lg transition-all"
              title="Open Sidebar"
            >
              <Menu size={24} className="text-white" />
            </button>
          </div>
        )}

        {currentChatId ? (
          <>
            <ChatArea messages={messages} />
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </>
        ) : (
          <main className="flex-1 relative overflow-y-auto flex items-center justify-center">
            <div className="text-center max-w-md px-6">
              <div className="w-20 h-20 mx-auto mb-6 opacity-50">
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
              <h2 className="text-3xl font-bold text-white mb-3">
                Welcome to FLOBRAIN
              </h2>
              <p className="text-white/60 mb-8">
                Start a new conversation to chat with our AI assistant.
                {isAuthenticated
                  ? ' Your chats are saved on the server.'
                  : ' Sign in to save chats.'}
              </p>
              <button
                type="button"
                onClick={handleNewChat}
                className="bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-lg shadow-[#8B5CF6]/30 hover:shadow-[#8B5CF6]/50 text-lg"
              >
                Start New Chat
              </button>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}

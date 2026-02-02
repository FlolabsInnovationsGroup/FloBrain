'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import type { ChatHistory, Folder, Message } from '@/types/chat';
import Sidebar from './components/Sidebar/index';
import ChatArea from './components/ChatArea/index';
import ChatInput from './components/MessageInput/index';
import jsPDF from 'jspdf';

export default function BrainPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  // Get current chat
  const getCurrentChat = () => {
    return chatHistory.find(chat => chat.id === currentChatId);
  };

  // Handle new chat
  const handleNewChat = () => {
    const newChatId = Date.now();
    const newChat: ChatHistory = {
      id: newChatId,
      title: 'New Chat',
      timestamp: new Date(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          type: 'assistant',
          text: "Hello! I'm FLOBRAIN AI. How can I assist you today?",
          timestamp: new Date(),
        }
      ]
    };
    
    setChatHistory([newChat, ...chatHistory]);
    setCurrentChatId(newChatId);
    setMessages(newChat.messages);
  };

  // Handle sending messages
  const handleSendMessage = async (text: string, image?: string) => {
    if (!currentChatId) {
      handleNewChat();
      setTimeout(() => handleSendMessage(text, image), 100);
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      text,
      image,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Update chat history
    setChatHistory(prev => prev.map(chat => 
      chat.id === currentChatId
        ? { 
            ...chat, 
            messages: newMessages,
            title: chat.title === 'New Chat' ? text.slice(0, 30) + (text.length > 30 ? '...' : '') : chat.title
          }
        : chat
    ));

    // Simulate AI response
    setIsLoading(true);
    setTimeout(() => {
      const aiMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        type: 'assistant',
        text: `I understand you're asking about "${text}". This is a demo response. Connect to a real AI API for actual responses!`,
        timestamp: new Date(),
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);

      setChatHistory(prev => prev.map(chat => 
        chat.id === currentChatId
          ? { ...chat, messages: updatedMessages }
          : chat
      ));

      setIsLoading(false);
    }, 1000);
  };

  // Handle loading a chat
  const handleLoadChat = (id: number) => {
    setCurrentChatId(id);
    const chat = chatHistory.find(c => c.id === id);
    if (chat) {
      setMessages(chat.messages);
    }
  };

  // Handle delete chat
  const handleDeleteChat = (id: number) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== id));
    if (currentChatId === id) {
      setCurrentChatId(null);
      setMessages([]);
    }
  };

  // Handle rename chat
  const handleRenameChat = (id: number, newTitle: string) => {
    setChatHistory(prev => prev.map(chat => 
      chat.id === id ? { ...chat, title: newTitle } : chat
    ));
  };

  // Handle clear all chats
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all chats?')) {
      setChatHistory([]);
      setCurrentChatId(null);
      setMessages([]);
    }
  };

  // Handle create folder
  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
      id: Date.now(),
      name,
      chats: []
    };
    setFolders([...folders, newFolder]);
  };

  // Handle delete folder
  const handleDeleteFolder = (id: number) => {
    if (window.confirm('Delete this folder? Chats will be moved to root.')) {
      // Move chats out of folder
      setChatHistory(prev => prev.map(chat => 
        chat.folderId === id ? { ...chat, folderId: undefined } : chat
      ));
      setFolders(prev => prev.filter(f => f.id !== id));
    }
  };

  // Handle rename folder
  const handleRenameFolder = (id: number, newName: string) => {
    setFolders(prev => prev.map(folder => 
      folder.id === id ? { ...folder, name: newName } : folder
    ));
  };

  // Handle move to folder
  const handleMoveToFolder = (chatId: number, folderId: number | null) => {
    setChatHistory(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, folderId: folderId === null ? undefined : folderId } : chat
    ));
  };

  // Handle export chat
  const handleExportChat = (id: number, format: 'pdf' | 'txt' | 'json') => {
    const chat = chatHistory.find(c => c.id === id);
    if (!chat) return;

    if (format === 'txt') {
      // Export as TXT
      let content = `${chat.title}\n`;
      content += `Date: ${chat.timestamp.toLocaleString()}\n`;
      content += `${'='.repeat(50)}\n\n`;
      
      chat.messages.forEach(msg => {
        content += `[${msg.type.toUpperCase()}] ${msg.timestamp?.toLocaleString() || ''}\n`;
        content += `${msg.text || '[No text content]'}\n\n`;
      });

      const blob = new Blob([content], { type: 'text/plain' });
      downloadFile(blob, `${chat.title}.txt`);
    } 
    else if (format === 'json') {
      // Export as JSON
      const jsonContent = JSON.stringify(chat, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      downloadFile(blob, `${chat.title}.json`);
    }
    else if (format === 'pdf') {
      // Export as PDF
      try {
        const doc = new jsPDF();
        let yPos = 20;
        
        doc.setFontSize(16);
        doc.text(chat.title, 20, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        doc.text(`Date: ${chat.timestamp.toLocaleString()}`, 20, yPos);
        yPos += 15;
        
        doc.setFontSize(12);
        chat.messages.forEach(msg => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.setFont('', 'bold');
          doc.text(`${msg.type.toUpperCase()}:`, 20, yPos);
          yPos += 7;
          
          doc.setFont('', 'normal');
          const messageText = msg.text || '[No text content]';
          const lines = doc.splitTextToSize(messageText, 170);
          doc.text(lines, 20, yPos);
          yPos += (lines.length * 7) + 5;
        });
        
        doc.save(`${chat.title}.pdf`);
      } catch (error) {
        console.error('PDF export error:', error);
        alert('PDF export failed. Using TXT instead.');
        handleExportChat(id, 'txt');
      }
    }
  };

  // Helper to download file
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
       />

       <div className="flex flex-1 flex-col min-w-0">
          {/* Toggle button when sidebar is closed */}
          {!isSidebarOpen && (
            <div className="absolute top-4 left-4 z-50">
               <button 
                 onClick={toggleSidebar}
                 className="p-2 bg-white/5 hover:bg-white/10 rounded-md transition-colors"
               >
                 <Menu size={20} className="text-white" />
               </button>
            </div>
          )}
          
          {/* Main content area */}
          {currentChatId ? (
            <>
              <ChatArea messages={messages} />
              <ChatInput 
                onSendMessage={handleSendMessage} 
                disabled={isLoading}
              />
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
                      <linearGradient id="mainGradient" x1="20" y1="10" x2="80" y2="82.5">
                        <stop stopColor="#8B5CF6"/>
                        <stop offset="1" stopColor="#6366F1"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">Welcome to FLOBRAIN</h2>
                <p className="text-white/60 mb-8">
                  Start a new conversation to chat with our AI assistant.
                </p>
                <button
                  onClick={handleNewChat}
                  className="bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white px-8 py-4 
                           rounded-xl font-semibold hover:opacity-90 transition-all duration-200
                           shadow-lg shadow-[#8B5CF6]/30 hover:shadow-[#8B5CF6]/50 text-lg"
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
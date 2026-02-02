"use client";

import { useState } from 'react';
import { ChatHistory, Folder } from '@/types/chat';
import { Trash2, Edit2, Download, FolderPlus, ChevronDown, ChevronRight, Folder as FolderIcon, FolderInput } from 'lucide-react';
import { Menu } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  chatHistory: ChatHistory[];
  folders: Folder[];
  currentChatId: number | null;
  onNewChat: () => void;
  onLoadChat: (id: number) => void;
  onDeleteChat: (id: number) => void;
  onRenameChat: (id: number, newTitle: string) => void;
  onClearAllChats: () => void;
  onMoveToFolder: (chatId: number, folderId: number | null) => void;
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (id: number) => void;
  onRenameFolder: (id: number, newName: string) => void;
  onExportChat: (id: number, format: 'pdf' | 'txt' | 'json') => void;
}

export default function Sidebar({ 
  isOpen,
  onToggle,
  chatHistory,
  folders,
  currentChatId,
  onNewChat,
  onLoadChat,
  onDeleteChat,
  onRenameChat,
  onClearAllChats,
  onMoveToFolder,
  onCreateFolder,
  onDeleteFolder,
  onRenameFolder,
  onExportChat
}: SidebarProps) {
  const [editingChatId, setEditingChatId] = useState<number | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [showExportMenu, setShowExportMenu] = useState<number | null>(null);
  const [showMoveMenu, setShowMoveMenu] = useState<number | null>(null);
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  if (!isOpen) return null;

  // Toggle folder expansion
  const toggleFolder = (folderId: number) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  // Start editing chat title
  const startEditingChat = (chat: ChatHistory) => {
    setEditingChatId(chat.id);
    setEditValue(chat.title);
  };

  // Save chat title
  const saveEditingChat = () => {
    if (editingChatId && editValue.trim()) {
      onRenameChat(editingChatId, editValue.trim());
    }
    setEditingChatId(null);
    setEditValue('');
  };

  // Start editing folder name
  const startEditingFolder = (folder: Folder) => {
    setEditingFolderId(folder.id);
    setEditValue(folder.name);
  };

  // Save folder name
  const saveEditingFolder = () => {
    if (editingFolderId && editValue.trim()) {
      onRenameFolder(editingFolderId, editValue.trim());
    }
    setEditingFolderId(null);
    setEditValue('');
  };

  // Create new folder
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setShowFolderInput(false);
    }
  };

  // Get chats for a folder
  const getChatsInFolder = (folderId: number) => {
    return chatHistory.filter(chat => chat.folderId === folderId);
  };

  // Get chats not in any folder
  const getUnfolderedChats = () => {
    return chatHistory.filter(chat => !chat.folderId);
  };

  return (
    <aside className="w-64 bg-[#1a0d2e] border-r border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        <h2 className="text-lg font-semibold">Chats</h2>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-4 py-4 space-y-2">
        <button
          onClick={onNewChat}
          className="w-full bg-[#2d1b4e] hover:bg-[#3d2b5f] text-white px-4 py-3 
                   rounded-lg transition-colors duration-200 flex items-center gap-2
                   border border-white/10 hover:border-[#7c5dbd]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          New Chat
        </button>
        
        <button
          onClick={() => setShowFolderInput(!showFolderInput)}
          className="w-full bg-[#2d1b4e] hover:bg-[#3d2b5f] text-white px-4 py-3 
                   rounded-lg transition-colors duration-200 flex items-center gap-2
                   border border-white/10 hover:border-[#7c5dbd]"
        >
          <FolderPlus size={20} />
          New Folder
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-4">
        {/* Header with Clear All */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">
            History
          </h3>
          {chatHistory.length > 0 && (
            <button
              onClick={onClearAllChats}
              className="text-red-400 hover:text-red-300 text-xs transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* New Folder Input */}
        {showFolderInput && (
          <div className="mb-3 flex gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') setShowFolderInput(false);
              }}
              placeholder="Folder name..."
              className="flex-1 bg-[#2d1b4e] text-white text-sm px-2 py-1 rounded border border-white/10 focus:border-[#7c5dbd] focus:outline-none"
              autoFocus
            />
            <button
              onClick={handleCreateFolder}
              className="text-green-400 hover:text-green-300 text-xs"
            >
              ✓
            </button>
            <button
              onClick={() => setShowFolderInput(false)}
              className="text-red-400 hover:text-red-300 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Folders */}
        <div className="space-y-2">
          {folders.map((folder) => (
            <div key={folder.id}>
              <div className="flex items-center gap-2 py-2 px-2 hover:bg-[#2d1b4e] rounded-lg transition-colors group">
                <button
                  onClick={() => toggleFolder(folder.id)}
                  className="text-white/60 hover:text-white"
                >
                  {expandedFolders.has(folder.id) ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
                
                <FolderIcon size={16} className="text-[#7c5dbd]" />
                
                {editingFolderId === folder.id ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={saveEditingFolder}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEditingFolder();
                      if (e.key === 'Escape') setEditingFolderId(null);
                    }}
                    className="flex-1 bg-[#2d1b4e] text-white text-sm px-2 py-1 rounded border border-white/10 focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <span 
                    className="flex-1 text-white/90 text-sm truncate cursor-pointer"
                    onDoubleClick={() => startEditingFolder(folder)}
                  >
                    {folder.name}
                  </span>
                )}
                
                <button
                  onClick={() => onDeleteFolder(folder.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                  title="Delete folder"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Chats in folder */}
              {expandedFolders.has(folder.id) && (
                <div className="ml-6 space-y-1 mt-1">
                  {getChatsInFolder(folder.id).map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      currentChatId={currentChatId}
                      editingChatId={editingChatId}
                      editValue={editValue}
                      showExportMenu={showExportMenu}
                      showMoveMenu={showMoveMenu}
                      folders={folders}
                      onLoadChat={onLoadChat}
                      onDeleteChat={onDeleteChat}
                      onExportChat={onExportChat}
                      onMoveToFolder={onMoveToFolder}
                      startEditingChat={startEditingChat}
                      saveEditingChat={saveEditingChat}
                      setEditValue={setEditValue}
                      setEditingChatId={setEditingChatId}
                      setShowExportMenu={setShowExportMenu}
                      setShowMoveMenu={setShowMoveMenu}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Unfoldered Chats */}
          {getUnfolderedChats().map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              currentChatId={currentChatId}
              editingChatId={editingChatId}
              editValue={editValue}
              showExportMenu={showExportMenu}
              showMoveMenu={showMoveMenu}
              folders={folders}
              onLoadChat={onLoadChat}
              onDeleteChat={onDeleteChat}
              onExportChat={onExportChat}
              onMoveToFolder={onMoveToFolder}
              startEditingChat={startEditingChat}
              saveEditingChat={saveEditingChat}
              setEditValue={setEditValue}
              setEditingChatId={setEditingChatId}
              setShowExportMenu={setShowExportMenu}
              setShowMoveMenu={setShowMoveMenu}
            />
          ))}

          {chatHistory.length === 0 && (
            <p className="text-white/40 text-sm py-4 text-center">No chats yet</p>
          )}
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] rounded-full 
                        flex items-center justify-center text-white font-semibold text-sm">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/90 text-sm font-medium">User</p>
            <p className="text-white/50 text-xs">Free Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Chat Item Component
function ChatItem({
  chat,
  currentChatId,
  editingChatId,
  editValue,
  showExportMenu,
  showMoveMenu,
  folders,
  onLoadChat,
  onDeleteChat,
  onExportChat,
  onMoveToFolder,
  startEditingChat,
  saveEditingChat,
  setEditValue,
  setEditingChatId,
  setShowExportMenu,
  setShowMoveMenu
}: {
  chat: ChatHistory;
  currentChatId: number | null;
  editingChatId: number | null;
  editValue: string;
  showExportMenu: number | null;
  showMoveMenu: number | null;
  folders: Folder[];
  onLoadChat: (id: number) => void;
  onDeleteChat: (id: number) => void;
  onExportChat: (id: number, format: 'pdf' | 'txt' | 'json') => void;
  onMoveToFolder: (chatId: number, folderId: number | null) => void;
  startEditingChat: (chat: ChatHistory) => void;
  saveEditingChat: () => void;
  setEditValue: (value: string) => void;
  setEditingChatId: (id: number | null) => void;
  setShowExportMenu: (id: number | null) => void;
  setShowMoveMenu: (id: number | null) => void;
}) {
  return (
    <div className="relative group">
      <button
        onClick={() => onLoadChat(chat.id)}
        className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2
          ${currentChatId === chat.id 
            ? 'bg-[#7c5dbd]/30 border border-[#7c5dbd]' 
            : 'hover:bg-[#2d1b4e] border border-transparent'
          }`}
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className="flex-shrink-0 text-white/60"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        
        {editingChatId === chat.id ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEditingChat}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEditingChat();
              if (e.key === 'Escape') setEditingChatId(null);
            }}
            className="flex-1 bg-[#2d1b4e] text-white text-sm px-2 py-1 rounded border border-white/10 focus:outline-none"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span 
            className="flex-1 text-white/90 text-sm font-medium truncate"
            onDoubleClick={(e) => {
              e.stopPropagation();
              startEditingChat(chat);
            }}
          >
            {chat.title}
          </span>
        )}
      </button>

      {/* Action Buttons */}
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
        {/* Move to Folder Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMoveMenu(showMoveMenu === chat.id ? null : chat.id);
          }}
          className="p-1 hover:bg-white/10 rounded transition-colors relative"
          title="Move to folder"
        >
          <FolderInput size={12} className="text-white/60" />
          
          {showMoveMenu === chat.id && (
            <div className="absolute right-0 top-full mt-1 bg-[#2d1b4e] border border-white/10 rounded-lg shadow-lg z-50 min-w-[120px] max-h-[200px] overflow-y-auto">
              {/* Move to root */}
              <button
                onClick={() => {
                  onMoveToFolder(chat.id, null);
                  setShowMoveMenu(null);
                }}
                className="block w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
              >
                📁 Root
              </button>
              
              {/* Move to folders */}
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => {
                    onMoveToFolder(chat.id, folder.id);
                    setShowMoveMenu(null);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
                  disabled={chat.folderId === folder.id}
                >
                  📂 {folder.name}
                </button>
              ))}
              
              {folders.length === 0 && (
                <div className="px-3 py-2 text-xs text-white/40">
                  No folders yet
                </div>
              )}
            </div>
          )}
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            startEditingChat(chat);
          }}
          className="p-1 hover:bg-white/10 rounded transition-colors"
          title="Rename"
        >
          <Edit2 size={12} className="text-white/60" />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowExportMenu(showExportMenu === chat.id ? null : chat.id);
          }}
          className="p-1 hover:bg-white/10 rounded transition-colors relative"
          title="Export"
        >
          <Download size={12} className="text-white/60" />
          
          {showExportMenu === chat.id && (
            <div className="absolute right-0 top-full mt-1 bg-[#2d1b4e] border border-white/10 rounded-lg shadow-lg z-50 min-w-[100px]">
              <button
                onClick={() => {
                  onExportChat(chat.id, 'txt');
                  setShowExportMenu(null);
                }}
                className="block w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
              >
                TXT
              </button>
              <button
                onClick={() => {
                  onExportChat(chat.id, 'json');
                  setShowExportMenu(null);
                }}
                className="block w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
              >
                JSON
              </button>
              <button
                onClick={() => {
                  onExportChat(chat.id, 'pdf');
                  setShowExportMenu(null);
                }}
                className="block w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
              >
                PDF
              </button>
            </div>
          )}
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('Delete this chat?')) {
              onDeleteChat(chat.id);
            }
          }}
          className="p-1 hover:bg-white/10 rounded transition-colors"
          title="Delete"
        >
          <Trash2 size={12} className="text-red-400" />
        </button>
      </div>
    </div>
  );
}
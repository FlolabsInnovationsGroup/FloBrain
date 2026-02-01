import { Menu, Edit, Trash2, FolderPlus, Folder, Download, MoreVertical, X } from 'lucide-react';
import { useState } from 'react';
import type { ChatHistory, Folder as FolderType } from '../App';

interface SidebarProps {
  onNewChat: () => void;
  chatHistory: ChatHistory[];
  folders: FolderType[];
  currentChatId: number | null;
  onLoadChat: (chatId: number) => void;
  onDeleteChat: (chatId: number) => void;
  onRenameChat: (chatId: number, newTitle: string) => void;
  onClearAllChats: () => void;
  onMoveToFolder: (chatId: number, folderId: string | null) => void;
  onCreateFolder: (folderName: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onExportChat: (chatId: number, format: 'txt' | 'json' | 'pdf') => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({
  onNewChat,
  chatHistory,
  folders,
  currentChatId,
  onLoadChat,
  onDeleteChat,
  onRenameChat,
  onClearAllChats,
  onMoveToFolder,
  onCreateFolder,
  onDeleteFolder,
  onRenameFolder,
  onExportChat,
  isOpen,
  onToggle,
}: SidebarProps) {
  const [editingChatId, setEditingChatId] = useState<number | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showContextMenu, setShowContextMenu] = useState<number | null>(null);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());
  const [showExportMenu, setShowExportMenu] = useState<number | null>(null);

  const handleDoubleClick = (chatId: number, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditValue(currentTitle);
  };

  const handleRenameSubmit = (chatId: number) => {
    if (editValue.trim()) {
      onRenameChat(chatId, editValue.trim());
    }
    setEditingChatId(null);
    setEditValue('');
  };

  const handleFolderDoubleClick = (folderId: string, currentName: string) => {
    setEditingFolderId(folderId);
    setEditValue(currentName);
  };

  const handleFolderRenameSubmit = (folderId: string) => {
    if (editValue.trim()) {
      onRenameFolder(folderId, editValue.trim());
    }
    setEditingFolderId(null);
    setEditValue('');
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolderInput(false);
    }
  };

  const toggleFolder = (folderId: string) => {
    setCollapsedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const getChatsByFolder = (folderId: string | null) => {
    return chatHistory.filter(chat => chat.folderId === folderId);
  };

  const renderChat = (chat: ChatHistory) => {
    const isEditing = editingChatId === chat.id;
    const isActive = currentChatId === chat.id;
    const showMenu = showContextMenu === chat.id;
    const showExport = showExportMenu === chat.id;

    return (
      <div key={chat.id} className="relative group">
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleRenameSubmit(chat.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit(chat.id);
              if (e.key === 'Escape') setEditingChatId(null);
            }}
            className="w-full px-3 py-2.5 mb-1 text-sm bg-white/10 text-white rounded-md outline-none focus:ring-2 focus:ring-purple-400"
            autoFocus
          />
        ) : (
          <div
            onClick={() => onLoadChat(chat.id)}
            onDoubleClick={() => handleDoubleClick(chat.id, chat.title)}
            className={`px-3 py-2.5 mb-1 text-sm text-white/60 hover:bg-white/5 rounded-md cursor-pointer transition-colors line-clamp-1 flex items-center justify-between ${
              isActive ? 'bg-white/10' : ''
            }`}
          >
            <span className="flex-1 truncate">{chat.title}</span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowContextMenu(showMenu ? null : chat.id);
                  setShowExportMenu(null);
                }}
                className="p-1 hover:bg-white/10 rounded"
              >
                <MoreVertical size={14} />
              </button>
            </div>
          </div>
        )}

        {showMenu && (
          <div className="absolute right-0 top-8 z-50 bg-[#2a1a4a] border border-white/10 rounded-md shadow-lg py-1 min-w-[160px]">
            <button
              onClick={() => {
                setShowExportMenu(chat.id);
                setShowContextMenu(null);
              }}
              className="w-full px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5 flex items-center gap-2"
            >
              <Download size={14} />
              Export
            </button>
            <button
              onClick={() => {
                handleDoubleClick(chat.id, chat.title);
                setShowContextMenu(null);
              }}
              className="w-full px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5 flex items-center gap-2"
            >
              <Edit size={14} />
              Rename
            </button>
            <div className="border-t border-white/10 my-1"></div>
            <div className="px-3 py-1 text-xs text-white/40">Move to folder</div>
            <button
              onClick={() => {
                onMoveToFolder(chat.id, null);
                setShowContextMenu(null);
              }}
              className="w-full px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5"
            >
              No folder
            </button>
            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => {
                  onMoveToFolder(chat.id, folder.id);
                  setShowContextMenu(null);
                }}
                className="w-full px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5"
              >
                {folder.name}
              </button>
            ))}
            <div className="border-t border-white/10 my-1"></div>
            <button
              onClick={() => {
                onDeleteChat(chat.id);
                setShowContextMenu(null);
              }}
              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-white/5 flex items-center gap-2"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}

        {showExport && (
          <div className="absolute right-0 top-8 z-50 bg-[#2a1a4a] border border-white/10 rounded-md shadow-lg py-1 min-w-[160px]">
            <button
              onClick={() => {
                onExportChat(chat.id, 'txt');
                setShowExportMenu(null);
              }}
              className="w-full px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5"
            >
              Export as TXT
            </button>
            <button
              onClick={() => {
                onExportChat(chat.id, 'json');
                setShowExportMenu(null);
              }}
              className="w-full px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5"
            >
              Export as JSON
            </button>
            <button
              onClick={() => {
                onExportChat(chat.id, 'pdf');
                setShowExportMenu(null);
              }}
              className="w-full px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5"
            >
              Export as PDF
            </button>
            <button
              onClick={() => setShowExportMenu(null)}
              className="w-full px-3 py-2 text-left text-sm text-white/60 hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`flex flex-col bg-[#2a1a4a]/40 backdrop-blur-sm border-r border-white/5 transition-all duration-300 ${
        isOpen ? 'w-[250px]' : 'w-0 border-r-0'
      }`}
    >
      <div className={`p-4 flex items-center justify-between border-b border-white/5 ${isOpen ? '' : 'hidden'}`}>
        <button onClick={onToggle} className="p-2 hover:bg-white/5 rounded-md transition-colors">
          <Menu size={20} className="text-white/80" />
        </button>
      </div>

      <div className={`flex-1 overflow-y-auto px-3 py-2 ${isOpen ? '' : 'hidden'}`}>
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-2 mb-2 text-sm text-white/60 hover:bg-white/5 rounded-md transition-colors"
        >
          <Edit size={14} />
          New chat
        </button>

        <div className="flex items-center justify-between mb-2 px-2">
          <button
            onClick={() => setShowNewFolderInput(true)}
            className="flex items-center gap-1 text-xs text-white/60 hover:text-white/80 transition-colors"
          >
            <FolderPlus size={14} />
            New Folder
          </button>
          <button
            onClick={onClearAllChats}
            className="text-xs text-red-400/60 hover:text-red-400 transition-colors"
          >
            Clear All
          </button>
        </div>

        {showNewFolderInput && (
          <div className="mb-2 flex items-center gap-1">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') {
                  setShowNewFolderInput(false);
                  setNewFolderName('');
                }
              }}
              placeholder="Folder name..."
              className="flex-1 px-2 py-1 text-sm bg-white/10 text-white rounded outline-none focus:ring-2 focus:ring-purple-400"
              autoFocus
            />
            <button
              onClick={handleCreateFolder}
              className="px-2 py-1 text-sm bg-purple-500/80 hover:bg-purple-500 rounded"
            >
              ✓
            </button>
            <button
              onClick={() => {
                setShowNewFolderInput(false);
                setNewFolderName('');
              }}
              className="px-2 py-1 text-sm bg-white/10 hover:bg-white/20 rounded"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Chats without folder */}
        {getChatsByFolder(null).length > 0 && (
          <div className="mb-3">
            {getChatsByFolder(null).map(chat => renderChat(chat))}
          </div>
        )}

        {/* Folders */}
        {folders.map(folder => {
          const folderChats = getChatsByFolder(folder.id);
          const isCollapsed = collapsedFolders.has(folder.id);
          const isEditing = editingFolderId === folder.id;

          if (folderChats.length === 0 && folder.id !== 'default' && folder.id !== 'work' && folder.id !== 'personal') {
            return null;
          }

          return (
            <div key={folder.id} className="mb-3">
              <div className="flex items-center justify-between px-2 py-1 mb-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleFolderRenameSubmit(folder.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleFolderRenameSubmit(folder.id);
                      if (e.key === 'Escape') setEditingFolderId(null);
                    }}
                    className="flex-1 px-2 py-1 text-xs bg-white/10 text-white rounded outline-none focus:ring-2 focus:ring-purple-400"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => toggleFolder(folder.id)}
                    onDoubleClick={() => handleFolderDoubleClick(folder.id, folder.name)}
                    className="flex items-center gap-1 text-xs text-white/60 hover:text-white/80 transition-colors"
                  >
                    <Folder size={12} className={isCollapsed ? 'opacity-50' : ''} />
                    <span>{folder.name}</span>
                    <span className="text-white/40">({folderChats.length})</span>
                  </button>
                )}
                {!isEditing && folder.id !== 'default' && folder.id !== 'work' && folder.id !== 'personal' && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete folder "${folder.name}"? Chats will be moved to "No folder".`)) {
                        onDeleteFolder(folder.id);
                      }
                    }}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <Trash2 size={12} className="text-red-400/60" />
                  </button>
                )}
              </div>
              {!isCollapsed && folderChats.map(chat => renderChat(chat))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
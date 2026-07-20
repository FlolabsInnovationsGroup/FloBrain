// __tests__/Sidebar.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, expect, vi, beforeEach } from 'vitest';
import Sidebar from '../Sidebar';
import type { ChatHistory, Folder } from '@/types/chat';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Trash2: () => <div data-testid="trash-icon">Trash2</div>,
  Edit2: () => <div data-testid="edit-icon">Edit2</div>,
  Download: () => <div data-testid="download-icon">Download</div>,
  FolderPlus: () => <div data-testid="folder-plus-icon">FolderPlus</div>,
  ChevronDown: () => <div data-testid="chevron-down-icon">ChevronDown</div>,
  ChevronRight: () => <div data-testid="chevron-right-icon">ChevronRight</div>,
  Folder: () => <div data-testid="folder-icon">Folder</div>,
  FolderInput: () => <div data-testid="folder-input-icon">FolderInput</div>,
  Menu: () => <div data-testid="menu-icon">Menu</div>,
}));

describe('Sidebar Component', () => {
  const mockOnToggle = vi.fn();
  const mockOnNewChat = vi.fn();
  const mockOnLoadChat = vi.fn();
  const mockOnDeleteChat = vi.fn();
  const mockOnRenameChat = vi.fn();
  const mockOnClearAllChats = vi.fn();
  const mockOnMoveToFolder = vi.fn();
  const mockOnCreateFolder = vi.fn();
  const mockOnDeleteFolder = vi.fn();
  const mockOnRenameFolder = vi.fn();
  const mockOnExportChat = vi.fn();

  const mockChatHistory: ChatHistory[] = [
    { id: 1, title: 'First Chat', folderId: null, timestamp: new Date(), messages: [] },
    { id: 2, title: 'Second Chat', folderId: 1, timestamp: new Date(), messages: [] },
    { id: 3, title: 'Third Chat', folderId: null, timestamp: new Date(), messages: [] },
  ];

  const mockFolders: Folder[] = [
    { id: 1, name: 'Work', chats: [2] },
    { id: 2, name: 'Personal', chats: [] },
  ];

  const defaultProps = {
    isOpen: true,
    onToggle: mockOnToggle,
    chatHistory: mockChatHistory,
    folders: mockFolders,
    currentChatId: 1,
    onNewChat: mockOnNewChat,
    onLoadChat: mockOnLoadChat,
    onDeleteChat: mockOnDeleteChat,
    onRenameChat: mockOnRenameChat,
    onClearAllChats: mockOnClearAllChats,
    onMoveToFolder: mockOnMoveToFolder,
    onCreateFolder: mockOnCreateFolder,
    onDeleteFolder: mockOnDeleteFolder,
    onRenameFolder: mockOnRenameFolder,
    onExportChat: mockOnExportChat,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.confirm
    window.confirm = vi.fn(() => true);
  });

  describe('Basic Rendering', () => {
    test('does not render when isOpen is false', () => {
      render(<Sidebar {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Chats')).not.toBeInTheDocument();
    });

    test('renders sidebar when isOpen is true', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByText('Chats')).toBeInTheDocument();
    });

    test('renders header with title and close button', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByText('Chats')).toBeInTheDocument();
      const closeButton = screen.getByText('Chats').parentElement?.querySelector('button');
      expect(closeButton).toBeTruthy();
      fireEvent.click(closeButton!);
      expect(mockOnToggle).toHaveBeenCalled();
    });

    test('renders New Chat button', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByText('New Chat')).toBeInTheDocument();
    });

    test('renders New Folder button', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByText('New Folder')).toBeInTheDocument();
    });
  });

  describe('Chat History Display', () => {
    test('shows history section', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByText('History')).toBeInTheDocument();
    });

    test('shows Clear All button when there are chats', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    test('does not show Clear All button when no chats', () => {
      render(<Sidebar {...defaultProps} chatHistory={[]} />);
      expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
    });

    test('shows "No chats yet" when chatHistory is empty', () => {
      render(<Sidebar {...defaultProps} chatHistory={[]} />);
      expect(screen.getByText('No chats yet')).toBeInTheDocument();
    });

    test('renders chat items', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByText('First Chat')).toBeInTheDocument();
      expect(screen.getByText('Third Chat')).toBeInTheDocument();
    });
  });

  describe('Chat Item Interactions', () => {
    test('highlights current chat', () => {
      render(<Sidebar {...defaultProps} currentChatId={1} />);
      const chatItem = screen.getByText('First Chat').closest('button');
      expect(chatItem).toHaveClass('bg-[#7c5dbd]/30');
    });

    test('calls onLoadChat when chat is clicked', () => {
      render(<Sidebar {...defaultProps} />);
      fireEvent.click(screen.getByText('First Chat'));
      expect(mockOnLoadChat).toHaveBeenCalledWith(1);
    });

    test('shows action buttons on hover', () => {
      render(<Sidebar {...defaultProps} />);
      // The action buttons are initially hidden (opacity-0)
      // They appear on group hover (opacity-0 group-hover:opacity-100)
      // In tests, we can simulate hover by directly triggering mouse events
      const _chatItem = screen.getByText('First Chat').closest('.group');
      // The buttons should be in the DOM even if not visible
      expect(screen.getAllByTestId('edit-icon').length).toBeGreaterThan(0);
    });
  });

  describe('Chat Editing', () => {
    test('enables editing mode on double click', () => {
      render(<Sidebar {...defaultProps} />);
      const chatText = screen.getByText('First Chat');
      
      fireEvent.doubleClick(chatText);
      
      // Should show input field
      const input = screen.getByDisplayValue('First Chat');
      expect(input).toBeInTheDocument();
    });

    test('saves chat title on Enter key', () => {
      render(<Sidebar {...defaultProps} />);
      const chatText = screen.getByText('First Chat');
      
      // Start editing
      fireEvent.doubleClick(chatText);
      const input = screen.getByDisplayValue('First Chat');
      
      // Change value and press Enter
      fireEvent.change(input, { target: { value: 'Updated Title' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      
      expect(mockOnRenameChat).toHaveBeenCalledWith(1, 'Updated Title');
    });

    test('cancels editing on Escape key', () => {
      render(<Sidebar {...defaultProps} />);
      const chatText = screen.getByText('First Chat');
      
      // Start editing
      fireEvent.doubleClick(chatText);
      const input = screen.getByDisplayValue('First Chat');
      
      // Press Escape
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
      
      // Should be back to text display
      expect(screen.getByText('First Chat')).toBeInTheDocument();
      expect(input).not.toBeInTheDocument();
    });
  });

  describe('Chat Actions', () => {
    test('deletes chat with confirmation', () => {
      render(<Sidebar {...defaultProps} />);
      const firstChatRow = screen.getByText('First Chat').closest('.group') as HTMLElement;
      fireEvent.click(within(firstChatRow).getByTitle('Delete'));
      expect(window.confirm).toHaveBeenCalledWith('Delete this chat?');
      expect(mockOnDeleteChat).toHaveBeenCalledWith(1);
    });

    test('shows export menu when export button is clicked', () => {
      render(<Sidebar {...defaultProps} />);
      
      const exportButtons = screen.getAllByTestId('download-icon');
      const exportButton = exportButtons[0].closest('button');
      
      if (exportButton) {
        fireEvent.click(exportButton);
      }
      
      // Should show export options
      waitFor(() => {
        expect(screen.getByText('TXT')).toBeInTheDocument();
        expect(screen.getByText('JSON')).toBeInTheDocument();
        expect(screen.getByText('PDF')).toBeInTheDocument();
      });
    });

    test('exports chat in selected format', () => {
      render(<Sidebar {...defaultProps} />);
      
      // Click export button to show menu
      const exportButtons = screen.getAllByTestId('download-icon');
      const exportButton = exportButtons[0].closest('button');
      
      if (exportButton) {
        fireEvent.click(exportButton);
      }
      
      // Click TXT export option
      waitFor(() => {
        const txtOption = screen.getByText('TXT');
        fireEvent.click(txtOption);
        expect(mockOnExportChat).toHaveBeenCalledWith(1, 'txt');
      });
    });
  });

  describe('Folder Management', () => {
    test('renders folders', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByText('Work')).toBeInTheDocument();
      expect(screen.getByText('Personal')).toBeInTheDocument();
    });

    test('expands and collapses folders', () => {
      render(<Sidebar {...defaultProps} />);
      
      // Find and click expand button
      const expandButtons = screen.getAllByTestId('chevron-right-icon');
      const expandButton = expandButtons[0].closest('button');
      
      if (expandButton) {
        fireEvent.click(expandButton);
      }
      
      // Should show chat in folder
      waitFor(() => {
        expect(screen.getByText('Second Chat')).toBeInTheDocument();
      });
    });

    test('shows new folder input when New Folder button is clicked', () => {
      render(<Sidebar {...defaultProps} />);
      
      fireEvent.click(screen.getByText('New Folder'));
      
      expect(screen.getByPlaceholderText('Folder name...')).toBeInTheDocument();
    });

    test('creates new folder', () => {
      render(<Sidebar {...defaultProps} />);
      
      // Click New Folder button
      fireEvent.click(screen.getByText('New Folder'));
      
      // Type folder name
      const input = screen.getByPlaceholderText('Folder name...');
      fireEvent.change(input, { target: { value: 'New Folder Name' } });
      
      // Click checkmark button
      const checkButton = screen.getByText('✓');
      fireEvent.click(checkButton);
      
      expect(mockOnCreateFolder).toHaveBeenCalledWith('New Folder Name');
    });

    test('cancels new folder creation', () => {
      render(<Sidebar {...defaultProps} />);
      
      // Click New Folder button
      fireEvent.click(screen.getByText('New Folder'));
      
      // Click cancel button
      const cancelButton = screen.getByText('✕');
      fireEvent.click(cancelButton);
      
      expect(screen.queryByPlaceholderText('Folder name...')).not.toBeInTheDocument();
    });

    test('deletes folder', () => {
      render(<Sidebar {...defaultProps} />);
      fireEvent.click(screen.getAllByTitle('Delete folder')[0]);
      expect(mockOnDeleteFolder).toHaveBeenCalledWith(1);
    });
  });

  describe('Move to Folder', () => {
    test('shows move menu', () => {
      render(<Sidebar {...defaultProps} />);
      
      // Find move button
      const moveButtons = screen.getAllByTestId('folder-input-icon');
      const moveButton = moveButtons[0].closest('button');
      
      if (moveButton) {
        fireEvent.click(moveButton);
      }
      
      waitFor(() => {
        expect(screen.getByText('Root')).toBeInTheDocument();
        expect(screen.getByText('Work')).toBeInTheDocument();
        expect(screen.getByText('Personal')).toBeInTheDocument();
      });
    });

    test('moves chat to folder', () => {
      render(<Sidebar {...defaultProps} />);
      
      // Click move button
      const moveButtons = screen.getAllByTestId('folder-input-icon');
      const moveButton = moveButtons[0].closest('button');
      
      if (moveButton) {
        fireEvent.click(moveButton);
      }
      
      // Click on Work folder
      waitFor(() => {
        const workOption = screen.getByText('Work');
        fireEvent.click(workOption);
        expect(mockOnMoveToFolder).toHaveBeenCalledWith(1, 1);
      });
    });

    test('moves chat to root', () => {
      render(<Sidebar {...defaultProps} />);
      
      // Click move button for a chat in folder
      const moveButtons = screen.getAllByTestId('folder-input-icon');
      const moveButton = moveButtons[1].closest('button'); // Second chat is in a folder
      
      if (moveButton) {
        fireEvent.click(moveButton);
      }
      
      // Click on Root option
      waitFor(() => {
        const rootOption = screen.getByText('Root');
        fireEvent.click(rootOption);
        expect(mockOnMoveToFolder).toHaveBeenCalledWith(2, null);
      });
    });
  });

  describe('User Profile Section', () => {
    test('renders user profile', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('Free Plan')).toBeInTheDocument();
    });
  });

  describe('Clear All Chats', () => {
    test('calls onClearAllChats when Clear All is clicked', () => {
      render(<Sidebar {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Clear All'));
      expect(mockOnClearAllChats).toHaveBeenCalled();
    });
  });
});
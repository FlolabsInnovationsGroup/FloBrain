import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import BrainPage from './page';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false }),
}));

vi.mock('./components/Sidebar/index', () => ({
  default: function MockSidebar({
    isOpen,
    onToggle,
  }: {
    isOpen: boolean;
    onToggle: () => void;
  }) {
    return (
      <div data-testid="sidebar">
        <span>Sidebar is {isOpen ? 'Open' : 'Closed'}</span>
        <button type="button" onClick={onToggle}>
          Toggle Sidebar
        </button>
      </div>
    );
  },
}));

vi.mock('./components/ChatArea/index', () => ({ default: () => <div data-testid="chat-area">ChatArea</div> }));
vi.mock('./components/MessageInput/index', () => ({ default: () => <div data-testid="message-input">MessageInput</div> }));
vi.mock('jspdf', () => ({ __esModule: true, default: vi.fn() }));

describe('BrainPage', () => {
  it('renders main layout with sidebar and welcome content', () => {
    render(<BrainPage />);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByText('Welcome to FLOBRAIN')).toBeInTheDocument();
    expect(screen.getByText(/Start a new conversation/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start New Chat/i })).toBeInTheDocument();
  });

  it('initializes with sidebar open', () => {
    render(<BrainPage />);
    expect(screen.getByText('Sidebar is Open')).toBeInTheDocument();
  });

  it('toggles sidebar when button is clicked', () => {
    render(<BrainPage />);
    fireEvent.click(screen.getByText('Toggle Sidebar'));
    expect(screen.getByText('Sidebar is Closed')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Toggle Sidebar'));
    expect(screen.getByText('Sidebar is Open')).toBeInTheDocument();
  });

  it('starts new chat when Start New Chat is clicked', async () => {
    render(<BrainPage />);
    fireEvent.click(screen.getByRole('button', { name: /Start New Chat/i }));
    expect(screen.getByTestId('chat-area')).toBeInTheDocument();
    expect(screen.getByTestId('message-input')).toBeInTheDocument();
  });
});
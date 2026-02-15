import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BrainPage from './page'; // Adjust path if your file is named page.tsx or index.tsx

// --- MOCK CHILD COMPONENTS ---
// We mock Sidebar and Navbar because we are testing the PAGE logic, not the re-testing the children.
// This isolates the test and avoids errors from missing context or complex child logic.

jest.mock('./components/Sidebar', () => {
  return function MockSidebar({ isOpen, onToggle }: any) {
    return (
      <div data-testid="sidebar">
        <span>Sidebar is {isOpen ? 'Open' : 'Closed'}</span>
        <button onClick={onToggle}>Toggle Sidebar Internal</button>
      </div>
    );
  };
});

jest.mock('./components/Header', () => {
  return function MockNavbar({ isSidebarOpen, onToggleSidebar }: any) {
    return (
      <nav data-testid="navbar">
        <span>Nav thinks sidebar is {isSidebarOpen ? 'Open' : 'Closed'}</span>
        <button onClick={onToggleSidebar}>Toggle Sidebar External</button>
      </nav>
    );
  };
});

// Mock types since they are imported
jest.mock('@/types/chat', () => ({}), { virtual: true });

describe('BrainPage Integration', () => {
  
  // --- 1. RENDERING TESTS ---

  it('renders the main layout correctly', () => {
    render(<BrainPage />);

    // Check presence of key structural elements
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByText('Brain Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Select a chat or start a new conversation.')).toBeInTheDocument();
  });

  // --- 2. STATE & INTERACTION TESTS ---

  it('initializes with the sidebar OPEN', () => {
    render(<BrainPage />);
    
    // Check our mock output
    expect(screen.getByText('Sidebar is Open')).toBeInTheDocument();
    expect(screen.getByText('Nav thinks sidebar is Open')).toBeInTheDocument();
  });

  it('toggles the sidebar when the Navbar button is clicked', () => {
    render(<BrainPage />);

    const navToggleButton = screen.getByText('Toggle Sidebar External');
    
    // 1. Click toggle in Navbar
    fireEvent.click(navToggleButton);

    // 2. Sidebar should now be Closed
    expect(screen.getByText('Sidebar is Closed')).toBeInTheDocument();
    expect(screen.getByText('Nav thinks sidebar is Closed')).toBeInTheDocument();
    
    // 3. Click again to Open
    fireEvent.click(navToggleButton);
    expect(screen.getByText('Sidebar is Open')).toBeInTheDocument();
  });

  it('toggles the sidebar when the Sidebar internal button is clicked', () => {
    render(<BrainPage />);

    const sidebarToggleButton = screen.getByText('Toggle Sidebar Internal');
    
    // 1. Click toggle inside Sidebar
    fireEvent.click(sidebarToggleButton);

    // 2. Verify State Change
    expect(screen.getByText('Sidebar is Closed')).toBeInTheDocument();
  });

  // --- 3. LAYOUT STRUCTURE TESTS ---

  it('renders the main content wrapper with correct classes', () => {
    const { container } = render(<BrainPage />);

    // The root div
    const rootDiv = container.firstChild;
    expect(rootDiv).toHaveClass('flex', 'h-screen', 'bg-[#1a0b2e]', 'overflow-hidden');

    // The main content area (sibling to sidebar)
    // We find the parent of the dashboard text
    const mainArea = screen.getByText('Brain Dashboard').closest('main');
    expect(mainArea).toHaveClass('flex-1', 'relative', 'overflow-y-auto');
  });
});
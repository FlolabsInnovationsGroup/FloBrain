// __tests__/ChatArea.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import ChatArea from '.'; // Adjust path if necessary
import type { Message } from '@/types/chat';

// Mock the SVG imports
vi.mock('@/assets/images/synthesiznig-circle.svg', () => ({ default: '/synthesiznig-circle.svg' }));
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src: _src, alt }: { src: string; alt?: string }) => (
    <div data-testid="next-image" role="img" aria-label={alt || 'image'} />
  ),
}));

const scrollIntoViewMock = vi.fn();
window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

describe('ChatArea Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty State', () => {
    test('renders empty state when no messages', () => {
      render(<ChatArea messages={[]} />);
      expect(screen.getByText('Start a conversation')).toBeInTheDocument();
      expect(screen.getByText('Type a message below to begin chatting with FLOBRAIN AI')).toBeInTheDocument();
      const svgElement = document.querySelector('svg');
      expect(svgElement).toBeInTheDocument();
    });

    test('uses responsive spacing classes for chat wrapper', () => {
      const { container } = render(<ChatArea messages={[]} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('px-3');
      expect(wrapper.className).toContain('sm:px-4');
      expect(wrapper.className).toContain('md:px-6');
    });
  });

  describe('With Messages', () => {
    const mockMessages: Message[] = [
      {
        id: '1',
        type: 'user',
        text: 'Hello, how are you?',
        timestamp: new Date(),
      },
      {
        id: '2',
        type: 'assistant',
        text: 'I am doing well, thank you for asking! How can I help you today?',
        timestamp: new Date(),
      },
      {
        id: '3',
        type: 'user',
        text: 'Can you explain quantum computing?',
        image: 'https://example.com/image.jpg',
        timestamp: new Date(),
      },
      {
        id: '4',
        type: 'assistant',
        text: 'Quantum computing uses quantum bits or qubits...',
        timestamp: new Date(),
      },
    ];

    test('renders all messages correctly', () => {
      render(<ChatArea messages={mockMessages} />);
      expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
      expect(screen.getByText('I am doing well, thank you for asking! How can I help you today?')).toBeInTheDocument();
      expect(screen.getByText('Can you explain quantum computing?')).toBeInTheDocument();
      expect(screen.getByText('Quantum computing uses quantum bits or qubits...')).toBeInTheDocument();
    });

    test('renders images in messages when provided', () => {
      render(<ChatArea messages={mockMessages} />);
      const image = screen.getByRole('img', { name: 'User upload' });
      expect(image).toBeInTheDocument();
    });
  });

  describe('Auto-scroll Behavior', () => {
    test('calls scrollIntoView when messages change', async () => {
      const { rerender } = render(<ChatArea messages={[]} />);
      const newMessages: Message[] = [{
        id: '1',
        type: 'user',
        text: 'New message',
        timestamp: new Date(),
      }];
      rerender(<ChatArea messages={newMessages} />);
      await waitFor(() => {
        expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles messages with only images (no text)', () => {
      const messages: Message[] = [{
        id: '1',
        type: 'user',
        image: 'https://example.com/test.jpg',
        timestamp: new Date(),
      }];
      render(<ChatArea messages={messages} />);
      const image = screen.getByRole('img', { name: 'User upload' });
      expect(image).toBeInTheDocument();
    });
  });
});
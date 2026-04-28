import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import ChatInput from './index';

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt }: { alt?: string }) => <div role="img" aria-label={alt ?? 'image'} />,
}));

describe('ChatInput', () => {
  it('renders composer with expected placeholder', () => {
    render(<ChatInput onSendMessage={vi.fn()} />);
    expect(screen.getByPlaceholderText('How does this LLM work?')).toBeInTheDocument();
  });

  it('sends message on button click', () => {
    const onSendMessage = vi.fn();
    render(<ChatInput onSendMessage={onSendMessage} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Hello from mobile' } });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));
    expect(onSendMessage).toHaveBeenCalledWith('Hello from mobile', undefined);
  });

  it('sends message on Enter and does not send on Shift+Enter', () => {
    const onSendMessage = vi.fn();
    render(<ChatInput onSendMessage={onSendMessage} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Line one' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: true });
    expect(onSendMessage).not.toHaveBeenCalled();
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });
    expect(onSendMessage).toHaveBeenCalledWith('Line one', undefined);
  });

  it('disables textarea and send button when disabled', () => {
    render(<ChatInput onSendMessage={vi.fn()} disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled();
  });

  it('applies compact responsive sizing classes in compact mode', () => {
    const { container } = render(<ChatInput onSendMessage={vi.fn()} compactMode />);
    expect(container.firstChild).toHaveClass('backdrop-blur-sm');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    expect(sendButton.className).toContain('h-9');
    expect(sendButton.className).toContain('sm:h-10');
  });
});
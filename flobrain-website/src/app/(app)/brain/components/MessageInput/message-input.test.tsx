import React from 'react';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatInput from './index';
import { vi } from 'vitest';

vi.mock('lucide-react', () => ({
  Mic: () => <div data-testid="mic-icon">Mic</div>,
  Image: () => <div data-testid="image-icon">Image</div>,
  X: () => <div data-testid="x-icon">X</div>,
  Zap: () => <div data-testid="zap-icon">Zap</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  ArrowUp: () => <div data-testid="arrow-up-icon">ArrowUp</div>,
}));

type MockRecognition = {
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: {
    results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
  }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

let latestRecognition: MockRecognition | null = null;

function createRecognition(): MockRecognition {
  const recognition: MockRecognition = {
    start: vi.fn(),
    stop: vi.fn(() => {
      recognition.onend?.();
    }),
    continuous: false,
    interimResults: false,
    lang: '',
    onresult: null,
    onerror: null,
    onend: null,
  };
  latestRecognition = recognition;
  return recognition;
}

function openAttachMenu() {
  fireEvent.click(screen.getByTestId('chat-mobile-attach-button'));
}

describe('ChatInput', () => {
  const mockOnSendMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    latestRecognition = null;
    Object.defineProperty(window, 'webkitSpeechRecognition', {
      writable: true,
      configurable: true,
      value: function WebkitSpeechRecognitionMock() {
        return createRecognition();
      },
    });
    Object.defineProperty(window, 'SpeechRecognition', {
      writable: true,
      configurable: true,
      value: undefined,
    });
  });

  describe('Basic rendering', () => {
    test('renders textarea with placeholder', () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} />);
      expect(screen.getByPlaceholderText('How does this LLM work?')).toBeInTheDocument();
    });

    test('renders send, mobile attach (+), and desktop inline controls', () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} />);
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
      expect(screen.getByTestId('chat-mobile-attach-button')).toBeInTheDocument();
      expect(screen.getByLabelText('Upload image')).toBeInTheDocument();
      expect(screen.getByLabelText('Voice input')).toBeInTheDocument();
    });

    test('textarea is enabled when not disabled', () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} />);
      expect(screen.getByRole('textbox')).not.toBeDisabled();
    });

    test('textarea is disabled when disabled prop is true', () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });
  });

  describe('Attach menu', () => {
    test('opens menu with Add image and Voice input', () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} />);
      openAttachMenu();
      expect(screen.getByRole('menuitem', { name: /add image/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /voice input/i })).toBeInTheDocument();
    });

    test('hides image menu item when allowImageUpload is false', () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} allowImageUpload={false} />);
      openAttachMenu();
      expect(screen.queryByRole('menuitem', { name: /add image/i })).not.toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /voice input/i })).toBeInTheDocument();
    });

    test('hides voice menu item when allowVoiceInput is false', () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} allowVoiceInput={false} />);
      openAttachMenu();
      expect(screen.getByRole('menuitem', { name: /add image/i })).toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: /voice input/i })).not.toBeInTheDocument();
    });
  });

  describe('Text input and sending', () => {
    test('updates textarea value on input', () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} />);
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Hello World' } });
      expect(textarea.value).toBe('Hello World');
    });

    test('calls onSendMessage when send button is clicked with text', () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} />);
      const textarea = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /send message/i });
      fireEvent.change(textarea, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);
      expect(mockOnSendMessage).toHaveBeenCalledWith('Test message', undefined);
    });

    test('calls onSendMessage when Enter is pressed', () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} />);
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Enter test' } });
      fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });
      expect(mockOnSendMessage).toHaveBeenCalledWith('Enter test', undefined);
    });

    test('does not send when Shift+Enter is pressed', () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} />);
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'New line' } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
      expect(mockOnSendMessage).not.toHaveBeenCalled();
    });

    test('does not send empty message', () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} />);
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));
      expect(mockOnSendMessage).not.toHaveBeenCalled();
    });

    test('clears input after sending', () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} />);
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Test' } });
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));
      expect(textarea.value).toBe('');
    });
  });

  describe('Voice recording', () => {
    test('starts recording from desktop inline mic', async () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} />);
      fireEvent.click(screen.getByRole('button', { name: 'Voice input' }));
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
      });
    });

    test('starts recording from menu and shows stop control', async () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} />);
      openAttachMenu();
      fireEvent.click(screen.getByRole('menuitem', { name: /voice input/i }));
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
      });
    });

    test('shows a listening ring around the microphone while recording', async () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} />);
      openAttachMenu();
      fireEvent.click(screen.getByRole('menuitem', { name: /voice input/i }));
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
      });
      expect(screen.getByTestId('mic-listening-ring')).toHaveClass('animate-ping');
      expect(screen.getByTestId('mic-icon')).toBeInTheDocument();
    });

    test('stops recording when the message is sent', async () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} />);
      fireEvent.click(screen.getByRole('button', { name: 'Voice input' }));
      await waitFor(() => {
        expect(latestRecognition?.start).toHaveBeenCalled();
      });
      act(() => {
        latestRecognition?.onresult?.({
          results: [{ isFinal: true, 0: { transcript: 'send this sentence' } }],
        });
      });

      fireEvent.click(screen.getByRole('button', { name: /send message/i }));

      expect(latestRecognition?.stop).toHaveBeenCalled();
      expect(mockOnSendMessage).toHaveBeenCalledWith('send this sentence', undefined);
      expect(screen.getByRole('button', { name: 'Voice input' })).toBeInTheDocument();
      expect(screen.queryByTestId('mic-listening-ring')).not.toBeInTheDocument();
    });

    test('returns the microphone to its idle icon after stopping', async () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} />);
      fireEvent.click(screen.getByRole('button', { name: 'Voice input' }));
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: /stop recording/i }));
      expect(screen.getByRole('button', { name: 'Voice input' })).toBeInTheDocument();
      expect(screen.queryByTestId('mic-listening-ring')).not.toBeInTheDocument();
    });

    test('writes recognized speech into the input', async () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} />);
      fireEvent.click(screen.getByRole('button', { name: 'Voice input' }));
      await waitFor(() => {
        expect(latestRecognition?.start).toHaveBeenCalled();
      });

      act(() => {
        latestRecognition?.onresult?.({
          results: [{ isFinal: true, 0: { transcript: 'hello from the mic' } }],
        });
      });

      expect(screen.getByRole('textbox')).toHaveValue('hello from the mic');
    });

    test('appends recognized speech after existing text', async () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} />);
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Please explain' } });
      fireEvent.click(screen.getByRole('button', { name: 'Voice input' }));
      await waitFor(() => {
        expect(latestRecognition?.start).toHaveBeenCalled();
      });

      act(() => {
        latestRecognition?.onresult?.({
          results: [{ isFinal: false, 0: { transcript: 'how transformers' } }],
        });
        latestRecognition?.onresult?.({
          results: [{ isFinal: true, 0: { transcript: 'how transformers work' } }],
        });
      });

      expect(screen.getByRole('textbox')).toHaveValue('Please explain how transformers work');
    });
  });

  describe('Disabled state', () => {
    test('mobile attach, desktop image, desktop voice, and send are disabled when disabled prop is true', () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} disabled />);
      expect(screen.getByTestId('chat-mobile-attach-button')).toBeDisabled();
      expect(screen.getByLabelText('Upload image')).toBeDisabled();
      expect(screen.getByLabelText('Voice input')).toBeDisabled();
      expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled();
    });

    test('send is disabled when input is empty and no image', () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} />);
      expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled();
    });

    test('send is enabled when text is entered', () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} />);
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Hello' } });
      expect(screen.getByRole('button', { name: /send message/i })).not.toBeDisabled();
    });
  });

  describe('Error handling', () => {
    test('handles microphone permission error', async () => {
      const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
      render(<ChatInput onSendMessage={mockOnSendMessage} />);
      openAttachMenu();
      fireEvent.click(screen.getByRole('menuitem', { name: /voice input/i }));
      await waitFor(() => {
        expect(latestRecognition?.start).toHaveBeenCalled();
      });
      latestRecognition?.onerror?.({ error: 'not-allowed' });
      expect(mockAlert).toHaveBeenCalledWith('Could not access microphone. Please check permissions.');
      mockAlert.mockRestore();
    });

    test('handles speech recognition not supported', async () => {
      Object.defineProperty(window, 'webkitSpeechRecognition', { value: undefined, configurable: true });
      Object.defineProperty(window, 'SpeechRecognition', { value: undefined, configurable: true });
      const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
      render(<ChatInput onSendMessage={mockOnSendMessage} />);
      openAttachMenu();
      fireEvent.click(screen.getByRole('menuitem', { name: /voice input/i }));
      expect(mockAlert).toHaveBeenCalledWith(
        'Speech recognition not supported in your browser. Please use Chrome or Edge.'
      );
      expect(screen.queryByRole('button', { name: /stop recording/i })).not.toBeInTheDocument();
      mockAlert.mockRestore();
    });
  });
});

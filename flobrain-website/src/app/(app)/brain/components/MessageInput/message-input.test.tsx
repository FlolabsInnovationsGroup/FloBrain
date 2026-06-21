import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatInput from './index';

jest.mock('lucide-react', () => ({
  Mic: () => <div data-testid="mic-icon">Mic</div>,
  MicOff: () => <div data-testid="mic-off-icon">MicOff</div>,
  Image: () => <div data-testid="image-icon">Image</div>,
  X: () => <div data-testid="x-icon">X</div>,
  Zap: () => <div data-testid="zap-icon">Zap</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
}));

Object.defineProperty(window, 'MediaRecorder', {
  writable: true,
  configurable: true,
  value: jest.fn().mockImplementation(() => {
    const recorder: {
      start: jest.Mock;
      stop: jest.Mock;
      onstop: (() => void) | null;
      ondataavailable: ((e: { data: Blob }) => void) | null;
    } = {
      start: jest.fn(),
      onstop: null,
      ondataavailable: null,
      stop: jest.fn(() => {
        recorder.onstop?.();
      }),
    };
    return recorder;
  }),
});

function openAttachMenu() {
  fireEvent.click(screen.getByTestId('chat-mobile-attach-button'));
}

describe('ChatInput', () => {
  const mockOnSendMessage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'webkitSpeechRecognition', {
      writable: true,
      configurable: true,
      value: jest.fn().mockImplementation(() => ({
        start: jest.fn(),
        stop: jest.fn(),
        continuous: false,
        interimResults: false,
        onresult: jest.fn(),
      })),
    });
    Object.defineProperty(window.navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: jest.fn().mockResolvedValue({
          getTracks: jest.fn().mockReturnValue([{ stop: jest.fn() }]),
        }),
      },
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

    test('stop button has pulse styling while recording', async () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} />);
      openAttachMenu();
      fireEvent.click(screen.getByRole('menuitem', { name: /voice input/i }));
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop recording/i })).toHaveClass('animate-pulse');
      });
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
      (window.navigator.mediaDevices.getUserMedia as jest.Mock).mockRejectedValue(
        new Error('Permission denied')
      );
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
      render(<ChatInput onSendMessage={mockOnSendMessage} />);
      openAttachMenu();
      fireEvent.click(screen.getByRole('menuitem', { name: /voice input/i }));
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Could not access microphone. Please check permissions.');
      });
      mockAlert.mockRestore();
    });

    test('handles speech recognition not supported', async () => {
      Object.defineProperty(window, 'webkitSpeechRecognition', { value: undefined });
      Object.defineProperty(window, 'SpeechRecognition', { value: undefined });
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
      render(<ChatInput onSendMessage={mockOnSendMessage} />);
      openAttachMenu();
      fireEvent.click(screen.getByRole('menuitem', { name: /voice input/i }));
      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /stop recording/i }));
      });
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Speech recognition not supported in your browser. Please use Chrome or Edge.'
        );
      });
      mockAlert.mockRestore();
    });
  });
});

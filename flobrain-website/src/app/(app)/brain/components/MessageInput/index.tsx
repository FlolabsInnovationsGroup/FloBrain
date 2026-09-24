"use client";

import { useState, KeyboardEvent as ReactKeyboardEvent, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { Mic, Image as ImageIcon, X, Zap, Plus, ArrowUp } from 'lucide-react';
import Image from 'next/image';

interface ChatInputProps {
  onSendMessage: (text: string, image?: string) => void;
  disabled?: boolean;
  initialText?: string;
  allowImageUpload?: boolean;
  allowVoiceInput?: boolean;
  compactMode?: boolean;
}

export default function ChatInput({
  onSendMessage,
  disabled = false,
  initialText,
  allowImageUpload = true,
  allowVoiceInput = true,
  compactMode = false,
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState(() =>
    typeof initialText === 'string' ? initialText : ''
  );
  const [isRecording, setIsRecording] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const inputValueRef = useRef(inputValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const attachMenuContainerRef = useRef<HTMLDivElement>(null);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);

  inputValueRef.current = inputValue;

  const minTextareaPx = compactMode ? 40 : 48;
  const maxTextareaPx = 220;

  const syncTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    // Reset so scrollHeight reflects only current text (shrinks when lines are removed).
    el.style.height = 'auto';
    el.style.minHeight = '0';
    el.style.maxHeight = 'none';
    el.style.overflow = 'hidden';
    const natural = el.scrollHeight;
    const next = Math.min(Math.max(natural, minTextareaPx), maxTextareaPx);
    el.style.height = `${next}px`;
    el.style.minHeight = '';
    el.style.maxHeight = '';
    el.style.overflow = '';
  }, [minTextareaPx, maxTextareaPx]);

  useLayoutEffect(() => {
    syncTextareaHeight();
  }, [inputValue, syncTextareaHeight, compactMode]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const onResize = () => syncTextareaHeight();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [syncTextareaHeight]);

  useEffect(() => {
    if (!attachMenuOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      const el = attachMenuContainerRef.current;
      if (el && !el.contains(e.target as Node)) {
        setAttachMenuOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAttachMenuOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [attachMenuOpen]);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(min-width: 1280px)');
    const onChange = () => {
      if (mq.matches) setAttachMenuOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const stopRecording = () => {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.stop();
    }
    setIsRecording(false);
  };

  const handleSend = () => {
    if ((inputValue.trim() || imagePreview) && !disabled) {
      stopRecording();
      onSendMessage(inputValue.trim(), imagePreview || undefined);
      setInputValue('');
      setImagePreview(null);
      textareaRef.current?.focus();
      queueMicrotask(() => syncTextareaHeight());
    }
  };

  const handleKeyPress = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current;
      recognitionRef.current = null;
      if (!recognition) return;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.stop();
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      alert('Speech recognition not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || 'en-US';

    const baseText = inputValueRef.current.replace(/\s+$/, '');

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let spoken = '';
      for (let i = 0; i < event.results.length; i++) {
        spoken += event.results[i][0]?.transcript ?? '';
      }
      const transcript = spoken.replace(/\s+/g, ' ').trim();
      if (!transcript) return;
      setInputValue(baseText ? `${baseText} ${transcript}` : transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'aborted' || event.error === 'no-speech') return;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed' || event.error === 'audio-capture') {
        alert('Could not access microphone. Please check permissions.');
        return;
      }
      if (event.error === 'network') {
        alert('Speech recognition could not reach the speech service. Check your connection and try Chrome or Edge.');
        return;
      }
      alert('Speech recognition failed. Please try again.');
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    setIsRecording(true);
    try {
      recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      recognitionRef.current = null;
      setIsRecording(false);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  // Image upload
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full shrink-0 overflow-hidden backdrop-blur-sm">
      <div
        className={`mx-auto w-full min-w-0 max-w-4xl px-3 sm:px-4 lg:px-6 ${
          compactMode ? 'py-2.5' : 'py-3 lg:py-4'
        }`}
      >
        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-3 relative inline-block">
            <Image 
              src={imagePreview} 
              alt="Upload preview" 
              width={200}
              height={128}
              className="max-h-32 rounded-lg border border-white/20"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 rounded-full p-1 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div
          className={`flex w-full min-w-0 items-end gap-1.5 rounded-2xl border border-[#1F2937] bg-[#111827] px-1.5 sm:gap-2 sm:px-2 xl:gap-3 ${
            compactMode ? 'py-1.5' : 'py-2'
          }`}
        >
          {/* Lightning icon (left) — hidden when space is tight */}
          <div
            className="mb-1 hidden shrink-0 items-center justify-center rounded-lg p-1.5 text-amber-400/90 xl:flex xl:p-2"
            aria-hidden
          >
            <Zap size={18} fill="none" />
          </div>

          {/* Text Input */}
          <div className="relative flex min-w-0 flex-1 items-end">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="How does this LLM work?"
              disabled={disabled}
              rows={1}
              className={`max-h-[220px] w-full min-w-0 resize-none overflow-y-auto pl-1 pr-2 text-sm text-white
                       transition-[height] duration-150 ease-out placeholder:text-white/45 focus:outline-none
                       disabled:cursor-not-allowed disabled:opacity-50 sm:pl-2 xl:pr-4 xl:text-base ${
                         compactMode ? 'min-h-10 py-2.5' : 'min-h-10 py-2.5 xl:min-h-12 xl:py-3'
                       }`}
            />
          </div>

          {(allowImageUpload || allowVoiceInput) && (
            <>
              {allowVoiceInput && isRecording ? (
                <button
                  type="button"
                  onClick={() => void toggleRecording()}
                  disabled={disabled}
                  className="relative mb-1 shrink-0 rounded-full p-1.5 text-violet-300 transition-colors hover:bg-violet-500/10 hover:text-violet-200 disabled:opacity-50 xl:p-2"
                  title="Stop recording"
                  aria-label="Stop recording"
                >
                  <span
                    data-testid="mic-listening-ring"
                    className="pointer-events-none absolute inset-0 animate-ping rounded-full border-2 border-violet-400"
                    aria-hidden
                  />
                  <span
                    className="pointer-events-none absolute inset-0 rounded-full border border-violet-400/70"
                    aria-hidden
                  />
                  <Mic size={18} className="relative" />
                </button>
              ) : (
                <>
                  {/* Compact: + menu when inline controls would overflow */}
                  <div ref={attachMenuContainerRef} className="relative mb-1 shrink-0 xl:hidden">
                    <button
                      type="button"
                      data-testid="chat-mobile-attach-button"
                      onClick={() => !disabled && setAttachMenuOpen((o) => !o)}
                      disabled={disabled}
                      aria-expanded={attachMenuOpen}
                      aria-haspopup="menu"
                      aria-label="Attach"
                      title="Attach"
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50 xl:p-2"
                    >
                      <Plus size={20} strokeWidth={2.25} />
                    </button>
                    {attachMenuOpen && (
                      <div
                        role="menu"
                        className="absolute bottom-[calc(100%+8px)] right-0 z-20 min-w-[11rem] rounded-xl border border-white/10 bg-[#1a1530] py-1 shadow-xl"
                      >
                        {allowImageUpload && (
                          <button
                            type="button"
                            role="menuitem"
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-white/90 hover:bg-white/10"
                            onClick={() => {
                              setAttachMenuOpen(false);
                              fileInputRef.current?.click();
                            }}
                          >
                            <ImageIcon size={18} className="shrink-0 text-slate-400" aria-hidden />
                            Add image
                          </button>
                        )}
                        {allowVoiceInput && (
                          <button
                            type="button"
                            role="menuitem"
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-white/90 hover:bg-white/10"
                            onClick={() => {
                              setAttachMenuOpen(false);
                              void toggleRecording();
                            }}
                          >
                            <Mic size={18} className="shrink-0 text-slate-400" aria-hidden />
                            Voice input
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Wide screens: inline image + voice */}
                  <div className="mb-1 hidden shrink-0 items-center gap-0.5 xl:flex xl:gap-1">
                    {allowImageUpload && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50 xl:p-2"
                        title="Upload image"
                        aria-label="Upload image"
                      >
                        <ImageIcon size={18} />
                      </button>
                    )}
                    {allowVoiceInput && (
                      <button
                        type="button"
                        onClick={() => void toggleRecording()}
                        disabled={disabled}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50 xl:p-2"
                        title="Voice input"
                        aria-label="Voice input"
                      >
                        <Mic size={18} />
                      </button>
                    )}
                  </div>
                </>
              )}
              {allowImageUpload && (
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  data-testid="chat-image-input"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              )}
            </>
          )}

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={(!inputValue.trim() && !imagePreview) || disabled}
            className="mb-1 flex shrink-0 items-center justify-center rounded-lg bg-[#9333ea] p-1.5 text-white shadow-lg shadow-[#9333ea]/30 transition-all duration-200 hover:bg-[#a855f7] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 xl:p-2"
            aria-label="Send message"
          >
            <ArrowUp size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
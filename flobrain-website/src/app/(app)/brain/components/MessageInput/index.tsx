"use client";

import { useState, KeyboardEvent as ReactKeyboardEvent, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { Mic, MicOff, Image as ImageIcon, X, Zap, Plus } from 'lucide-react';
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const attachMenuContainerRef = useRef<HTMLDivElement>(null);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);

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
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => {
      if (mq.matches) setAttachMenuOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const handleSend = () => {
    if ((inputValue.trim() || imagePreview) && !disabled) {
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

  // Voice recording
  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        const audioChunks: Blob[] = [];
        
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          void new Blob(audioChunks, { type: 'audio/webm' });

          // Use Web Speech API for speech-to-text
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
          
          if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognition.onresult = (event: any) => {
              const transcript = event.results[0][0].transcript;
              setInputValue(prev => prev + ' ' + transcript);
            };
            
            recognition.start();
          } else {
            alert('Speech recognition not supported in your browser. Please use Chrome or Edge.');
          }
          
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Could not access microphone. Please check permissions.');
      }
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
    <div className="backdrop-blur-sm shrink-0">
      <div className={`mx-auto max-w-4xl px-3 sm:px-4 md:px-6 ${compactMode ? 'py-2.5' : 'py-3 sm:py-4'}`}>
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
<<<<<<< HEAD
          className={`flex items-center gap-1.5 rounded-2xl border border-[#1F2937] bg-[#111827] px-2 sm:gap-3 sm:rounded-full ${
=======
          className={`flex items-end gap-3 rounded-2xl border border-[#1F2937] bg-[#111827] px-2 ${
>>>>>>> origin/main
            compactMode ? 'py-1.5' : 'py-2'
          }`}
        >
          {/* Lightning icon (left) */}
<<<<<<< HEAD
          <div className="shrink-0 text-amber-400/90" aria-hidden>
            <Zap className="ml-2 h-4 w-4 sm:ml-4 sm:h-5 sm:w-5" fill="none" />
=======
          <div className="mb-1 shrink-0 text-amber-400/90" aria-hidden>
            <Zap className="ml-4 h-5 w-5" fill="none" />
>>>>>>> origin/main
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
<<<<<<< HEAD
              className={`h-10 w-full min-w-0 resize-none pl-1 pr-1 text-sm text-white placeholder:text-white focus:outline-none sm:pl-2 sm:pr-4 sm:text-base
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                         compactMode ? 'py-2.5' : 'sm:h-12 py-2.5 sm:py-3'
=======
              className={`max-h-[220px] w-full min-w-0 resize-none overflow-y-auto pl-2 pr-4 text-base text-white
                       transition-[height] duration-150 ease-out placeholder:text-white/45 focus:outline-none
                       disabled:cursor-not-allowed disabled:opacity-50 ${
                         compactMode ? 'min-h-10 py-2.5' : 'min-h-12 py-3'
>>>>>>> origin/main
                       }`}
            />
          </div>

<<<<<<< HEAD
          {/* Secondary actions (image, voice) - compact */}
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            {allowImageUpload && (
              <>
=======
          {(allowImageUpload || allowVoiceInput) && (
            <>
              {allowVoiceInput && isRecording ? (
>>>>>>> origin/main
                <button
                  type="button"
                  onClick={() => void toggleRecording()}
                  disabled={disabled}
<<<<<<< HEAD
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50 sm:p-2"
                  title="Upload image"
                >
                  <ImageIcon size={16} />
=======
                  className="mb-1 shrink-0 rounded-lg p-2 text-red-400 transition-colors animate-pulse hover:bg-white/5 hover:text-red-300 disabled:opacity-50"
                  title="Stop recording"
                  aria-label="Stop recording"
                >
                  <MicOff size={18} />
>>>>>>> origin/main
                </button>
              ) : (
                <>
                  {/* Mobile: + menu */}
                  <div ref={attachMenuContainerRef} className="relative mb-1 shrink-0 md:hidden">
                    <button
                      type="button"
                      data-testid="chat-mobile-attach-button"
                      onClick={() => !disabled && setAttachMenuOpen((o) => !o)}
                      disabled={disabled}
                      aria-expanded={attachMenuOpen}
                      aria-haspopup="menu"
                      aria-label="Attach"
                      title="Attach"
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
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
                  {/* Desktop: inline image + voice (original layout) */}
                  <div className="mb-1 hidden shrink-0 items-center gap-1 md:flex">
                    {allowImageUpload && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
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
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
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
<<<<<<< HEAD
              </>
            )}
            {allowVoiceInput && (
              <button
                onClick={toggleRecording}
                disabled={disabled}
                className={`rounded-lg p-1.5 transition-colors disabled:opacity-50 sm:p-2 ${
                  isRecording
                    ? 'text-red-400 hover:text-red-300 animate-pulse'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title={isRecording ? 'Stop recording' : 'Voice input'}
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            )}
          </div>
=======
              )}
            </>
          )}
>>>>>>> origin/main

          {/* Send Button - circular purple with arrow up */}
          <button
            onClick={handleSend}
            disabled={(!inputValue.trim() && !imagePreview) || disabled}
<<<<<<< HEAD
            className={`shrink-0 rounded-full bg-[#9333ea] hover:bg-[#a855f7] text-white
                     flex items-center justify-center font-medium hover:opacity-90 transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#9333ea]/30 ${
                       compactMode ? 'h-9 w-9 sm:h-10 sm:w-10' : 'h-10 w-10 sm:h-12 sm:w-12'
=======
            className={`mb-1 shrink-0 rounded-full bg-[#9333ea] text-white shadow-lg shadow-[#9333ea]/30 transition-all duration-200
                     hover:bg-[#a855f7] hover:opacity-90 flex items-center justify-center font-medium
                     disabled:cursor-not-allowed disabled:opacity-50 ${
                       compactMode ? 'h-10 w-10' : 'h-12 w-12'
>>>>>>> origin/main
                     }`}
            aria-label="Send message"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
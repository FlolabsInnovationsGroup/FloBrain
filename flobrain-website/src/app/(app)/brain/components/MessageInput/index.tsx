"use client";

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Mic, MicOff, Image as ImageIcon, X, Zap } from 'lucide-react';
import Image from 'next/image';

interface ChatInputProps {
  onSendMessage: (text: string, image?: string) => void;
  disabled?: boolean;
  initialText?: string;
}

export default function ChatInput({ onSendMessage, disabled = false, initialText }: ChatInputProps) {
  const [inputValue, setInputValue] = useState(() =>
    typeof initialText === 'string' ? initialText : ''
  );
  const [isRecording, setIsRecording] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = () => {
    if ((inputValue.trim() || imagePreview) && !disabled) {
      onSendMessage(inputValue.trim(), imagePreview || undefined);
      setInputValue('');
      setImagePreview(null);
      textareaRef.current?.focus();
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
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
new Blob(audioChunks, { type: 'audio/webm' });
          
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
      <div className="max-w-4xl mx-auto px-6 py-4">
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

        <div className="flex gap-3 items-center bg-[#111827] border-[#1F2937] border px-2 py-2 rounded-full ">
          {/* Lightning icon (left) */}
          <div className="shrink-0 text-amber-400/90" aria-hidden>
            <Zap className="w-5 h-5 ml-4" fill="none" />
          </div>

          {/* Text Input */}
          <div className="flex-1 relative flex min-w-0">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="How does this LLM work?"
              disabled={disabled}
              rows={1}
              className="w-full min-w-0 h-12 text-white pl-2 pr-4 py-3
                       resize-none placeholder:text-white text-base focus:outline-none
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            />
          </div>

          {/* Secondary actions (image, voice) - compact */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
              title="Upload image"
            >
              <ImageIcon size={18} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              onClick={toggleRecording}
              disabled={disabled}
              className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                isRecording
                  ? 'text-red-400 hover:text-red-300 animate-pulse'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title={isRecording ? 'Stop recording' : 'Voice input'}
            >
              {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          </div>

          {/* Send Button - circular purple with arrow up */}
          <button
            onClick={handleSend}
            disabled={(!inputValue.trim() && !imagePreview) || disabled}
            className="shrink-0 w-12 h-12 rounded-full bg-[#9333ea] hover:bg-[#a855f7] text-white
                     flex items-center justify-center font-medium hover:opacity-90 transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#9333ea]/30"
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
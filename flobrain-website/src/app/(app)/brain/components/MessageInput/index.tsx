"use client";

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Mic, MicOff, Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';

interface ChatInputProps {
  onSendMessage: (text: string, image?: string) => void;
  disabled?: boolean;
  initialText?: string;
}

export default function ChatInput({ onSendMessage, disabled = false, initialText }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Apply initial text when provided (e.g., from home Ask Anything input)
  useEffect(() => {
    if (typeof initialText === 'string') {
      setInputValue(initialText);
    }
  }, [initialText]);

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
    <div className="border-t border-white/10 bg-[#1a0d2e]/50 backdrop-blur-sm">
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

        <div className="flex gap-3 items-stretch">
          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              disabled={disabled}
              rows={1}
              className="w-full h-[48px] bg-[#2d1b4e]/80 text-white px-4 py-3 rounded-xl 
                       border border-white/10 focus:border-[#7c5dbd] focus:outline-none
                       resize-none
                       placeholder:text-white/40 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200"
            />
          </div>

          {/* Image Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="bg-[#2d1b4e]/80 text-white h-[48px] w-[48px] flex items-center justify-center rounded-xl 
                     border border-white/10 hover:border-[#7c5dbd] hover:bg-[#3d2b5f]
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200 flex-shrink-0"
            title="Upload image"
          >
            <ImageIcon size={20} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* Voice Input Button */}
          <button
            onClick={toggleRecording}
            disabled={disabled}
            className={`h-[48px] w-[48px] flex items-center justify-center rounded-xl border transition-all duration-200 flex-shrink-0
                     disabled:opacity-50 disabled:cursor-not-allowed
                     ${isRecording 
                       ? 'bg-red-500 hover:bg-red-600 border-red-400 animate-pulse' 
                       : 'bg-[#2d1b4e]/80 hover:bg-[#3d2b5f] border-white/10 hover:border-[#7c5dbd]'
                     }`}
            title={isRecording ? "Stop recording" : "Start voice input"}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          
          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={(!inputValue.trim() && !imagePreview) || disabled}
            className="bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white h-[48px] w-[48px] 
                     flex items-center justify-center rounded-xl font-medium hover:opacity-90 transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0
                     shadow-lg shadow-[#8B5CF6]/20 hover:shadow-[#8B5CF6]/40"
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
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
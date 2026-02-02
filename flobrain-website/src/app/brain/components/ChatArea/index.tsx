"use client";

import type { Message } from '@/types/chat';
import { useEffect, useRef } from 'react';
import Logo from '@/assets/flolabs-logo.svg';
import Image from 'next/image'; // Recommended for Next.js

interface ChatAreaProps {
  messages: Message[];
}

export default function ChatArea({ messages }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-16 h-16 mb-4">
              <svg width="64" height="64" viewBox="0 0 32 32" fill="none">
                <path d="M16 4L8 8V14C8 19.5 11.5 24.5 16 26C20.5 24.5 24 19.5 24 14V8L16 4Z" fill="url(#gradient)" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 14L15 17L20 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="gradient" x1="8" y1="4" x2="24" y2="26" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8B5CF6"/>
                    <stop offset="1" stopColor="#6366F1"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white/90 mb-2">Start a conversation</h2>
            <p className="text-white/60">Type a message below to begin chatting with FLOBRAIN AI</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'assistant' && (
                  <div className="w-10 h-10 flex-shrink-0">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      {/* Brain/Neural Network Logo */}
                      <circle cx="20" cy="20" r="18" fill="url(#brainGradient)" opacity="0.2"/>
                      <circle cx="20" cy="12" r="3" fill="url(#brainGradient)"/>
                      <circle cx="12" cy="20" r="3" fill="url(#brainGradient)"/>
                      <circle cx="28" cy="20" r="3" fill="url(#brainGradient)"/>
                      <circle cx="16" cy="28" r="3" fill="url(#brainGradient)"/>
                      <circle cx="24" cy="28" r="3" fill="url(#brainGradient)"/>
                      
                      {/* Connections */}
                      <line x1="20" y1="15" x2="15" y2="18" stroke="url(#brainGradient)" strokeWidth="1.5"/>
                      <line x1="20" y1="15" x2="25" y2="18" stroke="url(#brainGradient)" strokeWidth="1.5"/>
                      <line x1="12" y1="23" x2="16" y2="26" stroke="url(#brainGradient)" strokeWidth="1.5"/>
                      <line x1="28" y1="23" x2="24" y2="26" stroke="url(#brainGradient)" strokeWidth="1.5"/>
                      <line x1="15" y1="20" x2="16" y2="25" stroke="url(#brainGradient)" strokeWidth="1.5"/>
                      <line x1="25" y1="20" x2="24" y2="25" stroke="url(#brainGradient)" strokeWidth="1.5"/>
                      
                      <defs>
                        <linearGradient id="brainGradient" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#8B5CF6"/>
                          <stop offset="1" stopColor="#6366F1"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl px-5 py-4 ${
                    message.type === 'user'
                      ? 'bg-[#7c5dbd]/30 text-white/90'
                      : 'bg-[#3d2b5f]/40 text-white/80'
                  }`}
                >
                  {message.image && (
                    <div className="mb-3">
                      <img
                        src={message.image}
                        alt="User upload"
                        className="max-w-full h-auto rounded-lg border border-white/10"
                      />
                    </div>
                  )}
                  {message.text && (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-white">{message.text}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  );
}
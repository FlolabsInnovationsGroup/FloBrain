import { Send, Mic, Image as ImageIcon, X } from 'lucide-react';
import { RefObject, useState, useRef } from 'react';

interface MessageInputProps {
  inputRef: RefObject<HTMLInputElement>;
  value: string;
  onChange: (value: string) => void;
  onSend: (text?: string, image?: string) => void;
}

export default function MessageInput({ inputRef, value, onChange, onSend }: MessageInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (value.trim() || uploadedImage) {
      onSend(value, uploadedImage || undefined);
      setUploadedImage(null);
    }
  };

  const handleVoiceInput = () => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
      return;
    }

    if (isRecording && recognition) {
      // Stop recording
      recognition.stop();
      setIsRecording(false);
      return;
    }

    // Start recording
    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';

    recognitionInstance.onstart = () => {
      setIsRecording(true);
    };

    recognitionInstance.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        onChange(value + finalTranscript);
      }
    };

    recognitionInstance.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone access in your browser settings.');
      }
    };

    recognitionInstance.onend = () => {
      setIsRecording(false);
    };

    recognitionInstance.start();
    setRecognition(recognitionInstance);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="px-6 py-4 border-t border-white/5 bg-[#2a1a4a]/20 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto">
        {uploadedImage && (
          <div className="mb-3 relative inline-block">
            <img
              src={uploadedImage}
              alt="Upload preview"
              className="h-20 rounded-lg border border-white/10"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
            >
              <X size={14} className="text-white" />
            </button>
          </div>
        )}
        <div className="relative flex items-center bg-[#3d2b5f]/40 rounded-xl border border-white/10 focus-within:border-purple-400/50 transition-colors">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-transparent px-5 py-3.5 text-sm text-white placeholder:text-white/40 outline-none"
          />
          <div className="flex items-center gap-1 pr-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Upload image"
            >
              <ImageIcon size={18} className="text-white/60" />
            </button>
            <button
              onClick={handleVoiceInput}
              className={`p-2 rounded-lg transition-colors ${
                isRecording
                  ? 'bg-red-500 animate-pulse'
                  : 'hover:bg-white/10'
              }`}
              title={isRecording ? 'Stop recording' : 'Start voice input'}
            >
              <Mic size={18} className={isRecording ? 'text-white' : 'text-white/60'} />
            </button>
            <button
              onClick={handleSend}
              className="p-2.5 bg-purple-500/80 hover:bg-purple-500 rounded-lg transition-colors ml-1"
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
        </div>
        {isRecording && (
          <div className="mt-2 text-xs text-white/60 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Recording... Click microphone again to stop
          </div>
        )}
      </div>
    </div>
  );
}
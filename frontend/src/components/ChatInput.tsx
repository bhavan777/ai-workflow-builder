import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  defaultValue?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = 'Type your message...',
  defaultValue,
}) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const prevDefaultValueRef = useRef<string | undefined>(undefined);

  // Pre-fill with example when defaultValue changes
  useEffect(() => {
    if (defaultValue && defaultValue !== prevDefaultValueRef.current) {
      setInput(defaultValue);
      prevDefaultValueRef.current = defaultValue;
      // Select the text so user can easily modify
      if (inputRef.current) {
        setTimeout(() => {
          inputRef.current?.select();
        }, 100);
      }
    }
  }, [defaultValue]);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      prevDefaultValueRef.current = undefined; // Reset so next example can be filled
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-1.5 focus-within:border-blue-400 dark:focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-gray-700 transition-all duration-200">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 text-sm py-1"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700 text-white rounded-lg flex items-center justify-center transition-all duration-200"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};

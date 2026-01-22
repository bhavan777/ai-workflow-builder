import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User } from 'lucide-react';
import type { Message, WorkflowOption } from '../types';

interface ChatMessageProps {
  message: Message;
  onOptionSelect?: (option: WorkflowOption) => void;
  isLatest?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onOptionSelect,
  isLatest = false,
}) => {
  const isAI = message.type === 'ai';

  return (
    <div className={`flex gap-2 ${isAI ? 'justify-start' : 'justify-end'}`}>
      {isAI && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`max-w-[85%] ${isAI ? '' : ''}`}>
        <div
          className={`rounded-xl px-3 py-2 transition-colors duration-300 ${
            isAI
              ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm'
              : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-tr-sm'
          }`}
        >
          <div className={`text-sm ${isAI ? 'markdown-content' : ''}`}>
            {isAI ? (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            ) : (
              <p>{message.content}</p>
            )}
          </div>
        </div>

        {/* Options buttons - compact style */}
        {isAI && isLatest && message.options && message.options.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {message.options.map((option) => (
              <button
                key={option.id}
                onClick={() => onOptionSelect?.(option)}
                className="w-full text-left px-3 py-2 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 rounded-lg transition-colors duration-200 group"
              >
                <div className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 text-sm">
                  {option.label}
                </div>
                {option.description && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {option.description}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {!isAI && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 dark:from-gray-500 dark:to-gray-700 flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};

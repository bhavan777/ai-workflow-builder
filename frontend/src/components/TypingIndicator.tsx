import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex gap-2 justify-start">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl rounded-tl-sm px-3 py-2">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full typing-dot" />
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full typing-dot" />
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full typing-dot" />
        </div>
      </div>
    </div>
  );
};

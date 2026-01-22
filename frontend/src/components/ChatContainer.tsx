import React, { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { MessageSquare, Loader2, Rocket } from 'lucide-react';
import type { Message, WorkflowOption, WorkflowState } from '../types';

interface ChatContainerProps {
  messages: Message[];
  isTyping: boolean;
  onSendMessage: (message: string) => void;
  isConnected: boolean;
  workflowState?: WorkflowState | null;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  isTyping,
  onSendMessage,
  isConnected,
  workflowState,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleOptionSelect = (option: WorkflowOption) => {
    onSendMessage(option.id);
  };

  const lastAIMessage = [...messages].reverse().find((m) => m.type === 'ai');
  const lastMessage = messages[messages.length - 1];
  const showOptionsForLast = lastMessage?.type === 'ai' && !isTyping;

  // Check if workflow is complete (all nodes configured)
  const isWorkflowComplete = workflowState?.overallStatus === 'complete';

  // Get example or placeholder from last AI message
  const inputExample = lastAIMessage?.example || null;
  const inputPlaceholder = lastAIMessage?.placeholder || (
    !isConnected
      ? 'Connecting...'
      : isTyping
      ? 'AI is typing...'
      : lastAIMessage?.inputType === 'options'
      ? 'Select an option above or type...'
      : 'Type your response...'
  );

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-indigo-600 transition-colors duration-300">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-white" />
          <h2 className="font-semibold text-white">AI Assistant</h2>
        </div>
        <p className="text-xs text-blue-100 mt-0.5">Configure your workflow through conversation</p>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {messages.length === 0 && !isTyping && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
            {!isConnected ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p className="text-sm">Connecting...</p>
              </>
            ) : (
              <>
                <MessageSquare className="w-8 h-8 mb-2" />
                <p className="text-sm">Starting conversation...</p>
              </>
            )}
          </div>
        )}

        {messages.map((message, index) => (
          <ChatMessage
            key={message.id}
            message={message}
            onOptionSelect={handleOptionSelect}
            isLatest={showOptionsForLast && index === messages.length - 1}
          />
        ))}

        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area - Show CTA when complete, otherwise show input */}
      <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
        {isWorkflowComplete ? (
          <button
            onClick={() => onSendMessage('activate')}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Rocket className="w-5 h-5" />
            Activate Workflow
          </button>
        ) : (
          <ChatInput
            onSend={onSendMessage}
            disabled={!isConnected || isTyping}
            placeholder={inputPlaceholder}
            defaultValue={inputExample || undefined}
          />
        )}
      </div>
    </div>
  );
};

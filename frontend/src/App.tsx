import { Header, ChatContainer, WorkflowVisualization } from './components';
import { useSocket } from './hooks/useSocket';
import { useTheme } from './hooks/useTheme';

function App() {
  const {
    isConnected,
    messages,
    isTyping,
    workflowState,
    sendMessage,
    resetWorkflow,
  } = useSocket();

  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden transition-colors duration-300">
      {/* Header - Full width */}
      <Header 
        isConnected={isConnected} 
        onReset={resetWorkflow}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      {/* Main content - Full width fluid container */}
      <main className="flex-1 flex overflow-hidden">
        {/* Chat Panel - Left ~25% */}
        <div className="w-[320px] xl:w-[380px] flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col transition-colors duration-300">
          <ChatContainer
            messages={messages}
            isTyping={isTyping}
            onSendMessage={sendMessage}
            isConnected={isConnected}
            workflowState={workflowState}
          />
        </div>

        {/* Workflow Visualization - Remaining ~75% */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <WorkflowVisualization workflowState={workflowState} />
        </div>
      </main>
    </div>
  );
}

export default App;

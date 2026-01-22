// Message types
export interface WorkflowOption {
  id: string;
  label: string;
  description: string;
}

export interface Message {
  id: string;
  type: 'ai' | 'user';
  content: string;
  options?: WorkflowOption[] | null;
  inputType?: 'text' | 'options' | null;
  timestamp: string;
  example?: string | null; // Pre-fill example for input
  placeholder?: string | null; // Contextual placeholder
}

// Field configuration
export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'multiselect' | 'boolean' | 'oauth' | 'file';
  placeholder?: string;
  required: boolean;
  description: string;
  options?: string[];
  value: string | boolean | null;
  status: 'collected' | 'in_progress' | 'todo';
}

// Node configuration
export interface NodeConfig {
  type: string;
  name: string;
  icon: string;
  status: 'complete' | 'in_progress' | 'partial' | 'todo';
  fields: FieldConfig[];
}

// Workflow template info
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
}

// Complete workflow state
export interface WorkflowState {
  selectedWorkflow: string | null;
  template: WorkflowTemplate | null;
  nodes: {
    source: NodeConfig;
    transform: NodeConfig;
    destination: NodeConfig;
  } | null;
  overallStatus: 'selecting' | 'configuring' | 'complete';
}

export interface TypingState {
  isTyping: boolean;
}

// Socket events
export interface ServerToClientEvents {
  ai_message: (message: Message) => void;
  ai_typing: (state: TypingState) => void;
  workflow_state: (state: WorkflowState) => void;
  error: (error: { message: string }) => void;
}

export interface ClientToServerEvents {
  user_message: (data: { content: string }) => void;
  get_workflow_state: () => void;
  reset_workflow: () => void;
}

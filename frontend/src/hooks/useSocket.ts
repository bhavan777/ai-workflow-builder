import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { 
  Message, 
  ServerToClientEvents, 
  ClientToServerEvents, 
  WorkflowState 
} from '../types';

// Use the same hostname as the browser but with backend port
const getSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
  const hostname = window.location.hostname;
  const backendPort = import.meta.env.VITE_BACKEND_PORT || '3001';
  return `${protocol}//${hostname}:${backendPort}`;
};

const SOCKET_URL = getSocketUrl();

export function useSocket() {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [workflowState, setWorkflowState] = useState<WorkflowState | null>(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socket.on('ai_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('ai_typing', ({ isTyping }) => {
      setIsTyping(isTyping);
    });

    socket.on('workflow_state', (state: WorkflowState) => {
      setWorkflowState(state);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = useCallback((content: string) => {
    if (socketRef.current && content.trim()) {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      socketRef.current.emit('user_message', { content: content.trim() });
    }
  }, []);

  const resetWorkflow = useCallback(() => {
    if (socketRef.current) {
      setMessages([]);
      setWorkflowState(null);
      socketRef.current.emit('reset_workflow');
    }
  }, []);

  const getWorkflowState = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('get_workflow_state');
    }
  }, []);

  return {
    isConnected,
    messages,
    isTyping,
    workflowState,
    sendMessage,
    resetWorkflow,
    getWorkflowState,
  };
}

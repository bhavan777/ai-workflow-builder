import React from 'react';
import { ArrowRight, Database, Cog, Send, Check } from 'lucide-react';
import type { WorkflowState, NodeConfig } from '../types';

interface WorkflowVisualizationProps {
  workflowState: WorkflowState | null;
}

// Card-shaped neon glow with 4 colors rotating clockwise
const NeonGlow: React.FC = () => (
  <div className="neon-glow-wrapper" />
);

// Circular progress indicator with arc fill
const ProgressCircle: React.FC<{ 
  progress: number; // 0-100 
  isComplete: boolean;
  isTodo: boolean;
}> = ({ progress, isComplete, isTodo }) => {
  const size = 36;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  if (isComplete) {
    return (
      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
        <Check className="w-5 h-5 text-white" />
      </div>
    );
  }

  return (
    <svg width={size} height={size} className="progress-ring">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        className="progress-ring-bg"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={isTodo ? 'rgba(156, 163, 175, 0.5)' : 'white'}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="progress-ring-fill"
      />
    </svg>
  );
};

const NodeCard: React.FC<{ 
  config: NodeConfig;
  label: string;
}> = ({ config, label }) => {
  const isInProgress = config.status === 'in_progress' || config.status === 'partial';
  const isComplete = config.status === 'complete';
  const isTodo = config.status === 'todo';

  // Calculate progress based on collected fields
  const totalFields = config.fields.length;
  const collectedFields = config.fields.filter(f => f.status === 'collected').length;
  const progress = totalFields > 0 ? (collectedFields / totalFields) * 100 : 0;

  return (
    <div className={`relative transition-all duration-500 ${isTodo ? 'scale-95' : 'scale-100'}`}>
      {/* Neon ambient glow for in-progress */}
      {isInProgress && <NeonGlow />}
      
      <div className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
        isComplete 
          ? 'ring-2 ring-green-400 dark:ring-green-500 shadow-lg shadow-green-500/20' 
          : isInProgress 
            ? 'shadow-xl' 
            : 'ring-1 ring-gray-300 dark:ring-gray-600 shadow-sm'
      }`}>
        {/* Header */}
        <div className={`px-5 py-4 transition-colors duration-300 ${
          isComplete 
            ? 'bg-green-500' 
            : isInProgress 
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500' 
              : 'bg-gray-200 dark:bg-gray-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{config.icon}</span>
              <div>
                <div className={`text-xs font-medium uppercase tracking-wide ${
                  isTodo ? 'text-gray-500 dark:text-gray-400' : 'text-white/70'
                }`}>{label}</div>
                <div className={`font-bold text-lg ${
                  isTodo ? 'text-gray-700 dark:text-gray-200' : 'text-white'
                }`}>{config.name}</div>
              </div>
            </div>
            {/* Circular progress indicator */}
            <ProgressCircle progress={progress} isComplete={isComplete} isTodo={isTodo} />
          </div>
        </div>

        {/* Body */}
        <div className={`p-4 transition-colors duration-300 ${
          isComplete 
            ? 'bg-green-50 dark:bg-green-900/20' 
            : isInProgress 
              ? 'bg-white dark:bg-gray-800' 
              : 'bg-white dark:bg-gray-800'
        }`}>
          {/* Fields list */}
          <div className="space-y-2">
            {config.fields.map((field) => (
              <div 
                key={field.key}
                className={`flex items-center gap-3 transition-all duration-200 ${
                  field.status === 'in_progress' ? 'pl-1' : ''
                }`}
              >
                {/* Status dot */}
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all duration-300 ${
                  field.status === 'collected'
                    ? 'bg-green-400 dark:bg-green-500'
                    : field.status === 'in_progress'
                      ? 'bg-blue-500 dark:bg-blue-400 ring-4 ring-blue-500/20'
                      : 'bg-gray-300 dark:bg-gray-600'
                }`} />
                
                {/* Field name and value */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm truncate ${
                    field.status === 'collected' 
                      ? 'text-gray-700 dark:text-gray-300' 
                      : field.status === 'in_progress'
                        ? 'text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {field.label}
                  </div>
                  {field.status === 'collected' && field.value && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {typeof field.value === 'boolean' 
                        ? (field.value ? '✓' : '✗')
                        : field.type === 'password' 
                          ? '••••••'
                          : String(field.value).substring(0, 25) + (String(field.value).length > 25 ? '...' : '')
                      }
                    </div>
                  )}
                </div>

                {/* Subtle completion indicator */}
                {field.status === 'collected' && (
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ConnectionArrow: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <div className="flex items-center justify-center px-3 self-center">
    <div className={`flex items-center transition-colors duration-300 ${
      isActive ? 'text-blue-400' : 'text-gray-300 dark:text-gray-600'
    }`}>
      <div className={`w-8 h-0.5 transition-colors duration-300 ${
        isActive ? 'bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'
      }`} />
      <ArrowRight className="w-6 h-6 -ml-1" />
    </div>
  </div>
);

export const WorkflowVisualization: React.FC<WorkflowVisualizationProps> = ({ 
  workflowState 
}) => {
  if (!workflowState || !workflowState.nodes) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="flex items-center gap-8 mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Database className="w-10 h-10 text-gray-300 dark:text-gray-600" />
          </div>
          <ArrowRight className="w-6 h-6 text-gray-300 dark:text-gray-600" />
          <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Cog className="w-10 h-10 text-gray-300 dark:text-gray-600" />
          </div>
          <ArrowRight className="w-6 h-6 text-gray-300 dark:text-gray-600" />
          <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Send className="w-10 h-10 text-gray-300 dark:text-gray-600" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">Select a Workflow</h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center max-w-md">
          Choose a workflow template from the chat to begin configuration.
        </p>
      </div>
    );
  }

  const { nodes, template, overallStatus } = workflowState;

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Workflow Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{template?.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{template?.description}</p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${
            overallStatus === 'complete' 
              ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400' 
              : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'
          }`}>
            {overallStatus === 'complete' ? '✅ Ready to activate' : '⏳ Configuring...'}
          </div>
        </div>
      </div>

      {/* Workflow Nodes */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-center gap-4 h-full max-w-6xl mx-auto">
          <div className="flex-1 max-w-sm">
            <NodeCard config={nodes.source} label="SOURCE" />
          </div>

          <ConnectionArrow isActive={nodes.source.status === 'complete' || nodes.transform.status !== 'todo'} />

          <div className="flex-1 max-w-sm">
            <NodeCard config={nodes.transform} label="TRANSFORM" />
          </div>

          <ConnectionArrow isActive={nodes.transform.status === 'complete' || nodes.destination.status !== 'todo'} />

          <div className="flex-1 max-w-sm">
            <NodeCard config={nodes.destination} label="DESTINATION" />
          </div>
        </div>
      </div>
    </div>
  );
};

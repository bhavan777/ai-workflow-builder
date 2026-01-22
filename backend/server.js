import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors({ origin: '*' }));
app.use(express.json());

// ============================================================================
// WORKFLOW TEMPLATES - Realistic predefined workflows
// ============================================================================

const WORKFLOW_TEMPLATES = {
  'shopify-bigquery': {
    id: 'shopify-bigquery',
    name: 'Connect Shopify to BigQuery',
    description: 'Sync your Shopify orders, products, and customers to Google BigQuery for analytics',
    source: {
      type: 'shopify',
      name: 'Shopify',
      icon: '🛒',
      fields: {
        store_url: { label: 'Store URL', type: 'text', placeholder: 'your-store.myshopify.com', required: true, description: 'Your Shopify store URL (e.g., mystore.myshopify.com)' },
        api_key: { label: 'Admin API Access Token', type: 'password', required: true, description: 'Found in Shopify Admin > Apps > Develop apps' },
        data_types: { label: 'Data to Sync', type: 'multiselect', options: ['Orders', 'Products', 'Customers', 'Inventory'], required: true, description: 'Select which data you want to sync' },
        sync_frequency: { label: 'Sync Frequency', type: 'select', options: ['Real-time', 'Every 15 minutes', 'Hourly', 'Daily'], required: true, description: 'How often should we sync your data?' }
      }
    },
    transform: {
      type: 'data_mapping',
      name: 'Data Mapping',
      icon: '⚙️',
      fields: {
        date_format: { label: 'Date Format', type: 'select', options: ['ISO 8601', 'US (MM/DD/YYYY)', 'EU (DD/MM/YYYY)'], required: true, description: 'How should dates be formatted?' },
        currency_handling: { label: 'Currency Handling', type: 'select', options: ['Keep Original', 'Convert to USD', 'Convert to EUR'], required: true, description: 'How to handle currency values' },
        flatten_nested: { label: 'Flatten Nested Data', type: 'boolean', required: true, description: 'Flatten nested JSON objects into separate columns?' }
      }
    },
    destination: {
      type: 'bigquery',
      name: 'Google BigQuery',
      icon: '📊',
      fields: {
        project_id: { label: 'GCP Project ID', type: 'text', placeholder: 'my-gcp-project', required: true, description: 'Your Google Cloud project ID' },
        dataset_name: { label: 'Dataset Name', type: 'text', placeholder: 'shopify_data', required: true, description: 'BigQuery dataset to store the data' },
        service_account: { label: 'Service Account JSON', type: 'file', required: true, description: 'Upload your GCP service account key file' },
        write_mode: { label: 'Write Mode', type: 'select', options: ['Append', 'Overwrite', 'Merge (Upsert)'], required: true, description: 'How to write data to tables' }
      }
    }
  },

  'salesforce-mailchimp': {
    id: 'salesforce-mailchimp',
    name: 'Sync Salesforce to Mailchimp',
    description: 'Keep your Mailchimp audience in sync with Salesforce contacts',
    source: {
      type: 'salesforce',
      name: 'Salesforce',
      icon: '☁️',
      fields: {
        instance_url: { label: 'Salesforce Instance URL', type: 'text', placeholder: 'https://yourcompany.salesforce.com', required: true, description: 'Your Salesforce organization URL' },
        client_id: { label: 'Connected App Client ID', type: 'text', required: true, description: 'OAuth Client ID from your Connected App' },
        client_secret: { label: 'Client Secret', type: 'password', required: true, description: 'OAuth Client Secret' },
        object_type: { label: 'Object to Sync', type: 'select', options: ['Contacts', 'Leads', 'Both'], required: true, description: 'Which Salesforce objects to sync' }
      }
    },
    transform: {
      type: 'field_mapping',
      name: 'Field Mapping',
      icon: '🔄',
      fields: {
        email_field: { label: 'Email Field', type: 'select', options: ['Email', 'PersonEmail', 'npe01__WorkEmail__c'], required: true, description: 'Which field contains the email address?' },
        name_handling: { label: 'Name Handling', type: 'select', options: ['Separate First/Last', 'Combined Full Name'], required: true, description: 'How to handle name fields' },
        sync_custom_fields: { label: 'Include Custom Fields', type: 'boolean', required: false, description: 'Sync custom Salesforce fields to Mailchimp?' },
        filter_criteria: { label: 'Filter (Optional)', type: 'text', placeholder: 'e.g., Status = Active', required: false, description: 'SOQL WHERE clause to filter records' }
      }
    },
    destination: {
      type: 'mailchimp',
      name: 'Mailchimp',
      icon: '📧',
      fields: {
        api_key: { label: 'Mailchimp API Key', type: 'password', required: true, description: 'Found in Account > Extras > API keys' },
        audience_id: { label: 'Audience/List ID', type: 'text', required: true, description: 'The ID of your Mailchimp audience' },
        double_optin: { label: 'Require Double Opt-in', type: 'boolean', required: true, description: 'Send confirmation email to new subscribers?' },
        update_existing: { label: 'Update Existing', type: 'boolean', required: true, description: 'Update info for existing subscribers?' }
      }
    }
  },

  'stripe-sheets': {
    id: 'stripe-sheets',
    name: 'Stripe to Google Sheets',
    description: 'Automatically log Stripe transactions to Google Sheets',
    source: {
      type: 'stripe',
      name: 'Stripe',
      icon: '💳',
      fields: {
        api_key: { label: 'Stripe Secret Key', type: 'password', required: true, description: 'Your Stripe secret key (sk_live_... or sk_test_...)' },
        event_types: { label: 'Events to Track', type: 'multiselect', options: ['Successful Payments', 'Failed Payments', 'Refunds', 'Subscriptions'], required: true, description: 'Which Stripe events to capture' },
        include_test: { label: 'Include Test Mode', type: 'boolean', required: true, description: 'Include test mode transactions?' },
        lookback_period: { label: 'Initial Sync Period', type: 'select', options: ['Last 7 days', 'Last 30 days', 'Last 90 days'], required: true, description: 'How far back to sync on first run' }
      }
    },
    transform: {
      type: 'formatting',
      name: 'Data Formatting',
      icon: '📝',
      fields: {
        amount_format: { label: 'Amount Format', type: 'select', options: ['Cents (raw)', 'Dollars ($X.XX)', 'No symbol (X.XX)'], required: true, description: 'How to format payment amounts' },
        timezone: { label: 'Timezone', type: 'select', options: ['UTC', 'US/Eastern', 'US/Pacific', 'Europe/London'], required: true, description: 'Timezone for dates and times' },
        include_metadata: { label: 'Include Metadata', type: 'boolean', required: false, description: 'Include custom Stripe metadata columns?' }
      }
    },
    destination: {
      type: 'google_sheets',
      name: 'Google Sheets',
      icon: '📑',
      fields: {
        spreadsheet_url: { label: 'Spreadsheet URL', type: 'text', placeholder: 'https://docs.google.com/spreadsheets/d/...', required: true, description: 'URL of your Google Sheet' },
        sheet_name: { label: 'Sheet Tab Name', type: 'text', placeholder: 'Payments', required: true, description: 'Name of the tab to write to' },
        google_auth: { label: 'Google Account', type: 'oauth', required: true, description: 'Connect your Google account' },
        write_mode: { label: 'Write Mode', type: 'select', options: ['Append new rows', 'Replace all data'], required: true, description: 'How to add new data' }
      }
    }
  },

  'hubspot-slack': {
    id: 'hubspot-slack',
    name: 'HubSpot Deals to Slack',
    description: 'Get Slack notifications for HubSpot deal updates',
    source: {
      type: 'hubspot',
      name: 'HubSpot',
      icon: '🟠',
      fields: {
        access_token: { label: 'Private App Token', type: 'password', required: true, description: 'HubSpot Private App access token' },
        trigger_events: { label: 'Trigger On', type: 'multiselect', options: ['Deal Created', 'Stage Changed', 'Deal Won', 'Deal Lost'], required: true, description: 'Which events trigger notifications' },
        pipeline: { label: 'Pipeline', type: 'select', options: ['All Pipelines', 'Sales Pipeline', 'Enterprise Deals'], required: false, description: 'Filter by specific pipeline' },
        min_amount: { label: 'Minimum Deal Amount', type: 'text', placeholder: '1000', required: false, description: 'Only notify for deals above this amount' }
      }
    },
    transform: {
      type: 'message_format',
      name: 'Message Format',
      icon: '✏️',
      fields: {
        message_style: { label: 'Message Style', type: 'select', options: ['Simple Text', 'Rich Card', 'Detailed'], required: true, description: 'How should notifications look?' },
        include_link: { label: 'Include Deal Link', type: 'boolean', required: true, description: 'Add a link to the HubSpot deal?' },
        mention_owner: { label: 'Mention Deal Owner', type: 'boolean', required: true, description: '@mention the deal owner in Slack?' }
      }
    },
    destination: {
      type: 'slack',
      name: 'Slack',
      icon: '💬',
      fields: {
        workspace: { label: 'Slack Workspace', type: 'oauth', required: true, description: 'Connect your Slack workspace' },
        channel: { label: 'Channel', type: 'text', placeholder: '#sales-alerts', required: true, description: 'Channel for notifications' },
        bot_name: { label: 'Bot Name', type: 'text', placeholder: 'HubSpot Bot', required: false, description: 'Custom display name for the bot' }
      }
    }
  }
};

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

const workflowSessions = new Map();

function createSession(socketId) {
  return {
    id: socketId,
    state: 'SELECT_WORKFLOW',
    selectedWorkflow: null,
    workflowConfig: {
      source: { values: {}, fieldOrder: [], currentFieldIndex: 0 },
      transform: { values: {}, fieldOrder: [], currentFieldIndex: 0 },
      destination: { values: {}, fieldOrder: [], currentFieldIndex: 0 }
    },
    activeNode: null, // 'source' | 'transform' | 'destination'
    activeFieldKey: null
  };
}

function getFieldStatus(session, node, fieldKey) {
  if (!session.selectedWorkflow) return 'todo';
  const nodeConfig = session.workflowConfig[node];
  if (nodeConfig.values[fieldKey] !== undefined && nodeConfig.values[fieldKey] !== '') {
    return 'collected';
  }
  if (session.activeNode === node && session.activeFieldKey === fieldKey) {
    return 'in_progress';
  }
  return 'todo';
}

function getNodeStatus(session, node) {
  if (!session.selectedWorkflow) return 'todo';
  const template = WORKFLOW_TEMPLATES[session.selectedWorkflow];
  const nodeTemplate = template[node];
  const nodeConfig = session.workflowConfig[node];
  
  const nodes = ['source', 'transform', 'destination'];
  const nodeIndex = nodes.indexOf(node);
  const activeNodeIndex = nodes.indexOf(session.activeNode);
  
  const requiredFields = Object.entries(nodeTemplate.fields)
    .filter(([_, field]) => field.required)
    .map(([key, _]) => key);
  
  const collectedRequired = requiredFields.filter(key => 
    nodeConfig.values[key] !== undefined && nodeConfig.values[key] !== ''
  );
  
  const allRequiredCollected = collectedRequired.length === requiredFields.length;
  
  // Node is complete ONLY if:
  // 1. All required fields are collected
  // 2. We have moved past this node (it's not the active node)
  // 3. OR we're in review/complete state
  if (allRequiredCollected && (nodeIndex < activeNodeIndex || session.state === 'REVIEW' || session.state === 'COMPLETE')) {
    return 'complete';
  }
  
  // Node is in progress if it's the active node
  if (session.activeNode === node) {
    return 'in_progress';
  }
  
  // Node has some fields collected but not complete
  if (collectedRequired.length > 0) {
    return 'partial';
  }
  
  return 'todo';
}

function buildWorkflowState(session) {
  if (!session.selectedWorkflow) {
    return {
      selectedWorkflow: null,
      template: null,
      nodes: null,
      overallStatus: 'selecting'
    };
  }
  
  const template = WORKFLOW_TEMPLATES[session.selectedWorkflow];
  
  const buildNodeState = (nodeKey) => {
    const nodeTemplate = template[nodeKey];
    const nodeConfig = session.workflowConfig[nodeKey];
    
    const fields = Object.entries(nodeTemplate.fields).map(([key, field]) => ({
      key,
      ...field,
      value: nodeConfig.values[key] || null,
      status: getFieldStatus(session, nodeKey, key)
    }));
    
    return {
      type: nodeTemplate.type,
      name: nodeTemplate.name,
      icon: nodeTemplate.icon,
      status: getNodeStatus(session, nodeKey),
      fields
    };
  };
  
  const nodes = {
    source: buildNodeState('source'),
    transform: buildNodeState('transform'),
    destination: buildNodeState('destination')
  };
  
  const allComplete = ['source', 'transform', 'destination'].every(
    n => nodes[n].status === 'complete'
  );
  
  return {
    selectedWorkflow: session.selectedWorkflow,
    template: {
      id: template.id,
      name: template.name,
      description: template.description
    },
    nodes,
    overallStatus: allComplete ? 'complete' : 'configuring'
  };
}

// ============================================================================
// CONVERSATION ENGINE
// ============================================================================

function generateResponse(session, userMessage) {
  let response = { message: '', options: null, inputType: 'text', example: null, placeholder: null };
  
  switch (session.state) {
    case 'SELECT_WORKFLOW':
      if (!userMessage) {
        // Initial greeting
        response.message = `👋 **Welcome to the AI Workflow Builder!**

I'll help you set up a data integration workflow. Choose from one of our pre-built templates:`;
        response.options = Object.values(WORKFLOW_TEMPLATES).map(t => ({
          id: t.id,
          label: t.name,
          description: t.description
        }));
        response.inputType = 'options';
      } else {
        const workflowId = userMessage.toLowerCase().replace(/\s+/g, '-');
        const template = WORKFLOW_TEMPLATES[workflowId] || WORKFLOW_TEMPLATES[userMessage];
        
        if (template) {
          session.selectedWorkflow = template.id;
          session.state = 'CONFIGURING';
          session.activeNode = 'source';
          
          // Set up field order for each node
          ['source', 'transform', 'destination'].forEach(node => {
            session.workflowConfig[node].fieldOrder = Object.keys(template[node].fields);
            session.workflowConfig[node].currentFieldIndex = 0;
          });
          
          // Start with first source field
          const firstField = session.workflowConfig.source.fieldOrder[0];
          session.activeFieldKey = firstField;
          
          const fieldDef = template.source.fields[firstField];
          response.message = `Great choice! Let's set up **${template.name}**.

${template.description}

---

**Step 1: Configure ${template.source.name} ${template.source.icon}**

${fieldDef.label}: ${fieldDef.description}`;
          
          if (fieldDef.type === 'select' || fieldDef.type === 'multiselect') {
            response.options = fieldDef.options.map(opt => ({
              id: opt,
              label: opt,
              description: ''
            }));
            response.inputType = 'options';
          } else if (fieldDef.type === 'boolean') {
            response.options = [
              { id: 'yes', label: 'Yes', description: '' },
              { id: 'no', label: 'No', description: '' }
            ];
            response.inputType = 'options';
          } else {
            response.inputType = 'text';
            // For URL/text fields with placeholders, pre-fill the example
            if (fieldDef.placeholder) {
              if (fieldDef.type === 'text' && 
                  (fieldDef.placeholder.includes('http') || 
                   fieldDef.placeholder.includes('.com') || 
                   fieldDef.placeholder.includes('@') ||
                   fieldDef.placeholder.includes('/'))) {
                // Pre-fill URL-like examples
                response.example = fieldDef.placeholder;
              }
              response.placeholder = `e.g., ${fieldDef.placeholder}`;
            } else {
              response.placeholder = `Enter ${fieldDef.label.toLowerCase()}...`;
            }
          }
        } else {
          response.message = `I didn't recognize that workflow. Please select one:`;
          response.options = Object.values(WORKFLOW_TEMPLATES).map(t => ({
            id: t.id,
            label: t.name,
            description: t.description
          }));
          response.inputType = 'options';
        }
      }
      break;
      
    case 'CONFIGURING':
      const template = WORKFLOW_TEMPLATES[session.selectedWorkflow];
      const nodeConfig = session.workflowConfig[session.activeNode];
      const nodeTemplate = template[session.activeNode];
      
      // Save the current field value
      if (userMessage && session.activeFieldKey) {
        let value = userMessage;
        const fieldDef = nodeTemplate.fields[session.activeFieldKey];
        
        // Handle boolean values
        if (fieldDef.type === 'boolean') {
          value = userMessage.toLowerCase() === 'yes' || userMessage.toLowerCase() === 'true';
        }
        
        nodeConfig.values[session.activeFieldKey] = value;
      }
      
      // Find next field to configure
      const currentIndex = nodeConfig.currentFieldIndex;
      const fieldOrder = nodeConfig.fieldOrder;
      
      if (currentIndex < fieldOrder.length - 1) {
        // Move to next field in current node
        nodeConfig.currentFieldIndex++;
        const nextFieldKey = fieldOrder[nodeConfig.currentFieldIndex];
        session.activeFieldKey = nextFieldKey;
        
        const fieldDef = nodeTemplate.fields[nextFieldKey];
        
        response.message = `✓ Got it!\n\n**${fieldDef.label}**: ${fieldDef.description}`;
        
        if (fieldDef.type === 'select' || fieldDef.type === 'multiselect') {
          response.options = fieldDef.options.map(opt => ({
            id: opt,
            label: opt,
            description: ''
          }));
          response.inputType = 'options';
        } else if (fieldDef.type === 'boolean') {
          response.options = [
            { id: 'yes', label: 'Yes', description: '' },
            { id: 'no', label: 'No', description: '' }
          ];
          response.inputType = 'options';
        } else if (fieldDef.type === 'oauth') {
          response.message += `\n\n_Click to authenticate (simulated)_`;
          response.options = [
            { id: 'connected', label: '🔗 Connect Account', description: 'Authenticate with OAuth' }
          ];
          response.inputType = 'options';
        } else if (fieldDef.type === 'file') {
          response.message += `\n\n_Upload your file (simulated)_`;
          response.options = [
            { id: 'uploaded', label: '📁 Upload File', description: 'Select file to upload' }
          ];
          response.inputType = 'options';
        } else {
          response.inputType = 'text';
          if (fieldDef.placeholder) {
            // Pre-fill URL-like examples
            if (fieldDef.type === 'text' && 
                (fieldDef.placeholder.includes('http') || 
                 fieldDef.placeholder.includes('.com') || 
                 fieldDef.placeholder.includes('@') ||
                 fieldDef.placeholder.includes('/'))) {
              response.example = fieldDef.placeholder;
            }
            response.placeholder = `e.g., ${fieldDef.placeholder}`;
          } else {
            response.placeholder = `Enter ${fieldDef.label.toLowerCase()}...`;
          }
        }
      } else {
        // Current node complete, move to next node
        const nodes = ['source', 'transform', 'destination'];
        const currentNodeIndex = nodes.indexOf(session.activeNode);
        
        if (currentNodeIndex < nodes.length - 1) {
          // Move to next node
          const nextNode = nodes[currentNodeIndex + 1];
          session.activeNode = nextNode;
          const nextNodeTemplate = template[nextNode];
          const nextNodeConfig = session.workflowConfig[nextNode];
          
          const firstFieldKey = nextNodeConfig.fieldOrder[0];
          session.activeFieldKey = firstFieldKey;
          nextNodeConfig.currentFieldIndex = 0;
          
          const fieldDef = nextNodeTemplate.fields[firstFieldKey];
          
          const stepNum = currentNodeIndex + 2;
          response.message = `✅ **${nodeTemplate.name} configured!**

---

**Step ${stepNum}: Configure ${nextNodeTemplate.name} ${nextNodeTemplate.icon}**

${fieldDef.label}: ${fieldDef.description}`;
          
          if (fieldDef.type === 'select' || fieldDef.type === 'multiselect') {
            response.options = fieldDef.options.map(opt => ({
              id: opt,
              label: opt,
              description: ''
            }));
            response.inputType = 'options';
          } else if (fieldDef.type === 'boolean') {
            response.options = [
              { id: 'yes', label: 'Yes', description: '' },
              { id: 'no', label: 'No', description: '' }
            ];
            response.inputType = 'options';
          } else if (fieldDef.type === 'oauth') {
            response.options = [
              { id: 'connected', label: '🔗 Connect Account', description: 'Authenticate with OAuth' }
            ];
            response.inputType = 'options';
          } else if (fieldDef.type === 'file') {
            response.options = [
              { id: 'uploaded', label: '📁 Upload File', description: 'Select file to upload' }
            ];
            response.inputType = 'options';
          } else {
            response.inputType = 'text';
            if (fieldDef.placeholder) {
              if (fieldDef.type === 'text' && 
                  (fieldDef.placeholder.includes('http') || 
                   fieldDef.placeholder.includes('.com') || 
                   fieldDef.placeholder.includes('@') ||
                   fieldDef.placeholder.includes('/'))) {
                response.example = fieldDef.placeholder;
              }
              response.placeholder = `e.g., ${fieldDef.placeholder}`;
            } else {
              response.placeholder = `Enter ${fieldDef.label.toLowerCase()}...`;
            }
          }
        } else {
          // All nodes complete!
          session.state = 'REVIEW';
          response.message = `🎉 **Workflow Configuration Complete!**

Your **${template.name}** workflow is ready!

**Summary:**
- **Source:** ${template.source.name} ✅
- **Transform:** ${template.transform.name} ✅  
- **Destination:** ${template.destination.name} ✅

What would you like to do?`;
          response.options = [
            { id: 'activate', label: '🚀 Activate Workflow', description: 'Start syncing data now' },
            { id: 'test', label: '🧪 Test Connection', description: 'Verify all connections work' },
            { id: 'edit', label: '✏️ Edit Configuration', description: 'Make changes to the setup' },
            { id: 'new', label: '➕ Create Another', description: 'Start a new workflow' }
          ];
          response.inputType = 'options';
        }
      }
      break;
      
    case 'REVIEW':
      const action = userMessage.toLowerCase();
      const tmpl = WORKFLOW_TEMPLATES[session.selectedWorkflow];
      
      if (action === 'activate' || action === '🚀 activate workflow') {
        session.state = 'COMPLETE';
        response.message = `✅ **Workflow Activated!**

Your **${tmpl.name}** is now running.

📊 **Status:** Active
🔄 **Next sync:** In a few moments
📁 **Initial sync:** Processing...

I'll notify you when the first sync completes!`;
        response.options = [
          { id: 'new', label: '➕ Create Another Workflow', description: '' }
        ];
        response.inputType = 'options';
        
      } else if (action === 'test' || action === '🧪 test connection') {
        response.message = `🔄 **Testing connections...**

✅ ${tmpl.source.name}: Connected successfully
✅ ${tmpl.transform.name}: Configured correctly
✅ ${tmpl.destination.name}: Connected successfully

All systems go! Ready to activate.`;
        response.options = [
          { id: 'activate', label: '🚀 Activate Workflow', description: '' },
          { id: 'new', label: '➕ Create Another', description: '' }
        ];
        response.inputType = 'options';
        
      } else if (action === 'new' || action === '➕ create another') {
        // Reset session
        Object.assign(session, createSession(session.id));
        return generateResponse(session, '');
        
      } else {
        response.message = `Please select an option:`;
        response.options = [
          { id: 'activate', label: '🚀 Activate Workflow', description: '' },
          { id: 'test', label: '🧪 Test Connection', description: '' },
          { id: 'new', label: '➕ Create Another', description: '' }
        ];
        response.inputType = 'options';
      }
      break;
      
    case 'COMPLETE':
      if (userMessage.toLowerCase().includes('new') || userMessage.toLowerCase().includes('another')) {
        Object.assign(session, createSession(session.id));
        return generateResponse(session, '');
      }
      response.message = `Your workflow is running! Would you like to create another?`;
      response.options = [
        { id: 'new', label: '➕ Create Another Workflow', description: '' }
      ];
      response.inputType = 'options';
      break;
  }
  
  return response;
}

// ============================================================================
// SOCKET.IO HANDLERS
// ============================================================================

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  const session = createSession(socket.id);
  workflowSessions.set(socket.id, session);
  
  // Send initial state
  emitWorkflowState(socket, session);
  
  // Send initial greeting after short delay
  setTimeout(() => {
    const response = generateResponse(session, '');
    emitAIMessage(socket, session, response);
  }, 500);
  
  socket.on('user_message', (data) => {
    console.log(`Message from ${socket.id}:`, data.content);
    
    const session = workflowSessions.get(socket.id);
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }
    
    socket.emit('ai_typing', { isTyping: true });
    
    setTimeout(() => {
      const response = generateResponse(session, data.content);
      socket.emit('ai_typing', { isTyping: false });
      emitAIMessage(socket, session, response);
      emitWorkflowState(socket, session);
    }, 600 + Math.random() * 400);
  });
  
  socket.on('reset_workflow', () => {
    const newSession = createSession(socket.id);
    workflowSessions.set(socket.id, newSession);
    
    emitWorkflowState(socket, newSession);
    
    setTimeout(() => {
      const response = generateResponse(newSession, '');
      emitAIMessage(socket, newSession, response);
    }, 300);
  });
  
  socket.on('get_workflow_state', () => {
    const session = workflowSessions.get(socket.id);
    if (session) {
      emitWorkflowState(socket, session);
    }
  });
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    workflowSessions.delete(socket.id);
  });
});

function emitAIMessage(socket, session, response) {
  socket.emit('ai_message', {
    id: uuidv4(),
    type: 'ai',
    content: response.message,
    options: response.options,
    inputType: response.inputType,
    example: response.example || null,
    placeholder: response.placeholder || null,
    timestamp: new Date().toISOString()
  });
}

function emitWorkflowState(socket, session) {
  socket.emit('workflow_state', buildWorkflowState(session));
}

// ============================================================================
// REST API
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/templates', (req, res) => {
  const templates = Object.values(WORKFLOW_TEMPLATES).map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    source: { type: t.source.type, name: t.source.name, icon: t.source.icon },
    transform: { type: t.transform.type, name: t.transform.name, icon: t.transform.icon },
    destination: { type: t.destination.type, name: t.destination.name, icon: t.destination.icon }
  }));
  res.json(templates);
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error(`   Run: lsof -ti:${PORT} | xargs kill -9`);
    process.exit(1);
  }
  throw err;
});

httpServer.listen(PORT, HOST, () => {
  console.log(`🚀 Workflow AI Backend running on http://${HOST}:${PORT}`);
});

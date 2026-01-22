# AI Workflow Builder

A conversational AI-powered workflow builder for creating data integration pipelines. Build complete workflows (Source → Transform → Destination) through a natural chat interface with real-time visual feedback.

## Features

- 🤖 **Conversational AI Interface**: Build workflows by chatting naturally with an AI assistant
- 📊 **Real-time Visualization**: See your workflow configuration update in real-time as you chat
- 🔄 **Pre-built Templates**: 4 realistic workflow templates ready to configure
- 📈 **Field-level Status Tracking**: See which fields are collected, in progress, or pending
- ⚡ **WebSocket Communication**: Instant real-time updates between chat and visualization

## Supported Workflows

| Workflow | Source | Transform | Destination |
|----------|--------|-----------|-------------|
| Connect Shopify to BigQuery | 🛒 Shopify | ⚙️ Data Mapping | 📊 Google BigQuery |
| Sync Salesforce to Mailchimp | ☁️ Salesforce | 🔄 Field Mapping | 📧 Mailchimp |
| Stripe to Google Sheets | 💳 Stripe | 📝 Data Formatting | 📑 Google Sheets |
| HubSpot Deals to Slack | 🟠 HubSpot | ✏️ Message Format | 💬 Slack |

## UI Layout

- **Left Panel (25%)**: Chat interface for conversational configuration
- **Right Panel (75%)**: Real-time workflow visualization showing:
  - Three connected nodes: Source → Transform → Destination
  - Field-level configuration status (Collected ✓, In Progress ⏳, Pending ○)
  - Progress bars for each node
  - Current values for collected fields

## Project Structure

```
zed-base/
├── backend/                 # Node.js backend server
│   ├── server.js           # Express + Socket.io server with workflow logic
│   └── package.json
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── WorkflowVisualization.tsx
│   │   │   └── Header.tsx
│   │   ├── hooks/          # Custom React hooks
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # Main app with split layout
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

**Option 1: Run in separate terminals**

1. **Start the backend server (Terminal 1):**
   ```bash
   cd backend
   npm start
   ```
   The server will run on `http://0.0.0.0:3001`

2. **Start the frontend development server (Terminal 2):**
   ```bash
   cd frontend
   npm run dev
   ```
   The app will be available at `http://0.0.0.0:5173`

**Option 2: If port is already in use**
```bash
# Kill existing processes on ports
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
```

### Running in a Container

When running inside a Docker container, both servers bind to `0.0.0.0` to expose ports externally. Access the application via:
- Frontend: `http://<container-ip>:5173` or `http://localhost:5173` (if ports are mapped)
- Backend: `http://<container-ip>:3001` or `http://localhost:3001` (if ports are mapped)

The frontend automatically detects the hostname and connects to the backend on the same host.

## How It Works

1. **Select a Workflow Template**: Choose from pre-built integration templates
2. **Configure Source**: Provide connection details for the data source (API keys, URLs, etc.)
3. **Configure Transform**: Set up data transformation rules (formatting, mapping, filtering)
4. **Configure Destination**: Provide credentials for where data should be sent
5. **Activate**: Test the connection and activate your workflow

Each step is guided through natural conversation, with the visualization panel showing real-time progress.

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Socket.io-client for real-time communication
- Lucide React for icons
- React Markdown for message formatting

### Backend
- Node.js with Express
- Socket.io for WebSocket communication
- Stateful session management for workflow progression

## API Reference

### WebSocket Events

**Client → Server:**
- `user_message`: Send user message `{ content: string }`
- `reset_workflow`: Reset current workflow session
- `get_workflow_state`: Request current workflow state

**Server → Client:**
- `ai_message`: AI response with message, options, and input type
- `ai_typing`: Typing indicator `{ isTyping: boolean }`
- `workflow_state`: Complete workflow state with nodes and field statuses

### REST Endpoints

- `GET /api/health`: Health check
- `GET /api/templates`: List available workflow templates

## License

ISC
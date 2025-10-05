# Setup Guides - Tuberise Analytics

## 📚 Overview

This document consolidates all setup guides for the Tuberise Analytics project, providing a single reference for configuring development tools, MCP servers, and automation systems.

## 🎯 Quick Navigation

- [MCP Servers Setup](#mcp-servers-setup) - Custom MCP servers configuration
- [Session Tracking Setup](#session-tracking-setup) - Automated work log system
- [Auto-Start Setup](#auto-start-setup) - Automatic session tracking
- [Development Environment](#development-environment) - Complete dev setup

---

## 🔧 MCP Servers Setup

### Custom MCP Servers Overview

We've created **5 custom MCP servers** that provide comprehensive development tools:

#### **1. PackageManager MCP** (mimics SourceWizard)

- **Purpose**: Package management and dependency handling
- **Features**:
  - `search_packages`: Find npm packages based on project needs
  - `install_package`: Install and configure packages
  - `analyze_dependencies`: Analyze current dependencies
  - `suggest_alternatives`: Suggest package alternatives

#### **2. DatabaseDesigner MCP** (mimics GibsonAI)

- **Purpose**: AI-powered database design and API generation
- **Features**:
  - `create_database_schema`: Generate schemas from natural language
  - `generate_crud_api`: Create CRUD API endpoints
  - `generate_erd`: Generate Entity Relationship Diagrams
  - `optimize_queries`: Analyze and optimize SQL queries
  - `suggest_indexes`: Suggest database indexes

#### **3. APITester MCP** (mimics Postman)

- **Purpose**: API testing and development automation
- **Features**:
  - `test_endpoint`: Test any API endpoint
  - `test_youtube_api`: Test YouTube Data API
  - `test_notion_api`: Test Notion API
  - `test_backend_api`: Test our Tuberise backend
  - `validate_response`: Validate API responses
  - `generate_test_collection`: Generate Postman collections

#### **4. EmailSender MCP** (mimics Mailtrap)

- **Purpose**: Email functionality and testing
- **Features**:
  - `send_email`: Send emails via SMTP
  - `send_analytics_report`: Send analytics reports
  - `send_notification`: Send system notifications
  - `test_email_config`: Test email configuration
  - `generate_email_template`: Generate email templates
  - `validate_email`: Validate email addresses

#### **5. ProgressTracker MCP** (Custom)

- **Purpose**: Automated progress tracking and documentation
- **Features**:
  - `add_entry`: Add new progress entries
  - `update_status`: Update task status
  - `add_milestone`: Add project milestones
  - `generate_summary`: Generate progress summaries
  - `create_backup`: Create progress backups

### MCP Server Installation

1. **Verify Dependencies**:

   ```bash
   cd mcp-servers
   npm install
   ```

2. **Test Individual Servers**:

   ```bash
   # Test PackageManager MCP
   node package-manager-mcp.js

   # Test DatabaseDesigner MCP
   node database-designer-mcp.js

   # Test APITester MCP
   node api-tester-mcp.js

   # Test EmailSender MCP
   node email-sender-mcp.js

   # Test ProgressTracker MCP
   node progress-tracker-mcp.js
   ```

3. **Configure Cursor**:
   - The `mcp.json` file is already configured
   - Restart Cursor to load the new MCP servers
   - Test in Cursor by using the MCP tools

### Environment Configuration

Add environment variables to `mcp.json` for enhanced functionality:

```json
{
  "mcpServers": {
    "email-sender": {
      "command": "node",
      "args": ["mcp-servers/email-sender-mcp.js"],
      "env": {
        "NODE_ENV": "development",
        "SMTP_HOST": "smtp.gmail.com",
        "SMTP_PORT": "587"
      }
    }
  }
}
```

---

## 📝 Session Tracking Setup

### Overview

The Session Exit Tracker automatically prompts you to update work logs when you exit Cursor, ensuring consistent documentation of your development sessions.

### Quick Start

#### **Option 1: Windows Batch File (Easiest)**

```bash
scripts/start-session-tracker.bat
```

#### **Option 2: Node.js (Cross-Platform)**

```bash
node scripts/session-exit-tracker.js
```

#### **Option 3: PowerShell (Windows)**

```powershell
.\scripts\Session-Exit-Tracker.ps1
```

### What It Does

#### **Automatic Monitoring**

- Tracks session start time
- Monitors for exit events (Ctrl+C, window close, etc.)
- Calculates session duration automatically

#### **Work Log Popup**

When you exit Cursor, you'll see an interactive prompt:

```
============================================================
📝 WORK LOG UPDATE REQUIRED
============================================================
⏱️  Session Duration: 2h 15m 30s

📋 Session Summary (what was accomplished):
🔧 Features Implemented (comma-separated):
🚨 Problems Encountered (comma-separated, or "none"):
✅ Solutions Implemented (comma-separated, or "none"):
🚀 Next Steps (comma-separated):
📊 Session Status (completed/in_progress/blocked):
```

#### **Automatic Updates**

The system automatically updates:

- **`progress.md`** - Main progress tracking file
- **`process-status.md`** - Session continuity file
- **`session-summary-YYYY-MM-DD.md`** - Daily session summary

### Installation Steps

1. **Ensure files are in your project structure**:

   ```
   tuberise/
   ├── scripts/
   │   ├── session-exit-tracker.js
   │   ├── Session-Exit-Tracker.ps1
   │   ├── start-session-tracker.bat
   │   └── update-progress.js
   └── progress.md
   ```

2. **Test the installation**:

   ```bash
   # Test Node.js version
   node scripts/session-exit-tracker.js

   # Test PowerShell version
   powershell -ExecutionPolicy Bypass -File "scripts/Session-Exit-Tracker.ps1"
   ```

3. **Start tracking**:
   ```bash
   scripts/start-session-tracker.bat
   ```

### Usage Tips

#### **Session Documentation Best Practices**

- **Be specific** in session summaries
- **List concrete features** implemented
- **Document real problems** encountered
- **Include actual solutions** applied
- **Set clear next steps** for continuity

#### **Example Good Documentation**

- **Session Summary**: "Implemented user authentication system with OAuth 2.0"
- **Features**: "OAuth 2.0 integration, JWT token management, user session handling"
- **Problems**: "CORS configuration issues, JWT token expiration handling"
- **Solutions**: "Added CORS middleware, implemented token refresh logic"
- **Next Steps**: "Test authentication flow, implement user profile management"

---

## 🚀 Auto-Start Setup

### Overview

The Auto-Start Session Tracker automatically monitors for Cursor and starts the session tracker when Cursor is launched, ensuring you never forget to track your work sessions.

### Quick Start

#### **Option 1: Windows Startup Installation (Recommended)**

```bash
# Install to Windows startup (runs automatically on boot)
install-startup-tracker.bat

# Uninstall from Windows startup
uninstall-startup-tracker.bat
```

#### **Option 2: Manual Start**

```bash
# Start auto-start tracker manually
start-auto-tracker.bat

# Or PowerShell version
.\Start-Auto-Tracker.ps1
```

#### **Option 3: Node.js Direct**

```bash
# Start auto-start tracker directly
node scripts/auto-start-tracker.js
```

### How It Works

#### **Automatic Monitoring**

1. **Process Detection** - Monitors for Cursor.exe process
2. **Auto-Start** - Automatically starts session tracker when Cursor is detected
3. **Background Operation** - Runs silently in the background
4. **Cross-Platform** - Works on Windows, macOS, and Linux

#### **Workflow**

```
Windows Boot → Auto-Start Tracker → Monitor for Cursor → Start Session Tracker → Exit Prompt
```

### Installation Options

#### **1. Windows Startup Installation (Recommended)**

- Copies `start-auto-tracker.bat` to Windows startup folder
- Creates startup shortcut for automatic launch
- Runs automatically every time Windows boots

#### **2. Manual Start (Temporary)**

- Run `start-auto-tracker.bat` when needed
- Starts monitoring for Cursor processes
- Stops when you close the terminal

#### **3. Background PowerShell (Windows)**

- Runs in background without visible window
- Automatic process management
- Enhanced error handling

### File Structure

```
tuberise/
├── scripts/
│   ├── auto-start-tracker.js              # Main auto-start logic
│   ├── start-auto-tracker.bat             # Windows batch launcher
│   ├── Start-Auto-Tracker.ps1             # PowerShell version
│   ├── install-startup-tracker.bat        # Windows startup installer
│   ├── uninstall-startup-tracker.bat      # Windows startup uninstaller
│   └── session-exit-tracker.js            # Session tracker (auto-started)
└── docs/
    └── AUTO-START-SETUP.md                # Detailed setup guide
```

---

## 💻 Development Environment

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **Git** (v2.30.0 or higher)
- **PostgreSQL** (v14.0 or higher)
- **Redis** (v6.0 or higher)

### Quick Setup

1. **Clone Repository**:

   ```bash
   git clone https://github.com/your-org/tuberise-analytics.git
   cd tuberise-analytics
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   npm run install:all
   ```

3. **Environment Configuration**:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**:

   ```bash
   docker-compose up -d postgres redis
   npm run db:migrate
   npm run db:seed
   ```

5. **Start Development**:
   ```bash
   npm run dev
   ```

### Docker Development Environment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

## 🚨 Troubleshooting

### Common Issues

#### **MCP Server Not Starting**

- Check that Node.js is installed and accessible
- Verify all dependencies are installed (`npm install`)
- Check file permissions
- Restart Cursor completely

#### **Session Tracker Not Working**

- Ensure all files are in project root directory
- Check file permissions
- Try alternative version (Node.js vs PowerShell)
- Check console output for error messages

#### **Auto-Start Not Working**

- Run installation script as administrator
- Check Windows startup folder permissions
- Verify the batch file was copied correctly
- Check if auto-start tracker is running in Task Manager

#### **Permission Errors**

- Run installation scripts as administrator
- Check file paths in configuration files
- Verify Node.js is in system PATH

### Debug Mode

Enable debug logging to troubleshoot issues:

```javascript
// Add to MCP servers
console.log('Debug: Server starting...');

// Add to session tracker
console.log('Debug: Session started at', sessionStartTime);

// Add to auto-start tracker
console.log('Debug: Checking for Cursor process...');
```

---

## 📚 Additional Resources

### Documentation

- [Project Overview](./PROJECT-OVERVIEW.md)
- [Tech Stack](./TECH-STACK.md)
- [Development Setup](./DEVELOPMENT-SETUP.md)
- [API Documentation](./API-DOCUMENTATION.md)

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [Node.js Documentation](https://nodejs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

### Support

- [GitHub Issues](https://github.com/your-org/tuberise-analytics/issues)
- [Discord Server](https://discord.gg/tuberise)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/tuberise-analytics)

---

**Document Version:** 1.0
**Last Updated:** October 5, 2025
**Next Review:** October 12, 2025
**Maintained By:** Engineering Team

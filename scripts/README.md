# Scripts Directory - Tuberise Analytics

## 📁 Overview

This directory contains all automation scripts for the Tuberise Analytics project. These scripts handle session tracking, progress management, and automated workflows.

## 🔧 Script Categories

### **Session Tracking Scripts**

#### **Core Session Tracker**

- **`session-exit-tracker.js`** - Main session tracking script (Node.js)
  - Tracks session duration and prompts for work log updates
  - Cross-platform compatibility
  - Interactive prompts for session documentation

#### **PowerShell Alternative**

- **`Session-Exit-Tracker.ps1`** - PowerShell version of session tracker
  - Windows-specific optimizations
  - Enhanced error handling
  - Background job support

#### **Batch File Launcher**

- **`./start-session-tracker.bat`** - Simple batch file to start session tracker
  - Easy double-click execution
  - Windows-specific launcher

### **Auto-Start Scripts**

#### **Auto-Start Core**

- **`auto-start-tracker.js`** - Monitors for Cursor and starts session tracker
  - Automatic process detection
  - Background monitoring
  - Cross-platform support

#### **Auto-Start Launchers**

- **`start-auto-tracker.bat`** - Windows batch launcher for auto-start
- **`Start-Auto-Tracker.ps1`** - PowerShell launcher with background support

#### **Auto-Start Installation**

- **`install-startup-tracker.bat`** - Installs auto-start to Windows startup folder
- **`uninstall-startup-tracker.bat`** - Removes auto-start from Windows startup

### **Progress Management Scripts**

#### **Progress Updates**

- **`update-progress.js`** - Command-line progress update tool (Node.js)
  - Quick progress entries
  - Status updates
  - Milestone tracking

#### **PowerShell Alternative**

- **`Update-Progress.ps1`** - PowerShell version of progress updater
  - Windows-specific features
  - Enhanced formatting

## 🚀 Quick Start

### **Session Tracking**

```bash
# Start session tracking (easiest)
./start-session-tracker.bat

# Or use Node.js version
node ./session-exit-tracker.js

# Or PowerShell version
.\Session-Exit-Tracker.ps1
```

### **Auto-Start Setup**

```bash
# Install auto-start (Windows)
install-startup-tracker.bat

# Start auto-start manually
start-auto-tracker.bat
```

### **Progress Updates**

```bash
# Quick progress update
node ./update-progress.js "Feature completed" "completed" "Implemented user auth"

# Or PowerShell version
.\Update-Progress.ps1 "Feature completed" "completed" "Implemented user auth"
```

## 📋 Usage Examples

### **Session Tracking Workflow**

1. **Start Session Tracker**:

   ```bash
   ./start-session-tracker.bat
   ```

2. **Work on Project**:

   - Open Cursor
   - Develop features
   - Track progress

3. **Exit Cursor**:

   - Session tracker detects exit
   - Interactive popup appears
   - Fill out session details

4. **Automatic Updates**:
   - `progress.md` updated
   - `process-status.md` updated
   - Daily summary created

### **Auto-Start Workflow**

1. **Install Auto-Start**:

   ```bash
   install-startup-tracker.bat
   ```

2. **Automatic Operation**:
   - Windows starts → Auto-start tracker runs
   - Open Cursor → Session tracker starts automatically
   - Close Cursor → Work log popup appears

### **Progress Management Workflow**

1. **Quick Updates**:

   ```bash
   node ./update-progress.js "Task Name" "completed" "Description"
   ```

2. **Status Changes**:

   ```bash
   node update-progress.js "Task Name" "in_progress" "Working on feature"
   ```

3. **Milestone Tracking**:
   ```bash
   node update-progress.js "Milestone Name" "milestone" "Major achievement"
   ```

## 🔧 Configuration

### **Environment Variables**

Some scripts support environment variables for customization:

```bash
# Session tracker settings
SESSION_TIMEOUT=300000  # 5 minutes
DEBUG_MODE=true

# Progress tracker settings
PROGRESS_FILE=./progress.md
BACKUP_ENABLED=true
```

### **File Paths**

Scripts automatically detect the project structure:

- Progress files: `../progress.md`
- Status files: `../process-status.md`
- Configuration: `../mcp.json`

## 🚨 Troubleshooting

### **Common Issues**

#### **"Node.js not found"**

- Install Node.js from [nodejs.org](https://nodejs.org/)
- Ensure Node.js is in your system PATH
- Use PowerShell versions as alternatives

#### **"PowerShell execution policy"**

- Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- Or use Node.js versions instead

#### **"File not found"**

- Ensure you're running scripts from the project root
- Check that all files are in the correct directories
- Verify file permissions

#### **"Permission denied"**

- Run batch files as administrator if needed
- Check file permissions
- Ensure scripts are executable

### **Debug Mode**

Enable debug logging in any script:

```javascript
// Node.js scripts
console.log('Debug: Starting script...');

// PowerShell scripts
Write-Host "Debug: Starting script..." -ForegroundColor Yellow
```

## 📊 Script Dependencies

### **Node.js Scripts**

- **Runtime**: Node.js 18+
- **Dependencies**: None (uses built-in modules)
- **Platform**: Cross-platform

### **PowerShell Scripts**

- **Runtime**: PowerShell 5.1+
- **Dependencies**: None (uses built-in cmdlets)
- **Platform**: Windows

### **Batch Files**

- **Runtime**: Windows Command Prompt
- **Dependencies**: None
- **Platform**: Windows

## 🔄 Integration

### **With Cursor IDE**

- MCP servers automatically use these scripts
- Progress tracking integrates with development workflow
- Session tracking provides continuity between sessions

### **With Git**

- Scripts can be committed to version control
- Progress files are tracked for team collaboration
- Session summaries provide development history

### **With CI/CD**

- Scripts can be integrated into build pipelines
- Progress tracking for deployment milestones
- Automated documentation updates

## 📚 Documentation

### **Related Documentation**

- [Setup Guides](../docs/SETUP-GUIDES.md) - Comprehensive setup instructions
- [Session Tracking Setup](../docs/SESSION-TRACKING-SETUP.md) - Detailed session tracking guide
- [Auto-Start Setup](../docs/AUTO-START-SETUP.md) - Auto-start configuration guide

### **API Reference**

- [Progress Tracker MCP](../mcp-servers/progress-tracker-mcp.js) - MCP server for progress tracking
- [Update Progress Script](./update-progress.js) - Command-line progress updates
- [Session Exit Tracker](./session-exit-tracker.js) - Session tracking implementation

## 🎯 Best Practices

### **Script Usage**

1. **Use appropriate script** for your platform and needs
2. **Test scripts** before relying on them for important work
3. **Keep scripts updated** with project changes
4. **Document custom modifications** to scripts

### **File Management**

1. **Keep scripts in this directory** for organization
2. **Don't modify core scripts** without understanding the impact
3. **Create custom scripts** for project-specific needs
4. **Backup important scripts** before making changes

### **Integration**

1. **Use auto-start** for consistent session tracking
2. **Regular progress updates** for project visibility
3. **Session documentation** for team collaboration
4. **Automated workflows** for efficiency

---

**Last Updated:** October 5, 2025
**Maintained By:** Development Team
**Version:** 1.0

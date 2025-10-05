# Auto-Start Session Tracker Setup Guide

## Overview

The Auto-Start Session Tracker automatically monitors for Cursor and starts the session tracker when Cursor is launched, ensuring you never forget to track your work sessions.

## 🚀 Quick Start

### Option 1: Windows Startup Installation (Recommended)

```bash
# Install to Windows startup (runs automatically on boot)
install-startup-tracker.bat

# Uninstall from Windows startup
uninstall-startup-tracker.bat
```

### Option 2: Manual Start

```bash
# Start auto-start tracker manually
start-auto-tracker.bat

# Or PowerShell version
.\Start-Auto-Tracker.ps1
```

### Option 3: Node.js Direct

```bash
# Start auto-start tracker directly
node scripts/auto-start-tracker.js
```

## 📋 How It Works

### **Automatic Monitoring**

1. **Process Detection** - Monitors for Cursor.exe process
2. **Auto-Start** - Automatically starts session tracker when Cursor is detected
3. **Background Operation** - Runs silently in the background
4. **Cross-Platform** - Works on Windows, macOS, and Linux

### **Workflow**

```
Windows Boot → Auto-Start Tracker → Monitor for Cursor → Start Session Tracker → Exit Prompt
```

### **Benefits**

- **Zero Manual Intervention** - Completely automatic
- **Never Miss a Session** - Always tracks when Cursor is used
- **Windows Integration** - Starts with Windows boot
- **Background Operation** - Doesn't interfere with your workflow

## 🔧 Installation Options

### **1. Windows Startup Installation (Recommended)**

#### **Installation:**

```bash
# Run as administrator for best results
install-startup-tracker.bat
```

#### **What it does:**

- Copies `start-auto-tracker.bat` to Windows startup folder
- Creates startup shortcut for automatic launch
- Optionally starts the tracker immediately

#### **Uninstallation:**

```bash
uninstall-startup-tracker.bat
```

### **2. Manual Start (Temporary)**

#### **Windows Batch:**

```bash
start-auto-tracker.bat
```

#### **PowerShell:**

```powershell
.\Start-Auto-Tracker.ps1
```

#### **Node.js:**

```bash
node scripts/auto-start-tracker.js
```

### **3. Background PowerShell (Windows)**

```powershell
# Start in background
.\Start-Auto-Tracker.ps1 -Background
```

## 📊 File Structure

```
tuberise/
├── scripts/
│   ├── auto-start-tracker.js              # Main auto-start logic
│   ├── start-auto-tracker.bat             # Windows batch launcher
│   ├── Start-Auto-Tracker.ps1             # PowerShell version
│   ├── install-startup-tracker.bat        # Windows startup installer
│   ├── uninstall-startup-tracker.bat      # Windows startup uninstaller
│   └── session-exit-tracker.js            # Session tracker (auto-started)
└── AUTO-START-SETUP.md                # This guide
```

## 💡 Usage Examples

### **Scenario 1: Complete Automation**

1. Run `install-startup-tracker.bat` once
2. Restart Windows
3. Auto-start tracker runs automatically
4. Open Cursor → Session tracker starts automatically
5. Close Cursor → Work log popup appears

### **Scenario 2: Manual Control**

1. Run `start-auto-tracker.bat` when needed
2. Open Cursor → Session tracker starts automatically
3. Close Cursor → Work log popup appears
4. Close the auto-start tracker when done

### **Scenario 3: Development Session**

1. Run `node scripts/auto-start-tracker.js` in terminal
2. Open Cursor → Session tracker starts automatically
3. Work on your project
4. Close Cursor → Work log popup appears
5. Press Ctrl+C to stop auto-start tracker

## 🔄 Integration with Existing Workflow

### **Current Workflow:**

1. Open Cursor
2. Remember to start session tracker
3. Work on project
4. Remember to update work logs
5. Close Cursor

### **New Automated Workflow:**

1. Open Cursor (session tracker starts automatically)
2. Work on project
3. Close Cursor (work log popup appears automatically)
4. Complete popup (work logs updated automatically)

## 🛠️ Customization

### **Modify Check Interval**

Edit the check interval in `scripts/auto-start-tracker.js`:

```javascript
// Change from 5000ms (5 seconds) to your preferred interval
this.checkInterval = setInterval(async () => {
  await this.checkCursorProcess();
}, 10000); // 10 seconds
```

### **Add Custom Process Detection**

Modify the `isCursorRunning()` function to detect other editors:

```javascript
async isCursorRunning() {
  // Add detection for other editors
  const editors = ['Cursor.exe', 'Code.exe', 'notepad.exe']
  // ... detection logic
}
```

### **Custom Startup Behavior**

Modify the startup behavior in the batch files:

```batch
REM Add custom startup commands
echo Starting custom startup tasks...
REM Your custom commands here
```

## 🚨 Troubleshooting

### **Common Issues**

#### **"Auto-start tracker not starting"**

- Check if Node.js is installed: `node --version`
- Run as administrator for Windows startup installation
- Check Windows startup folder permissions

#### **"Session tracker not starting when Cursor opens"**

- Verify Cursor process name (should be "Cursor.exe")
- Check if auto-start tracker is running
- Look for error messages in console

#### **"Work log popup not appearing"**

- Ensure session tracker is running
- Check if Cursor process is detected correctly
- Verify scripts/session-exit-tracker.js exists and is executable

#### **"Windows startup not working"**

- Run `install-startup-tracker.bat` as administrator
- Check Windows startup folder: `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`
- Verify the batch file was copied correctly

### **Debug Mode**

#### **Enable Verbose Logging**

Modify `scripts/auto-start-tracker.js` to add debug output:

```javascript
console.log('Debug: Checking for Cursor process...');
console.log('Debug: Cursor running:', cursorRunning);
```

#### **Check Process Detection**

Test process detection manually:

```bash
# Windows
tasklist /FI "IMAGENAME eq Cursor.exe"

# macOS/Linux
pgrep -f "Cursor"
```

## 📈 Advanced Features

### **Multiple Editor Support**

The auto-start tracker can be modified to support multiple editors:

- Visual Studio Code
- Sublime Text
- Atom
- Any editor with a detectable process

### **Custom Startup Scripts**

Add custom startup scripts that run when the auto-start tracker starts:

```javascript
// In scripts/auto-start-tracker.js
async setupAutoStart() {
  // Run custom startup scripts
  await this.runCustomStartupScripts()
  // ... rest of setup
}
```

### **Integration with Other Tools**

- **Git Hooks** - Automatically commit work logs
- **Slack/Teams** - Send session summaries to team channels
- **Calendar** - Log time spent on projects
- **Time Tracking** - Integrate with time tracking tools

## 🎯 Best Practices

### **Installation**

1. **Run as Administrator** - For Windows startup installation
2. **Test First** - Use manual start before installing to startup
3. **Backup Scripts** - Keep copies of your customized scripts

### **Usage**

1. **Let it Run** - Don't close the auto-start tracker during development
2. **Check Console** - Monitor for any error messages
3. **Restart if Needed** - Restart auto-start tracker if issues occur

### **Maintenance**

1. **Regular Updates** - Keep scripts updated with latest versions
2. **Monitor Logs** - Check for any error messages or issues
3. **Clean Uninstall** - Use uninstall script when removing

## 📋 Quick Reference

### **Installation Commands**

```bash
# Install to Windows startup
install-startup-tracker.bat

# Uninstall from Windows startup
uninstall-startup-tracker.bat

# Manual start
start-auto-tracker.bat
```

### **Check Status**

```bash
# Check if auto-start tracker is running
tasklist /FI "IMAGENAME eq node.exe"

# Check if session tracker is running
tasklist /FI "IMAGENAME eq node.exe"
```

### **Troubleshooting Commands**

```bash
# Check Cursor process
tasklist /FI "IMAGENAME eq Cursor.exe"

# Check Node.js installation
node --version

# Check startup folder
dir "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
```

---

## ✅ Quick Start Checklist

- [ ] **Install Node.js** (if not already installed)
- [ ] **Run installation script** (`install-startup-tracker.bat`)
- [ ] **Restart Windows** (for startup installation)
- [ ] **Open Cursor** (should auto-start session tracker)
- [ ] **Close Cursor** (should show work log popup)
- [ ] **Complete popup** (work logs should update automatically)

---

**Status:** ✅ **READY TO USE**
**Compatibility:** Windows, macOS, Linux
**Dependencies:** Node.js
**Integration:** Automatic with Cursor workflow
**Startup:** Windows startup folder integration

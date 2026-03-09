# SECURITY — Stealth & Privacy Protocol

## Stealth Verification Checklist
Before any release, verify ALL of these:

### Screen Sharing Tests
- [ ] Zoom screen share: app NOT visible
- [ ] Google Meet screen share: app NOT visible
- [ ] Microsoft Teams screen share: app NOT visible
- [ ] Discord screen share: app NOT visible
- [ ] OBS Studio capture: app NOT visible
- [ ] Windows Game Bar capture: app NOT visible
- [ ] Snipping Tool: app NOT visible
- [ ] Print Screen key: app NOT visible

### Process Detection Tests
- [ ] Task Manager: process has generic name
- [ ] Alt+Tab: app not in window cycle (when hidden)
- [ ] Taskbar: no icon visible (when stealthed)

### Panic Button Tests
- [ ] Ctrl+Alt+Shift+X works when app is focused
- [ ] Ctrl+Alt+Shift+X works when app is NOT focused
- [ ] Ctrl+Alt+Shift+X works when app is behind other windows
- [ ] After panic: no audio playing
- [ ] After panic: no microphone active
- [ ] After panic: chat history cleared
- [ ] After panic: window completely hidden
- [ ] After panic: no temp files on disk

### Data Privacy Tests
- [ ] No files written to disk during session
- [ ] No browser cache/cookies with AI responses
- [ ] API key not visible in DevTools Network tab (main process only)
- [ ] No clipboard manipulation without user action
- [ ] Resume/context data only in memory, cleared on close

## Electron Security Hardening

```javascript
// REQUIRED window settings
const mainWindow = new BrowserWindow({
  // Stealth
  skipTaskbar: true,
  frame: false,
  transparent: true,
  hasShadow: false,
  alwaysOnTop: true,
  
  // Security
  webPreferences: {
    nodeIntegration: false,        // MANDATORY
    contextIsolation: true,        // MANDATORY
    sandbox: true,                 // MANDATORY
    preload: path.join(__dirname, 'preload.js'),
    webSecurity: true,             // MANDATORY
    allowRunningInsecureContent: false,
    enableRemoteModule: false      // DEPRECATED but enforce
  }
});

// MANDATORY: Enable content protection
mainWindow.setContentProtection(true);
```

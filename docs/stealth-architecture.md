# Stealth Architecture — Deep Dive

## How Screen-Sharing Invisibility Works

### The OS Compositor Layer
Modern operating systems use a compositor to manage window rendering.
When a screen-sharing app (Zoom, Teams, Meet) captures the screen,
it asks the OS compositor for a bitmap of the desktop.

The compositor has a flag per window: **content protection**.
When this flag is set, the compositor renders that window as a
**black rectangle** (or skips it entirely) in the captured output.

### Electron's `setContentProtection(true)`
This Electron API sets the underlying OS flag:
- **Windows**: Sets `WDA_EXCLUDEFROMCAPTURE` via `SetWindowDisplayAffinity`
- **macOS**: Sets `NSWindowSharingNone` on the `NSWindow`
- **Linux**: Uses X11/Wayland compositor hints (less reliable)

### What This Means in Practice
```
┌─────────────────────────────────────────┐
│          What USER Sees                  │
│                                          │
│  ┌────────────┐  ┌──────────────────┐   │
│  │ Zoom Call  │  │  Invisibrain AI  │   │
│  │            │  │  (visible to     │   │
│  │            │  │   user only)     │   │
│  └────────────┘  └──────────────────┘   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│     What SCREEN SHARE Shows              │
│                                          │
│  ┌────────────┐                          │
│  │ Zoom Call  │  ← Invisibrain is       │
│  │            │    completely absent     │
│  │            │                          │
│  └────────────┘                          │
└─────────────────────────────────────────┘
```

## Multi-Layer Stealth Strategy

### Layer 1: Content Protection (Always Active)
- `setContentProtection(true)` — invisible to ALL capture APIs
- This is the primary stealth mechanism
- Works against: Zoom, Teams, Meet, OBS, Game Bar, Snipping Tool

### Layer 2: Window Properties (Always Active)
- `skipTaskbar: true` — no taskbar icon
- `frame: false` — no OS window chrome
- `transparent: true` — blends with desktop
- `hasShadow: false` — no drop shadow to detect
- `alwaysOnTop: true` — type `screen-saver` (highest z-order)
- No window title set

### Layer 3: Physical Hide (On-Demand: Ctrl+Alt+Shift+H)
- `BrowserWindow.hide()` — completely removes from window manager
- Window is NOT minimized (minimized windows can be enumerated)
- Removed from Alt+Tab window cycle
- `BrowserWindow.show()` to restore

### Layer 4: Panic Protocol (Emergency: Ctrl+Alt+Shift+X)
- Registered as `globalShortcut` — works even if Electron is frozen
- Execution sequence (all synchronous, < 50ms):
  1. Send `panic-clear` IPC to renderer
  2. Renderer stops MediaRecorder
  3. Renderer stops speechSynthesis
  4. Renderer clears all chat messages
  5. Renderer clears resume context
  6. Main process hides window
  7. Main process clears any data in memory

## Anti-Detection Measures

### Process Name
- Electron apps show as the executable name in Task Manager
- Build with a generic name (not "invisibrain.exe")
- Consider: "electron.exe" or a neutral name

### Network Fingerprint
- All API calls go to `generativelanguage.googleapis.com`
- This is the same endpoint used by millions of apps
- No custom domains, no unusual ports
- HTTPS only — content is encrypted in transit

### Memory Forensics
- No conversation history written to disk
- No cache files, no IndexedDB usage
- Audio buffers are garbage collected after processing
- Screenshot buffers are garbage collected after API call
- On panic: explicit nullification of all data references

## Testing Stealth

### Manual Test Protocol
1. Launch Invisibrain AI
2. Position on screen with visible content behind it
3. Start Zoom/Teams/Meet call
4. Share screen (full screen mode)
5. Verify: Invisibrain NOT visible in shared view
6. Verify: Invisibrain IS visible to local user
7. Test with each platform (Zoom, Teams, Meet)
8. Test panic button — verify complete disappearance

### Automated Verification
- Use `desktopCapturer` to capture own screen
- Verify app window is NOT in captured output
- Run on app startup as self-test (development mode only)

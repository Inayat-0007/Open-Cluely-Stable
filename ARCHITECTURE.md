# ARCHITECTURE — Invisibrain AI

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    ELECTRON APP                          │
│                                                          │
│  ┌──────────────┐    IPC Bridge    ┌──────────────────┐ │
│  │   RENDERER   │◄──────────────►│    MAIN PROCESS    │ │
│  │   PROCESS    │   (preload.js)  │                    │ │
│  │              │                  │  ┌──────────────┐ │ │
│  │ ┌──────────┐ │                  │  │   Gemini     │ │ │
│  │ │   UI     │ │  capture-screen  │  │   Service    │ │ │
│  │ │ (HTML/   │ │ ──────────────► │  │              │ │ │
│  │ │  CSS/JS) │ │                  │  │ ┌──────────┐│ │ │
│  │ └──────────┘ │  ai-response     │  │ │2.5 Flash ││ │ │
│  │              │ ◄────────────── │  │ │(Primary) ││ │ │
│  │ ┌──────────┐ │                  │  │ └──────────┘│ │ │
│  │ │ Media    │ │  process-audio   │  │ ┌──────────┐│ │ │
│  │ │ Recorder │ │ ──────────────► │  │ │2.0 Flash ││ │ │
│  │ │ (Audio)  │ │                  │  │ │(Fallback)││ │ │
│  │ └──────────┘ │  panic-clear     │  │ └──────────┘│ │ │
│  │              │ ──────────────► │  └──────────────┘ │ │
│  │ ┌──────────┐ │                  │                    │ │
│  │ │ Web      │ │                  │  ┌──────────────┐ │ │
│  │ │ Speech   │ │                  │  │   Screen     │ │ │
│  │ │ TTS      │ │                  │  │   Capture    │ │ │
│  │ └──────────┘ │                  │  │  (desktopCap)│ │ │
│  └──────────────┘                  │  └──────────────┘ │ │
│                                    │                    │ │
│                                    │  ┌──────────────┐ │ │
│                                    │  │  Stealth     │ │ │
│                                    │  │  Manager     │ │ │
│                                    │  │ (hide/show/  │ │ │
│                                    │  │  panic)      │ │ │
│                                    │  └──────────────┘ │ │
│                                    └──────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │   Google Gemini  │
                 │   API (Cloud)    │
                 │                  │
                 │ • Transcription  │
                 │ • Text Analysis  │
                 │ • Vision/OCR     │
                 │ • Code Solving   │
                 └──────────────────┘
```

## IPC Channel Map

### Renderer → Main (Requests)
| Channel              | Payload              | Description                |
|----------------------|----------------------|----------------------------|
| capture-screen       | none                 | Take stealth screenshot    |
| process-audio        | { audioBuffer }      | Send audio for AI analysis |
| process-text         | { text, context }    | Send text query to AI      |
| process-code         | { screenshot }       | Analyze code problem       |
| set-resume-context   | { resumeText }       | Store resume for context   |
| panic-clear          | none                 | Emergency data wipe        |
| toggle-stealth       | none                 | Hide/show window           |
| window-drag          | { x, y }            | Move window position       |
| resize-window        | { width, height }   | Resize window              |

### Main → Renderer (Responses)
| Channel              | Payload              | Description                |
|----------------------|----------------------|----------------------------|
| ai-response          | { text, type }       | AI response to display     |
| ai-error             | { error, fallback }  | Error with fallback status |
| screenshot-taken     | { imageBase64 }      | Captured screenshot data   |
| stealth-status       | { isHidden }         | Current visibility state   |
| rate-limit-warning   | { remaining }        | Approaching rate limit     |


## AI Pipeline Flow

### Voice Pipeline
```
┌────────┐   ┌────────────┐   ┌──────────┐   ┌────────┐   ┌──────┐
│  User  │──▶│ MediaRec   │──▶│ WebM     │──▶│ Gemini │──▶│  UI  │
│ Speaks │   │ (Browser)  │   │ Buffer   │   │ Audio  │   │ Chat │
└────────┘   └────────────┘   └──────────┘   │ API    │   └──────┘
                                              └────────┘
```

### Screen Pipeline
```
┌────────┐   ┌────────────┐   ┌──────────┐   ┌────────┐   ┌──────┐
│ Screen │──▶│ desktopCap │──▶│ Base64   │──▶│ Gemini │──▶│  UI  │
│ Content│   │ (Electron) │   │ PNG      │   │ Vision │   │ Chat │
└────────┘   └────────────┘   └──────────┘   │ API    │   └──────┘
```

### Code Pipeline
```
┌────────┐   ┌────────────┐   ┌──────────┐   ┌────────┐   ┌──────┐
│ Code   │──▶│ Screenshot │──▶│ Code     │──▶│ Gemini │──▶│  UI  │
│ Problem│   │ + OCR      │   │ Prompt   │   │ + Code │   │ Chat │
└────────┘   └────────────┘   │ Template │   │ System │   │ Code │
                               └──────────┘   │ Prompt │   │ Block│
                                              └────────┘   └──────┘
```

## Stealth Architecture

### Layer 1: Electron Window Properties
- alwaysOnTop: true (type: 'screen-saver')
- skipTaskbar: true
- setContentProtection(true)          ← Key: invisible to capture APIs
- transparent: true
- frame: false
- hasShadow: false

### Layer 2: OS-Level Hiding
- BrowserWindow.hide()               ← Removes from window manager
- Not minimized (minimized windows can be detected)
- Physically removed from Alt+Tab cycle

### Layer 3: Emergency Protocol (Panic)
- globalShortcut registered at OS level
- Works even if renderer is frozen
- Sequence: Stop mic → Stop TTS → Clear memory → Hide window
- No temp files ever written to disk

### Layer 4: Anti-Detection
- No window title or identifiable process name
- No system tray icon with tooltip
- Randomized window class name
- No network fingerprint (HTTPS to Google's standard API endpoints)


## File Responsibility Map

| File               | Process   | Responsibility                          |
|--------------------|-----------|-----------------------------------------|
| main.js            | Main      | Window mgmt, IPC, stealth, shortcuts   |
| gemini-service.js  | Main      | ALL AI communication, model cascade    |
| preload.js         | Bridge    | Secure IPC channel exposure            |
| renderer.js        | Renderer  | UI logic, audio recording, TTS         |
| renderer.html      | Renderer  | DOM structure                          |
| styles.css         | Renderer  | Visual styling, animations             |


## Rate Limiting Strategy

```
Request Flow:
  User Action
       │
       ▼
  ┌─────────────┐    < 2sec since last?    ┌──────────┐
  │ Rate Limiter │──── YES ───────────────▶│  Queue   │
  │ (2s window)  │                          │ (wait)   │
  │              │──── NO ────┐             └──────────┘
  └─────────────┘             │
                              ▼
                    ┌──────────────────┐
                    │ gemini-2.5-flash │
                    └──────────────────┘
                              │
                    Success? ──┤
                    │          │
                   YES         NO (429/500/error)
                    │          │
                    ▼          ▼
              ┌────────┐  ┌──────────────────┐
              │ Return │  │ gemini-2.0-flash │
              │ Result │  │ (fallback)       │
              └────────┘  └──────────────────┘
                                   │
                         Success? ──┤
                         │          │
                        YES         NO
                         │          │
                         ▼          ▼
                   ┌────────┐  ┌─────────┐
                   │ Return │  │ Backoff │
                   │ Result │  │ + Retry │
                   └────────┘  └─────────┘
```

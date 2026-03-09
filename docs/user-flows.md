# User Flows — Invisibrain AI

## Flow 1: First-Time Setup

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Download     │────▶│ Create .env  │────▶│ Run          │
│ Application  │     │ (add API key)│     │ npm start    │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                                  ▼
                                          ┌──────────────┐
                                          │ App Appears  │
                                          │ (Floating,   │
                                          │  Draggable)  │
                                          └──────────────┘
```

### Steps
1. User downloads/clones the repository
2. Runs `npm install` to install dependencies
3. Creates `.env` file with `GEMINI_API_KEY=your_key_here`
4. Runs `npm start` to launch
5. App appears as a floating, frameless window
6. User drags it to preferred screen position

---

## Flow 2: Interview Voice Assistance

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ Interview│──▶│ Click 🎤 │──▶│ Speak /  │──▶│ Click 🎤 │
│ Starts   │   │ (Record) │   │ Listen   │   │ (Stop)   │
└──────────┘   └──────────┘   └──────────┘   └────┬─────┘
                                                   │
                                                   ▼
┌──────────┐   ┌──────────┐   ┌──────────────────────────┐
│ Glance   │◀──│ AI Shows │◀──│ Audio → Gemini →        │
│ at Answer│   │ Response │   │ Transcription + Answer   │
└──────────┘   └──────────┘   └──────────────────────────┘
                    │
                    ▼ (Optional)
              ┌──────────┐
              │ Click 🔊 │
              │ (TTS     │
              │  whisper) │
              └──────────┘
```

### User Experience
- App floats transparently on screen edge
- User clicks microphone, captures interviewer's question
- AI transcribes the audio AND provides an answer
- User glances at the response while maintaining eye contact
- Optionally clicks speaker for TTS playback (through earbuds)

---

## Flow 3: Coding Problem Solving

```
┌──────────────┐   ┌──────────┐   ┌──────────────────┐
│ See Coding   │──▶│ Click 📸 │──▶│ AI Captures      │
│ Problem on   │   │ (Screen) │   │ Screen Content    │
│ Screen       │   └──────────┘   └────────┬─────────┘
└──────────────┘                           │
                                           ▼
┌──────────────┐   ┌──────────────────────────────────┐
│ Copy/Type    │◀──│ AI Returns:                      │
│ Solution     │   │ • Problem understanding          │
└──────────────┘   │ • Code solution                  │
                   │ • Big-O complexity               │
                   │ • Edge cases                     │
                   └──────────────────────────────────┘
```

### User Experience
- User sees a coding problem (LeetCode, HackerRank, etc.)
- Clicks screenshot button
- AI captures the screen, detects it's a coding problem
- Automatically switches to code analysis mode
- Returns clean solution with complexity analysis
- User can copy and adapt the solution

---

## Flow 4: Resume Context Setup

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Click Resume │──▶│ Paste Resume │──▶│ Context Set  │
│ Button       │   │ / Background │   │ ✅ Active    │
└──────────────┘   └──────────────┘   └──────┬───────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │ All AI Responses  │
                                    │ Now Personalized  │
                                    │ to Your Experience│
                                    └──────────────────┘
```

### User Experience
- Before the interview starts, user clicks Resume button
- Pastes their resume, job description, or relevant context
- AI now tailors ALL responses to sound like the user
- Example: "Based on my 3 years at Google, I would approach this by..."

---

## Flow 5: Emergency Panic

```
┌──────────────────┐   ┌────────────────────────────┐
│ "Can you share   │──▶│ Press Ctrl+Alt+Shift+X     │
│  your screen?"   │   │ (PANIC BUTTON)             │
└──────────────────┘   └────────────┬───────────────┘
                                    │
                                    ▼ (< 100ms)
                    ┌────────────────────────────────┐
                    │ 1. Microphone stopped           │
                    │ 2. TTS stopped                  │
                    │ 3. Chat history cleared          │
                    │ 4. Resume context cleared        │
                    │ 5. Window hidden from OS         │
                    │ 6. NO traces remain              │
                    └────────────────────────────────┘
                                    │
                                    ▼
                    ┌────────────────────────────────┐
                    │ User safely shares screen       │
                    │ Nothing to find                  │
                    └────────────────────────────────┘
```

### Recovery
- After screen sharing ends: Press Ctrl+Alt+Shift+H to restore
- Resume context must be re-entered (by design: no persistence)
- Previous conversation is gone (by design: no evidence)

---

## Flow 6: Stealth Toggle

```
┌──────────────────┐          ┌──────────────────┐
│ App is Visible   │  Ctrl+   │ App is Hidden    │
│ (transparent,    │◀═Alt+══▶│ (completely       │
│  always-on-top)  │ Shift+H  │  invisible)      │
└──────────────────┘          └──────────────────┘
```

### States
| State    | Visible to User? | Visible to Screen Share? | In Taskbar? |
|----------|-----------------|-------------------------|-------------|
| Normal   | ✅               | ❌                       | ❌           |
| Hidden   | ❌               | ❌                       | ❌           |
| Panic    | ❌               | ❌                       | ❌           |

---

## Flow 7: Text Chat Interaction

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Type Question│──▶│ Press Enter  │──▶│ AI Responds  │
│ in Input     │   │ or Click Send│   │ in Chat UI   │
└──────────────┘   └──────────────┘   └──────────────┘
```

### User Experience
- User types a direct question
- Can be used alongside voice/screenshot for follow-ups
- Chat UI shows conversation with clear user/AI distinction
- Messages auto-scroll to latest response

# PRD — Product Requirements Document

## Features by Priority

### 🔴 P0 — Core MVP (Shipped ✅)

#### 1. Stealth Window System
- [x] Window invisible to screen-sharing (Zoom, Teams, Meet)
- [x] setContentProtection(true) enabled
- [x] skipTaskbar in stealth mode
- [x] Always-on-top with adjustable opacity
- [x] Draggable, resizable window
- [x] Frameless window (no OS chrome)
- [x] Ctrl+Alt+Shift+H → Physical hide from OS
- [x] Ctrl+Alt+Shift+X → Panic emergency vanish + data wipe

#### 2. Voice-to-AI Pipeline
- [x] One-click microphone recording (🎤 button)
- [x] MediaRecorder captures audio as WebM
- [x] Audio sent to Gemini for transcription + response
- [x] AI response displayed in chat-style UI
- [x] Auto-analyze on recording stop

#### 3. Screen Capture + AI Analysis
- [x] One-click screenshot (📸 button)
- [x] Captures underlying screen content (not the app itself)
- [x] Screenshot fed to Gemini vision for analysis
- [x] AI provides contextual response based on visible content

#### 4. AI Text-to-Speech Coach
- [x] 🔊 button reads AI response aloud
- [x] Natural browser voices (Web Speech API)
- [x] Smart chunking — splits markdown into sentences
- [x] Cleans code blocks and formatting before speaking

#### 5. Code Assist Mode
- [x] Specialized prompt for coding problems
- [x] Screenshot → instant code solution
- [x] Big-O complexity analysis included
- [x] Optimized for LeetCode/HackerRank style problems

#### 6. Resume & Context Awareness
- [x] Resume button to paste personal context
- [x] AI tailors all answers to user's experience
- [x] Maintains context across the session

#### 7. Agentic Model Cascade
- [x] Primary: gemini-2.5-flash
- [x] Fallback: gemini-2.0-flash on API error
- [x] Exponential backoff on rate limits
- [x] 2-second rate limit safety net
- [x] 1,500 daily request capacity

---

### 🟡 P1 — Next Release (v3.0)

#### 8. Multi-Monitor Awareness
- [ ] Detect which monitor has the interview
- [ ] Smart capture of the correct screen
- [ ] Position app on secondary monitor automatically

#### 9. Conversation Memory
- [ ] Remember previous Q&A within session
- [ ] Build interview narrative over time
- [ ] Detect repeated questions and vary answers

#### 10. Advanced Voice Features
- [ ] Continuous listening mode (auto-detect speech)
- [ ] Voice activity detection (start/stop automatically)
- [ ] Multiple language support
- [ ] Custom wake word ("Hey Brain")

#### 11. Smart Suggestions Engine
- [ ] Predict interviewer's next question
- [ ] Suggest follow-up talking points
- [ ] Behavioral interview (STAR method) templates

#### 12. Enhanced Cluely Suite
- [ ] 💡 Suggestions — real-time conversation predictions
- [ ] 📝 Notes — auto-compiled meeting notes
- [ ] 📊 Insights — tone/sentiment analysis
- [ ] 📋 Summary — post-session interview critique

---

### 🟢 P2 — Future Vision (v4.0+)

#### 13. Multi-Platform
- [ ] macOS build (.dmg)
- [ ] Linux build (.AppImage)
- [ ] ARM64 support (M1/M2 Macs)

#### 14. Model Flexibility
- [ ] Support OpenAI GPT-4o as alternative
- [ ] Support Claude as alternative
- [ ] Support local LLMs (Ollama) for offline mode
- [ ] User-selectable model in settings

#### 15. Team Features
- [ ] Shared context/resume templates
- [ ] Interview prep mode with practice questions
- [ ] Performance analytics across sessions

#### 16. Plugin System
- [ ] Custom prompt templates
- [ ] Company-specific knowledge bases
- [ ] Integration with job posting scrapers

---

## User Flows

### Flow 1: Interview Voice Assistance
Open app → App floats invisibly → Start interview →
Click 🎤 → Speak/let interviewer speak → Click 🎤 to stop →
AI analyzes and responds → Read answer → Click 🔊 for whisper

### Flow 2: Coding Problem Solving
See coding problem on screen → Click 📸 →
AI captures screen → Detects it's code → Switches to code mode →
Returns solution with explanation + Big-O → Copy solution

### Flow 3: Resume-Contextualized Response
Before interview → Click Resume button → Paste resume/context →
AI now personalizes all responses to match your experience →
Start interview → Every answer sounds authentically "you"

### Flow 4: Emergency Panic
Interviewer says "Can you share your screen?" →
Press Ctrl+Alt+Shift+X →
App clears all data + stops mic + stops TTS + hides window →
Nothing visible, no traces

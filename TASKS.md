# TASKS — Development Roadmap

## ✅ Phase 1: Foundation (COMPLETE)
- [x] Initialize Electron project
- [x] Create frameless, transparent window
- [x] Set up main/renderer/preload architecture
- [x] Implement basic IPC communication
- [x] Create dark glassmorphism UI
- [x] Add window dragging and resizing
- [x] Configure .env for API keys

## ✅ Phase 2: Core AI Pipeline (COMPLETE)
- [x] Integrate Gemini API via gemini-service.js
- [x] Implement text query → AI response
- [x] Add screen capture via desktopCapturer
- [x] Feed screenshots to Gemini Vision
- [x] Build voice recording with MediaRecorder
- [x] Send audio to Gemini for transcription + response
- [x] Create code analysis mode with specialized prompts

## ✅ Phase 3: Stealth System (COMPLETE)
- [x] Enable setContentProtection(true)
- [x] Set skipTaskbar: true
- [x] Implement Ctrl+Alt+Shift+H physical hide
- [x] Implement Ctrl+Alt+Shift+X panic vanish
- [x] Remove all window identifiers
- [x] Test against Zoom, Teams, Meet screen sharing

## ✅ Phase 4: V2 Architecture (COMPLETE)
- [x] Implement model cascade (2.5-flash → 2.0-flash)
- [x] Add exponential backoff on rate limits
- [x] Add 2-second rate limit safety net
- [x] Remove all Python/Whisper/Vosk dead code (250+ lines)
- [x] Add resume/context awareness
- [x] Implement TTS with smart chunking
- [x] Add AI Coach (speaker button)

## 🔄 Phase 5: Cluely Suite Enhancement (IN PROGRESS)
- [ ] 💡 Suggestions panel — predict next talking points
- [ ] 📝 Notes panel — auto-compile meeting notes
- [ ] 📊 Insights panel — conversational analytics
- [ ] 📋 Summary panel — post-session critique
- [ ] Tab-based UI for switching between panels
- [ ] Keyboard shortcuts for each panel

## 📋 Phase 6: Voice Intelligence (PLANNED)
- [ ] Continuous listening mode
- [ ] Voice activity detection (auto start/stop)
- [ ] Multi-language support (Spanish, Hindi, etc.)
- [ ] Speaker diarization (who said what)
- [ ] Custom wake word system

## 📋 Phase 7: Multi-Model Support (PLANNED)
- [ ] Settings panel for model selection
- [ ] OpenAI GPT-4o integration
- [ ] Anthropic Claude integration
- [ ] Ollama local model support (offline mode)
- [ ] Model performance comparison metrics

## 📋 Phase 8: Multi-Platform (PLANNED)
- [ ] macOS build configuration
- [ ] macOS stealth testing
- [ ] Linux build configuration
- [ ] ARM64 builds for M1/M2
- [ ] Auto-updater system
- [ ] Code signing certificates

## 📋 Phase 9: Polish & Production (PLANNED)
- [ ] Error boundary system
- [ ] Crash recovery (auto-restart)
- [ ] Usage analytics (opt-in, local only)
- [ ] Onboarding tutorial overlay
- [ ] Settings persistence
- [ ] Custom themes
- [ ] Performance profiling & optimization

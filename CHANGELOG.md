# CHANGELOG

## [v2.0] — Current Release
### Added
- Agentic model cascade (2.5-flash → 2.0-flash)
- Physical window hide (Ctrl+Alt+Shift+H)
- 1,500 daily request capacity
- Sub-500ms latency with rate limiter

### Removed
- 250+ lines of dead Python subprocess code
- Vosk dependency
- Whisper dependency
- Legacy flash-lite endpoints

### Fixed
- Rate limiting causing 429 errors
- Window appearing in Alt+Tab during stealth

## [v1.0] — Initial Release
### Added
- Core stealth window system
- Voice-to-AI pipeline (MediaRecorder → Gemini)
- Screen capture + AI analysis
- Code assist mode
- Resume context awareness
- AI Coach TTS
- Panic button (Ctrl+Alt+Shift+X)
- Glassmorphism dark UI

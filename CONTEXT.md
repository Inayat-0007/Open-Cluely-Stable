# CONTEXT — What AI Must Know

## Project Identity
- Name: Invisibrain AI (formerly Open-Cluely)
- Inspired by: Parakeet AI / Cluely
- Open source: YES
- Creator: Muhammad Inayat (Inayat-0007)
- License: Open source
- Repository: github.com/Inayat-0007/Open-Cluely-Stable

## Critical Domain Knowledge

### Screen Sharing Detection
- Zoom, Teams, and Meet use OS-level APIs to enumerate windows
- Windows: `PrintWindow`, `BitBlt`, `Desktop Duplication API`
- Electron's `setContentProtection(true)` tells the OS to
  exclude this window from capture APIs
- This is NOT a hack — it's the same API used by DRM video players
- It works because the OS respects the flag at the compositor level

### Gemini API Specifics
- Free tier: 15 RPM (requests per minute) for flash models
- Daily limit varies: ~1,500 for 2.5-flash
- Audio input: Gemini accepts inline audio data (base64 WebM)
- Vision input: Gemini accepts inline image data (base64 PNG/JPEG)
- Multimodal: Can send audio + image + text in single request
- API Key: Single key, no OAuth needed for free tier

### MediaRecorder API
- Available in Electron's Chromium renderer process
- Records audio as WebM/Opus by default
- Must request microphone permission
- Audio chunks collected in array, combined into Blob on stop
- Blob → ArrayBuffer → Base64 for Gemini API

### Web Speech API (TTS)
- `speechSynthesis.speak()` available in renderer
- Voices loaded asynchronously — must wait for `voiceschanged` event
- Chrome/Electron has built-in voices, quality varies
- Long text must be chunked (browser cancels speech > ~200 chars)
- Our chunking: split by sentence, clean markdown, queue sequentially

## User Behavior Patterns
- Users launch app BEFORE joining the meeting/interview
- App sits transparently on screen edge during the session
- Quick glances at AI responses while maintaining eye contact
- Voice input used during "thinking pauses" in conversation
- Screenshot used when visual content needs analysis
- Panic button used if asked to share screen unexpectedly

## Performance Constraints
- Interview context = high stress = app CANNOT lag or crash
- Every extra second of latency = awkward silence for user
- Memory leaks = crash during 2-hour session = disaster
- App must work on mediocre hardware (8GB RAM, integrated GPU)

## Ethical Considerations
- README states: "Always use stealth AI responsibly"
- Tool is for assistance, not replacement of knowledge
- Similar to having notes during an open-book exam
- Users are responsible for following their organization's policies

# AI Pipeline — Technical Documentation

## Overview
Invisibrain AI uses Google Gemini as its sole AI backend, with a
cascade architecture that ensures reliability during live sessions.

## Model Cascade

```
User Request
     │
     ▼
┌─────────────────┐
│ Rate Limiter     │ ← Enforces 2-second minimum between requests
│ (2s cooldown)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ gemini-2.5-flash │ ← Primary model (fastest, smartest)
│ (Primary)        │
└────────┬────────┘
         │
    Success? ──── YES ──▶ Return Response
         │
         NO (429 / 500 / timeout)
         │
         ▼
┌─────────────────┐
│ gemini-2.0-flash │ ← Fallback model
│ (Fallback)       │
└────────┬────────┘
         │
    Success? ──── YES ──▶ Return Response (with fallback notice)
         │
         NO
         │
         ▼
┌─────────────────┐
│ Exponential      │
│ Backoff + Retry  │ ← Wait 1s, 2s, 4s... then retry primary
└─────────────────┘
```

## Input Types

### 1. Text Input
- User types a question in the input field
- Sent via `process-text` IPC channel
- Includes resume context if set
- System prompt tailored for interview assistance

### 2. Audio Input
- MediaRecorder captures user's microphone
- Audio encoded as WebM/Opus
- Sent as base64 inline data to Gemini
- Gemini transcribes AND responds in one call
- System prompt: "Transcribe this audio and provide a helpful response"

### 3. Screenshot Input
- `desktopCapturer.getSources()` captures screen
- Image resized to max 1920x1080
- Sent as base64 PNG inline data to Gemini Vision
- System prompt depends on detected content type:
  - Code detected → code analysis prompt
  - General content → contextual analysis prompt

### 4. Code Analysis Input
- Triggered when screenshot detects code/programming content
- Or manually via code assist button
- Specialized system prompt requesting:
  - Problem understanding
  - Solution with explanation
  - Time/space complexity (Big-O)
  - Edge cases
  - Alternative approaches

## System Prompts

### General Assistant Prompt
```
You are a helpful AI assistant providing real-time support.
Be concise but thorough. Format responses clearly.
If the user has provided resume context, tailor your
responses to match their experience level and background.
```

### Code Analysis Prompt
```
You are an expert competitive programmer and software engineer.
Analyze the coding problem shown in this screenshot.
Provide:
1. Problem understanding (2-3 sentences)
2. Optimal solution with clear code
3. Time complexity: O(?)
4. Space complexity: O(?)
5. Key edge cases to handle
Use the language that appears in the problem or default to Python.
```

### Audio Transcription + Response Prompt
```
You will receive an audio recording. Please:
1. Transcribe what was said
2. Provide a helpful, interview-appropriate response
3. Keep the response concise (under 200 words)
4. If it sounds like an interview question, answer it directly
```

## Rate Limiting Implementation

```javascript
const RATE_LIMIT_MS = 2000; // Minimum 2 seconds between requests
let lastRequestTime = 0;

async function waitForRateLimit() {
    const now = Date.now();
    const elapsed = now - lastRequestTime;
    if (elapsed < RATE_LIMIT_MS) {
        const waitTime = RATE_LIMIT_MS - elapsed;
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    lastRequestTime = Date.now();
}
```

## Error Handling Strategy

| Error Code | Meaning              | Action                              |
|-----------|----------------------|-------------------------------------|
| 429       | Rate limited         | Switch to fallback model            |
| 500       | Server error         | Retry with exponential backoff      |
| 503       | Service unavailable  | Retry after 5 seconds               |
| 400       | Bad request          | Log error, show user message        |
| 403       | API key invalid      | Show "check API key" message        |
| Timeout   | No response in 30s   | Switch to fallback, then retry      |

## Performance Benchmarks (Target)

| Pipeline        | Target Latency | Measured  |
|----------------|---------------|-----------|
| Text → Response | < 1.5s        | ~1.2s     |
| Audio → Response| < 3.0s        | ~2.5s     |
| Screen → Response| < 3.0s       | ~2.8s     |
| Code → Solution | < 5.0s        | ~4.0s     |
| Panic → Hidden  | < 100ms       | ~50ms     |

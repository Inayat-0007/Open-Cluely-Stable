# AVOID — Anti-Patterns for Invisibrain AI

## Architecture Anti-Patterns
❌ NEVER use nodeIntegration: true in BrowserWindow
❌ NEVER expose Node.js APIs directly to renderer
❌ NEVER put API keys in renderer-accessible code
❌ NEVER use `eval()` or `new Function()` anywhere
❌ NEVER load remote/untrusted URLs in the main window
❌ NEVER use `shell.openExternal()` without URL validation

## Stealth Anti-Patterns
❌ NEVER set a recognizable window title ("Invisibrain", "AI Assistant")
❌ NEVER create visible system tray notifications
❌ NEVER write any files to disk (logs, temp files, cache)
❌ NEVER use OS notification APIs
❌ NEVER emit sounds through system audio (only ear-directed TTS)
❌ NEVER create child windows that might be captured
❌ NEVER use showInactive() — it can flash on screen capture

## Performance Anti-Patterns
❌ NEVER make synchronous IPC calls (use invoke/handle)
❌ NEVER block the main process with heavy computation
❌ NEVER store full conversation history in memory (cap at 50 messages)
❌ NEVER send screenshots larger than 1920x1080 to API
❌ NEVER retry failed API calls more than 3 times
❌ NEVER use setInterval for polling (use event-driven architecture)

## Code Anti-Patterns
❌ NEVER use var (always const/let)
❌ NEVER use .then() chains (use async/await)
❌ NEVER leave console.log in production code
❌ NEVER use magic numbers (define constants)
❌ NEVER catch errors silently (always log or handle)
❌ NEVER import entire libraries when you need one function

## Technology Anti-Patterns
❌ NEVER add Python as a dependency (was removed for a reason)
❌ NEVER add heavy frameworks (React, Vue, Angular) — vanilla is intentional
❌ NEVER add a database — privacy by design means no persistence
❌ NEVER add Webpack/Vite — electron-builder is sufficient
❌ NEVER add testing frameworks that require browser automation
   (they conflict with stealth window settings)

## API Anti-Patterns
❌ NEVER send requests faster than 1 per 2 seconds
❌ NEVER send audio longer than 60 seconds in one chunk
❌ NEVER send screenshots without resizing to reasonable dimensions
❌ NEVER include system prompts that mention "cheating" or "interview"
   in API calls (could trigger content filters)
❌ NEVER hardcode model names — always use constants for easy cascade

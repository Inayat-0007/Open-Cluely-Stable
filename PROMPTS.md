# PROMPTS — AI Coding Assistant Templates

## Starting a New Feature
```
I'm working on Invisibrain AI (stealth interview assistant built with Electron).

Read these files for context:
- PROJECT_BRIEF.md for what we're building
- ARCHITECTURE.md for system design
- RULES in .cursorrules for coding standards
- AVOID.md for what NOT to do

Now build: [FEATURE NAME]
Requirements from PRD.md:
[paste relevant section]

Follow the IPC pattern: renderer → preload → main → service
Update TASKS.md when complete.
```

## Fixing a Bug
```
Bug in Invisibrain AI:

**File:** [filename]
**Expected:** [what should happen]
**Actual:** [what happens instead]
**Steps to reproduce:** [1, 2, 3...]

Rules:
- Don't change any stealth-related code
- Don't modify IPC channel names
- Don't add new dependencies
- Show me the minimal diff
```

## Adding to Gemini Service
```
Modify gemini-service.js to add: [description]

Current cascade: gemini-2.5-flash → gemini-2.0-flash
Maintain the cascade pattern.
Maintain the 2-second rate limiter.
Maintain error handling with exponential backoff.
Follow the existing function naming pattern.
Add JSDoc comments.
```

## UI Changes
```
Modify the UI in renderer.html + styles.css:
[description of change]

Rules:
- Keep glassmorphism dark theme
- Keep the window frameless and draggable
- Ensure all buttons have hover states
- No framework additions — vanilla HTML/CSS/JS only
- Test that the change doesn't break stealth
  (no new window layers or overlays)
```

## Performance Optimization
```
Optimize [component/function] in Invisibrain AI.

Current performance: [metric]
Target performance: [metric]

Constraints:
- Cannot break stealth features
- Cannot add new dependencies
- Cannot change IPC channel contracts
- Must work on 8GB RAM machines
- Profile before and after
```

## Pre-Release Checklist Prompt
```
I'm preparing Invisibrain AI for release.
Run through this checklist and identify any issues:

1. All IPC channels have error handling?
2. No console.log statements in production paths?
3. No API key exposure in renderer process?
4. setContentProtection(true) is enabled?
5. Panic button clears ALL state?
6. Rate limiter is active?
7. Model cascade is working?
8. Memory leaks in long sessions?
9. Audio recording properly stops on panic?
10. TTS properly stops on panic?

Review these files: main.js, renderer.js, gemini-service.js, preload.js
```

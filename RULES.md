# RULES — Coding Standards for Invisibrain AI

## General Principles
1. **Security First** — Every decision must consider stealth and privacy implications
2. **Performance Critical** — This app runs during live interviews; latency = failure
3. **Simplicity Over Cleverness** — Code must be readable by any JS developer
4. **Zero Dependencies Where Possible** — Every dependency is an attack surface

## JavaScript Standards

### ES2022+ Features (Use These)
- `const` / `let` (NEVER `var`)
- `async` / `await` (NEVER `.then()` chains)
- Optional chaining (`?.`)
- Nullish coalescing (`??`)
- Template literals (backticks)
- Destructuring assignment
- Arrow functions for callbacks
- `for...of` loops (NEVER `for...in` for arrays)

### Function Rules
- Maximum 40 lines per function
- Single responsibility per function
- Always return early on error conditions
- Always use descriptive parameter names
- Default parameters over `undefined` checks

### Error Handling
- Always wrap async operations in `try/catch`
- Never swallow errors silently
- Log errors with context (file, function, input summary)
- In production: structured error objects, not console.log
- Renderer errors → show user-friendly message in UI
- Main process errors → log + attempt recovery

### Comments & Documentation
- JSDoc for all exported/public functions
- Inline comments for "why", not "what"
- TODO comments must include author and date
- No commented-out code blocks (use git history)

## File Organization
- One concern per file (separation of concerns)
- Max 400 lines per file (split if larger)
- Imports at top, exports at bottom
- Constants defined before functions
- Group related functions together

## IPC Communication Rules
- All IPC channel names are `kebab-case`
- All IPC handlers use `invoke/handle` (not `send/on`)
- All IPC payloads are plain objects (serializable)
- Never pass Buffer/Blob directly — convert to base64
- Always validate incoming IPC data in main process

## CSS Standards
- Use CSS custom properties (variables) for theming
- Mobile-first is NOT required (desktop-only app)
- Use `rem` for font sizes, `px` for borders/shadows
- Transitions: max 300ms, ease-out curve
- No `!important` unless overriding third-party
- Class names in `kebab-case`

## Git Practices
- Commit messages follow conventional commit format
- One logical change per commit
- Never commit `.env` or API keys
- Never commit `node_modules/`
- Always test stealth features before pushing

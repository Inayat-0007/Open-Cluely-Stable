# TECH STACK — Invisibrain AI

## Core Platform
| Category        | Choice              | Why                                      |
|----------------|---------------------|------------------------------------------|
| Runtime        | Electron 28+        | Desktop app with OS-level window control |
| Language       | JavaScript (ES2022) | Team expertise, rapid iteration          |
| Node Version   | 18+                 | Native fetch, stable APIs                |
| Package Manager| npm                 | Standard, reliable                       |

## AI & Voice Pipeline
| Category        | Choice                    | Why                                  |
|----------------|---------------------------|--------------------------------------|
| AI Model       | Gemini 2.5 Flash (primary)| Fast, 1500 req/day free tier         |
| Fallback Model | Gemini 2.0 Flash          | Automatic cascade on errors          |
| AI SDK         | @google/generative-ai     | Official, maintained                 |
| Voice Capture  | MediaRecorder API         | Zero dependencies, browser-native    |
| Audio Format   | WebM/Opus                 | Small size, fast upload              |
| TTS            | Web Speech API            | Zero dependencies, natural voices    |

## Stealth & Security
| Category        | Choice                    | Why                                  |
|----------------|---------------------------|--------------------------------------|
| Window Stealth | Electron BrowserWindow    | setContentProtection, skipTaskbar    |
| IPC Security   | contextBridge + preload   | Secure main↔renderer communication  |
| Key Storage    | dotenv + .env file        | API key never in source code         |
| Panic System   | globalShortcut API        | OS-level hotkey, works even if frozen|

## UI & Styling
| Category        | Choice              | Why                                      |
|----------------|---------------------|------------------------------------------|
| UI Framework   | Vanilla HTML/CSS/JS | Minimal footprint, no framework bloat    |
| Design System  | Custom glassmorphism| Sleek, modern, dark-mode native          |
| Icons          | Emoji + Unicode     | Zero asset dependencies                  |
| Animations     | CSS transitions     | GPU-accelerated, smooth                  |

## Build & Distribution
| Category        | Choice              | Why                                      |
|----------------|---------------------|------------------------------------------|
| Bundler        | electron-builder    | Reliable .exe packaging                  |
| Target         | Windows x64         | Primary user base                        |
| Future Targets | macOS, Linux        | v3.0 expansion                           |
| Auto-Update    | Not yet             | v3.0 feature                             |

## NOT Using (Intentional)
| Technology     | Why NOT                                          |
|---------------|--------------------------------------------------|
| TypeScript    | Overhead not justified for this project size      |
| React/Vue     | Unnecessary framework weight for single-page UI   |
| Python/Whisper| Eliminated — was bloating build by 200MB+         |
| Vosk          | Eliminated — replaced by Gemini native audio      |
| Webpack       | Electron-builder handles everything               |
| Database      | No persistent storage needed (privacy by design)  |

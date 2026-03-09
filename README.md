<div align="center">

# 🧠 Invisibrain AI (Open-Cluely Stable)

**A physics-level stealth desktop AI assistant that listens, sees your screen, and whispers real-time answers during interviews, meetings, and coding exams — completely invisible to screen-sharing tools.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-28.0+-4B32C3?logo=electron&logoColor=white)](#)
[![Google Gemini API](https://img.shields.io/badge/Powered_by-Gemini_2.5_Flash-4285F4?logo=google&logoColor=white)](#)

[Features](#-key-features) • [Installation](#-installation) • [How It Works](#-how-it-works-stealth-architecture) • [Usage](#-usage-guide) • [Disclaimer](#-ethical-disclaimer)

</div>

<br>

## 🌟 Why Invisibrain AI?

Online interviews create high-pressure situations where candidates freeze despite knowing the material. Meeting participants miss key points. Coding exam candidates need instant algorithmic guidance.

Current AI tools (ChatGPT, browser extensions) are **VISIBLE** to screen-sharing and proctoring software.
**Invisibrain AI** combines Voice + Screen + Code + AI in one package with **100% stealth architecture**, guaranteeing it remains completely invisible to Zoom, Teams, Google Meet, and screen recording software.

---

## ⚡ Key Features

- 👻 **Physics-Level Stealth**: Uses OS-level compositing tricks (`setContentProtection`) to remain invisible to screen-share software. No hacks, just native DRM-level protection.
- 🎙️ **Real-Time Voice Assistant**: Click the mic, speak (or let the interviewer speak), and get under-500ms AI responses via Gemini.
- 📸 **Screen Capture & Code Solving**: One-click screen detection. Identify a LeetCode problem, and the AI gives you the optimal solution + Big-O complexity in seconds.
- 📄 **Resume Context Injection**: Paste your resume before the interview. All AI answers are personalized to specifically match your actual career experience.
- 🗣️ **AI Whisper Coach**: Text-to-Speech integration via Web Speech API reads the AI's responses directly into your earpiece.
- 🚨 **Emergency Panic Button**: Press `Ctrl+Alt+Shift+X`. In less than 100ms, all data is wiped from RAM, mic stops, window vanishes. **Zero traces.**

---

## 🚀 Installation

**Prerequisites:** You need [Node.js v18+](https://nodejs.org/) installed. No Python, no Whisper, no complex local LLMs needed.

### 1. Clone the Repository
```bash
git clone https://github.com/Inayat-0007/Open-Cluely-Stable.git
cd Open-Cluely-Stable
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Gemini API Key
Get your free API key from [Google AI Studio](https://aistudio.google.com/apikey) (allows 1,500 daily requests free).
Create a `.env` file in the root directory and add your key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run the Application
```bash
npm start
```

---

## 🕵️ How It Works (Stealth Architecture)

**How is it invisible to Zoom/Teams?**
Modern operating systems use a compositor to manage window rendering. When a screen-sharing app captures the screen, it asks the compositor for a bitmap. Invisibrain uses an OS-native flag (`setContentProtection` in Electron / `WDA_EXCLUDEFROMCAPTURE` on Windows) which tells the compositor to render the app as a **black rectangle or purely omit it** in captured outputs. This is exactly how Netflix prevents you from screenshotting movies.

* **Layer 1:** Content Protection — Invisible to capture APIs.
* **Layer 2:** Window Properties — `skipTaskbar: true`, frameless, transparent, `alwaysOnTop: true` (screen-saver z-index).
* **Layer 3:** Physical Hide (`Ctrl+Alt+Shift+H`) — Fully removes the window manager record.
* **Layer 4:** In-Memory Only — Zero files written to disk during a session. No cache, no saved history.

---

## 💻 Usage Guide

### Core Shortcuts
| Shortcut | Action | Description |
|---|---|---|
| `Ctrl+Alt+Shift+H` | **Toggle Stealth** | Hide/Show the application window physically. |
| `Ctrl+Alt+Shift+X` | **Panic Vanish** | **Emergency wipe.** Stops mic, stops TTS, clears chat, clears memory, and hides the app instantly. |

### The Flow
1. **Launch Before the Meeting**: Start the app and move the floating UI to a comfortable spot on your screen.
2. **Contextualize (📄 Button)**: Paste your resume or job description so the AI knows who you are.
3. **Listen (🎤 Button)**: Start the mic when the interviewer asks a question. Stop it when they finish. Read the AI's tailored response.
4. **Code (💻 / 📸 Button)**: If handed a coding screen, click the code button to capture the screen and get an instant algorithmic breakdown.

---

## 👨‍💻 About the Creator

**Created by [Muhammad Inayat (Inayat-0007)](https://github.com/Inayat-0007)**
Passionate software engineer building robust, architecture-first applications. 
Check out my [GitHub Profile](https://github.com/Inayat-0007) for more bleeding-edge open-source software, AI integrations, and experimental web architecture.

---

## ⚠️ Ethical Disclaimer

> **Invisibrain AI is an open-source educational tool.**
>
> This tool is intended for personal interviewing assistance, role-play preparation, acting as a "smart notepad", or assisting individuals with severe test anxiety to present their actual capabilities.
> 
> **You are solely responsible** for adhering to the terms of service, policies, and honor codes of any platform, company, or educational institution you interact with. The creator strongly advises against using this for outright academic deception. Use responsibly.

/**
 * Invisibrain AI — Renderer Process
 * 
 * Handles all UI interactions, audio recording via MediaRecorder,
 * text-to-speech via Web Speech API, and chat display.
 * 
 * SECURITY: No Node.js APIs available. All main process
 * communication goes through window.electronAPI (preload bridge).
 * 
 * @module renderer
 */

// ============================================================
// Constants
// ============================================================

const MAX_MESSAGES = 50;       // Cap chat history to prevent memory leaks
const MAX_AUDIO_MS = 60000;    // Maximum 60 seconds of recording
const TTS_CHUNK_SIZE = 200;    // Max characters per TTS utterance

// ============================================================
// State
// ============================================================

let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];
let recordingTimeout = null;
let isSpeaking = false;
let resumeContext = '';
let messageCount = 0;

// ============================================================
// DOM Elements
// ============================================================

const chatContainer = document.getElementById('chat-container');
const textInput = document.getElementById('text-input');
const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');
const screenBtn = document.getElementById('screen-btn');
const codeBtn = document.getElementById('code-btn');
const speakBtn = document.getElementById('speak-btn');
const resumeBtn = document.getElementById('resume-btn');
const statusIndicator = document.getElementById('status-indicator');
const dragHandle = document.getElementById('drag-handle');

// ============================================================
// Window Dragging
// ============================================================

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

if (dragHandle) {
    dragHandle.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragStartX = e.screenX;
        dragStartY = e.screenY;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const deltaX = e.screenX - dragStartX;
        const deltaY = e.screenY - dragStartY;

        window.electronAPI.send('window-drag', { x: deltaX, y: deltaY });

        dragStartX = e.screenX;
        dragStartY = e.screenY;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

// ============================================================
// Chat Display
// ============================================================

/**
 * Adds a message to the chat display.
 * @param {string} text - Message content (supports markdown-like formatting)
 * @param {string} sender - 'user' or 'ai'
 * @param {string} [type='text'] - Message type for styling
 */
function addMessage(text, sender, type = 'text') {
    // Enforce message cap
    if (messageCount >= MAX_MESSAGES) {
        const firstMessage = chatContainer.querySelector('.message');
        if (firstMessage) {
            firstMessage.remove();
            messageCount--;
        }
    }

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `message-${sender}`);

    if (type !== 'text') {
        messageDiv.classList.add(`message-${type}`);
    }

    // Format the text (basic markdown-like rendering)
    messageDiv.innerHTML = formatMessage(text);

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    messageCount++;

    return messageDiv;
}

/**
 * Formats message text with basic markdown support.
 * @param {string} text - Raw message text
 * @returns {string} HTML-formatted text
 */
function formatMessage(text) {
    let formatted = text;

    // Code blocks (triple backtick)
    formatted = formatted.replace(/```(\w*)\n?([\s\S]*?)```/g,
        '<pre><code class="language-$1">$2</code></pre>');

    // Inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
}

/**
 * Shows a status message in the chat (system message).
 * @param {string} text - Status text
 */
function showStatus(text) {
    const statusDiv = document.createElement('div');
    statusDiv.classList.add('message', 'message-status');
    statusDiv.textContent = text;
    chatContainer.appendChild(statusDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * Clears all messages from the chat.
 */
function clearChat() {
    chatContainer.innerHTML = '';
    messageCount = 0;
}

// ============================================================
// Text Input
// ============================================================

if (sendBtn) {
    sendBtn.addEventListener('click', sendTextMessage);
}

if (textInput) {
    textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendTextMessage();
        }
    });
}

/**
 * Sends the text input to the AI via IPC.
 */
async function sendTextMessage() {
    const text = textInput?.value?.trim();
    if (!text) return;

    addMessage(text, 'user');
    textInput.value = '';
    setLoading(true);

    try {
        await window.electronAPI.invoke('process-text', {
            text,
            context: resumeContext,
        });
    } catch (error) {
        addMessage(`Error: ${error.message}`, 'ai', 'error');
    } finally {
        setLoading(false);
    }
}

// ============================================================
// Audio Recording (MediaRecorder)
// ============================================================

if (micBtn) {
    micBtn.addEventListener('click', toggleRecording);
}

/**
 * Toggles audio recording on/off.
 */
async function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        await startRecording();
    }
}

/**
 * Starts audio recording via MediaRecorder API.
 */
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 16000,
            },
        });

        mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm;codecs=opus',
        });

        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = async () => {
            // Combine chunks into a single blob
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

            // Convert to base64
            const arrayBuffer = await audioBlob.arrayBuffer();
            const base64Audio = btoa(
                String.fromCharCode(...new Uint8Array(arrayBuffer))
            );

            // Send to main process for AI analysis
            addMessage('🎤 Audio recorded, analyzing...', 'user', 'audio');
            setLoading(true);

            try {
                await window.electronAPI.invoke('process-audio', {
                    audioBuffer: base64Audio,
                });
            } catch (error) {
                addMessage(`Audio processing error: ${error.message}`, 'ai', 'error');
            } finally {
                setLoading(false);
            }

            // Clean up stream
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        isRecording = true;
        micBtn.classList.add('recording');
        micBtn.textContent = '⏹️';

        // Auto-stop after MAX_AUDIO_MS
        recordingTimeout = setTimeout(() => {
            if (isRecording) {
                stopRecording();
            }
        }, MAX_AUDIO_MS);

    } catch (error) {
        addMessage(`Microphone error: ${error.message}`, 'ai', 'error');
    }
}

/**
 * Stops audio recording.
 */
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }

    isRecording = false;
    micBtn?.classList.remove('recording');
    if (micBtn) micBtn.textContent = '🎤';

    if (recordingTimeout) {
        clearTimeout(recordingTimeout);
        recordingTimeout = null;
    }
}

// ============================================================
// Screen Capture
// ============================================================

if (screenBtn) {
    screenBtn.addEventListener('click', captureScreen);
}

/**
 * Requests a screen capture from the main process.
 */
async function captureScreen() {
    addMessage('📸 Capturing screen...', 'user', 'screenshot');
    setLoading(true);

    try {
        await window.electronAPI.invoke('capture-screen');
    } catch (error) {
        addMessage(`Screenshot error: ${error.message}`, 'ai', 'error');
    } finally {
        setLoading(false);
    }
}

// ============================================================
// Code Analysis
// ============================================================

if (codeBtn) {
    codeBtn.addEventListener('click', analyzeCode);
}

/**
 * Captures screen and sends for code analysis.
 */
async function analyzeCode() {
    addMessage('💻 Analyzing code on screen...', 'user', 'code');
    setLoading(true);

    try {
        // Capture screen first, then send for code analysis
        await window.electronAPI.invoke('capture-screen');
    } catch (error) {
        addMessage(`Code analysis error: ${error.message}`, 'ai', 'error');
    } finally {
        setLoading(false);
    }
}

// ============================================================
// Text-to-Speech (Web Speech API)
// ============================================================

if (speakBtn) {
    speakBtn.addEventListener('click', toggleSpeech);
}

/**
 * Toggles TTS for the last AI message.
 */
function toggleSpeech() {
    if (isSpeaking) {
        stopSpeech();
    } else {
        speakLastResponse();
    }
}

/**
 * Speaks the last AI response using Web Speech API.
 */
function speakLastResponse() {
    const lastAiMessage = chatContainer.querySelector('.message-ai:last-child');
    if (!lastAiMessage) return;

    const text = lastAiMessage.textContent || '';
    if (!text) return;

    // Clean text for speech
    const cleanedText = cleanTextForSpeech(text);

    // Split into chunks for reliable playback
    const chunks = splitIntoChunks(cleanedText);

    isSpeaking = true;
    speakBtn?.classList.add('speaking');
    if (speakBtn) speakBtn.textContent = '🔇';

    speakChunks(chunks, 0);
}

/**
 * Cleans text by removing code blocks and markdown for TTS.
 * @param {string} text - Raw text
 * @returns {string} Cleaned text suitable for speech
 */
function cleanTextForSpeech(text) {
    return text
        .replace(/<pre><code[^>]*>[\s\S]*?<\/code><\/pre>/g, 'Code block omitted.')
        .replace(/<[^>]+>/g, '')
        .replace(/```[\s\S]*?```/g, 'Code block omitted.')
        .replace(/`[^`]+`/g, '')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/#+ /g, '')
        .replace(/\n+/g, '. ')
        .trim();
}

/**
 * Splits text into chunks that are safe for Web Speech API.
 * @param {string} text - Cleaned text
 * @returns {string[]} Array of text chunks
 */
function splitIntoChunks(text) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks = [];
    let current = '';

    for (const sentence of sentences) {
        if ((current + sentence).length > TTS_CHUNK_SIZE) {
            if (current) chunks.push(current.trim());
            current = sentence;
        } else {
            current += sentence;
        }
    }

    if (current.trim()) {
        chunks.push(current.trim());
    }

    return chunks;
}

/**
 * Sequentially speaks text chunks.
 * @param {string[]} chunks - Text chunks to speak
 * @param {number} index - Current chunk index
 */
function speakChunks(chunks, index) {
    if (index >= chunks.length || !isSpeaking) {
        stopSpeech();
        return;
    }

    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    utterance.onend = () => {
        speakChunks(chunks, index + 1);
    };

    utterance.onerror = () => {
        speakChunks(chunks, index + 1);
    };

    speechSynthesis.speak(utterance);
}

/**
 * Stops all speech synthesis.
 */
function stopSpeech() {
    speechSynthesis.cancel();
    isSpeaking = false;
    speakBtn?.classList.remove('speaking');
    if (speakBtn) speakBtn.textContent = '🔊';
}

// ============================================================
// Resume / Context
// ============================================================

if (resumeBtn) {
    resumeBtn.addEventListener('click', showResumeModal);
}

/**
 * Shows a prompt for the user to enter their resume/context.
 */
function showResumeModal() {
    const existingModal = document.getElementById('resume-modal');
    if (existingModal) {
        existingModal.remove();
        return;
    }

    const modal = document.createElement('div');
    modal.id = 'resume-modal';
    modal.classList.add('modal-overlay');
    modal.innerHTML = `
        <div class="modal-content">
            <h3>📄 Set Your Context</h3>
            <p>Paste your resume, job description, or any context.
               AI will personalize all responses to match.</p>
            <textarea id="resume-textarea" placeholder="Paste your resume or context here..."
                      rows="8">${resumeContext}</textarea>
            <div class="modal-actions">
                <button id="resume-save" class="btn-primary">Save Context</button>
                <button id="resume-clear" class="btn-secondary">Clear</button>
                <button id="resume-close" class="btn-secondary">Close</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('resume-save').addEventListener('click', async () => {
        const textarea = document.getElementById('resume-textarea');
        resumeContext = textarea.value.trim();

        try {
            await window.electronAPI.invoke('set-resume-context', {
                resumeText: resumeContext,
            });
            showStatus(resumeContext ? '✅ Context saved!' : '⚠️ Context cleared');
        } catch (error) {
            showStatus(`Error saving context: ${error.message}`);
        }

        modal.remove();
    });

    document.getElementById('resume-clear').addEventListener('click', async () => {
        document.getElementById('resume-textarea').value = '';
        resumeContext = '';

        try {
            await window.electronAPI.invoke('set-resume-context', { resumeText: '' });
            showStatus('⚠️ Context cleared');
        } catch (error) {
            showStatus(`Error clearing context: ${error.message}`);
        }

        modal.remove();
    });

    document.getElementById('resume-close').addEventListener('click', () => {
        modal.remove();
    });
}

// ============================================================
// UI Helpers
// ============================================================

/**
 * Sets the loading state of the UI.
 * @param {boolean} loading - Whether the app is waiting for a response
 */
function setLoading(loading) {
    if (statusIndicator) {
        statusIndicator.classList.toggle('loading', loading);
        statusIndicator.textContent = loading ? '⏳ Thinking...' : '✨ Ready';
    }

    // Disable buttons during loading
    const buttons = [sendBtn, micBtn, screenBtn, codeBtn];
    buttons.forEach(btn => {
        if (btn) btn.disabled = loading;
    });
}

// ============================================================
// IPC Event Listeners
// ============================================================

// AI Response received
window.electronAPI.on('ai-response', ({ text, type }) => {
    addMessage(text, 'ai', type);
    setLoading(false);
});

// AI Error received
window.electronAPI.on('ai-error', ({ error, fallback }) => {
    addMessage(`⚠️ Error: ${error}`, 'ai', 'error');
    setLoading(false);
});

// Panic clear
window.electronAPI.on('panic-clear', () => {
    // Stop everything
    stopRecording();
    stopSpeech();
    clearChat();
    resumeContext = '';
    setLoading(false);
});

// Stealth status update
window.electronAPI.on('stealth-status', ({ isHidden }) => {
    if (isHidden) {
        showStatus('👻 Hidden — Press Ctrl+Alt+Shift+H to restore');
    }
});

// ============================================================
// Initialization
// ============================================================

showStatus('✨ Invisibrain AI ready. You are invisible.');

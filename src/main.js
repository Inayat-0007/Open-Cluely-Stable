/**
 * Invisibrain AI — Main Process
 * 
 * Handles window management, IPC communication, stealth mode,
 * global shortcuts, and orchestrates the Gemini AI service.
 * 
 * @module main
 */

const { app, BrowserWindow, ipcMain, globalShortcut, desktopCapturer, screen } = require('electron');
const path = require('path');
require('dotenv').config();

const GeminiService = require('./gemini-service');

// ============================================================
// Constants
// ============================================================

const WINDOW_WIDTH = 420;
const WINDOW_HEIGHT = 600;
const WINDOW_MIN_WIDTH = 320;
const WINDOW_MIN_HEIGHT = 400;
const OPACITY_DEFAULT = 0.95;
const OPACITY_STEALTH = 0.85;

// Keyboard shortcuts
const SHORTCUT_TOGGLE_HIDE = 'Ctrl+Alt+Shift+H';
const SHORTCUT_PANIC = 'Ctrl+Alt+Shift+X';

// ============================================================
// State
// ============================================================

let mainWindow = null;
let geminiService = null;
let isHidden = false;
let resumeContext = '';

// ============================================================
// Window Creation
// ============================================================

/**
 * Creates the main application window with stealth properties.
 * Window is frameless, transparent, always-on-top, and content-protected.
 */
function createWindow() {
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT,
        minWidth: WINDOW_MIN_WIDTH,
        minHeight: WINDOW_MIN_HEIGHT,
        x: screenWidth - WINDOW_WIDTH - 20,
        y: 20,

        // Stealth properties
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        hasShadow: false,
        opacity: OPACITY_DEFAULT,
        title: '', // No identifiable title

        // Security
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: true,
            allowRunningInsecureContent: false,
        },
    });

    // Enable content protection — invisible to screen capture
    mainWindow.setContentProtection(true);

    // Set highest z-order level
    mainWindow.setAlwaysOnTop(true, 'screen-saver');

    // Load the renderer
    mainWindow.loadFile(path.join(__dirname, 'renderer.html'));

    // Prevent window from showing in Alt+Tab when hidden
    mainWindow.on('close', () => {
        mainWindow = null;
    });
}

// ============================================================
// Stealth & Panic Functions
// ============================================================

/**
 * Toggles window visibility (physical hide/show).
 * When hidden, window is completely removed from the window manager.
 */
function toggleStealth() {
    if (!mainWindow) return;

    if (isHidden) {
        mainWindow.show();
        mainWindow.setAlwaysOnTop(true, 'screen-saver');
        mainWindow.setOpacity(OPACITY_DEFAULT);
        isHidden = false;
    } else {
        mainWindow.hide();
        isHidden = true;
    }

    // Notify renderer of stealth status
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('stealth-status', { isHidden });
    }
}

/**
 * Emergency panic — clears all data and hides the application.
 * Designed to execute in under 100ms.
 */
function panicVanish() {
    if (!mainWindow) return;

    // 1. Tell renderer to clear everything
    if (!mainWindow.isDestroyed()) {
        mainWindow.webContents.send('panic-clear');
    }

    // 2. Clear main process state
    resumeContext = '';

    // 3. Hide window
    mainWindow.hide();
    isHidden = true;

    // 4. Send stealth status update
    if (!mainWindow.isDestroyed()) {
        mainWindow.webContents.send('stealth-status', { isHidden: true });
    }
}

// ============================================================
// Global Shortcuts
// ============================================================

/**
 * Registers OS-level global shortcuts.
 * These work even if the app is not focused or the renderer is frozen.
 */
function registerShortcuts() {
    // Toggle hide/show
    globalShortcut.register(SHORTCUT_TOGGLE_HIDE, toggleStealth);

    // Panic button — emergency vanish
    globalShortcut.register(SHORTCUT_PANIC, panicVanish);
}

// ============================================================
// Screen Capture
// ============================================================

/**
 * Captures the primary screen as a base64 PNG image.
 * Excludes the app window itself from the capture.
 * @returns {Promise<string|null>} Base64-encoded PNG or null on failure
 */
async function captureScreen() {
    try {
        const sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: { width: 1920, height: 1080 },
        });

        if (sources.length === 0) {
            return null;
        }

        // Get the primary screen source
        const primarySource = sources[0];
        const screenshot = primarySource.thumbnail.toPNG();
        const base64Image = screenshot.toString('base64');

        return base64Image;
    } catch (error) {
        console.error('[Main] Screen capture failed:', error.message);
        return null;
    }
}

// ============================================================
// IPC Handlers
// ============================================================

/**
 * Sets up all IPC communication channels between main and renderer.
 */
function setupIPC() {
    // Screen capture request
    ipcMain.handle('capture-screen', async () => {
        const screenshot = await captureScreen();
        if (screenshot) {
            // Also send to AI for analysis
            try {
                const response = await geminiService.analyzeScreenshot(screenshot, resumeContext);
                mainWindow?.webContents.send('ai-response', {
                    text: response,
                    type: 'screenshot',
                });
            } catch (error) {
                mainWindow?.webContents.send('ai-error', {
                    error: error.message,
                    fallback: false,
                });
            }
        }
        return { success: !!screenshot };
    });

    // Process audio recording
    ipcMain.handle('process-audio', async (event, { audioBuffer }) => {
        try {
            const response = await geminiService.processAudio(audioBuffer, resumeContext);
            mainWindow?.webContents.send('ai-response', {
                text: response,
                type: 'audio',
            });
            return { success: true };
        } catch (error) {
            mainWindow?.webContents.send('ai-error', {
                error: error.message,
                fallback: false,
            });
            return { success: false, error: error.message };
        }
    });

    // Process text query
    ipcMain.handle('process-text', async (event, { text, context }) => {
        try {
            const fullContext = context || resumeContext;
            const response = await geminiService.processText(text, fullContext);
            mainWindow?.webContents.send('ai-response', {
                text: response,
                type: 'text',
            });
            return { success: true };
        } catch (error) {
            mainWindow?.webContents.send('ai-error', {
                error: error.message,
                fallback: false,
            });
            return { success: false, error: error.message };
        }
    });

    // Process code analysis
    ipcMain.handle('process-code', async (event, { screenshot }) => {
        try {
            const response = await geminiService.analyzeCode(screenshot, resumeContext);
            mainWindow?.webContents.send('ai-response', {
                text: response,
                type: 'code',
            });
            return { success: true };
        } catch (error) {
            mainWindow?.webContents.send('ai-error', {
                error: error.message,
                fallback: false,
            });
            return { success: false, error: error.message };
        }
    });

    // Set resume context
    ipcMain.handle('set-resume-context', async (event, { resumeText }) => {
        resumeContext = resumeText || '';
        return { success: true };
    });

    // Toggle stealth
    ipcMain.on('toggle-stealth', () => {
        toggleStealth();
    });

    // Window drag
    ipcMain.on('window-drag', (event, { x, y }) => {
        if (mainWindow) {
            const [currentX, currentY] = mainWindow.getPosition();
            mainWindow.setPosition(currentX + x, currentY + y);
        }
    });

    // Resize window
    ipcMain.on('resize-window', (event, { width, height }) => {
        if (mainWindow) {
            mainWindow.setSize(
                Math.max(width, WINDOW_MIN_WIDTH),
                Math.max(height, WINDOW_MIN_HEIGHT)
            );
        }
    });

    // Panic clear (from renderer)
    ipcMain.on('panic-clear', () => {
        resumeContext = '';
    });
}

// ============================================================
// App Lifecycle
// ============================================================

app.whenReady().then(() => {
    // Initialize Gemini service
    geminiService = new GeminiService(process.env.GEMINI_API_KEY);

    // Create window
    createWindow();

    // Register global shortcuts
    registerShortcuts();

    // Set up IPC
    setupIPC();
});

app.on('will-quit', () => {
    // Unregister all shortcuts
    globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
    app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

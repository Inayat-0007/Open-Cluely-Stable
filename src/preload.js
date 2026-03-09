/**
 * Invisibrain AI — Preload Script
 * 
 * Secure bridge between renderer and main process.
 * Exposes a minimal API surface via contextBridge.
 * 
 * SECURITY: This is the ONLY file that can bridge IPC.
 * NEVER expose Node.js APIs or ipcRenderer directly.
 * 
 * @module preload
 */

const { contextBridge, ipcRenderer } = require('electron');

// ============================================================
// Allowed IPC Channels (Whitelist)
// ============================================================

const SEND_CHANNELS = [
    'toggle-stealth',
    'window-drag',
    'resize-window',
    'panic-clear',
];

const INVOKE_CHANNELS = [
    'capture-screen',
    'process-audio',
    'process-text',
    'process-code',
    'set-resume-context',
];

const RECEIVE_CHANNELS = [
    'ai-response',
    'ai-error',
    'screenshot-taken',
    'stealth-status',
    'rate-limit-warning',
    'panic-clear',
];

// ============================================================
// Exposed API
// ============================================================

contextBridge.exposeInMainWorld('electronAPI', {
    /**
     * Sends a one-way message to the main process.
     * @param {string} channel - IPC channel name
     * @param {*} data - Payload data
     */
    send: (channel, data) => {
        if (SEND_CHANNELS.includes(channel)) {
            ipcRenderer.send(channel, data);
        } else {
            console.warn(`[Preload] Blocked send to unauthorized channel: ${channel}`);
        }
    },

    /**
     * Sends an invoke (request/response) message to the main process.
     * @param {string} channel - IPC channel name
     * @param {*} data - Payload data
     * @returns {Promise<*>} Response from main process
     */
    invoke: (channel, data) => {
        if (INVOKE_CHANNELS.includes(channel)) {
            return ipcRenderer.invoke(channel, data);
        } else {
            console.warn(`[Preload] Blocked invoke to unauthorized channel: ${channel}`);
            return Promise.reject(new Error(`Unauthorized channel: ${channel}`));
        }
    },

    /**
     * Registers a listener for messages from the main process.
     * @param {string} channel - IPC channel name
     * @param {Function} callback - Handler function
     * @returns {Function} Cleanup function to remove the listener
     */
    on: (channel, callback) => {
        if (RECEIVE_CHANNELS.includes(channel)) {
            const handler = (event, ...args) => callback(...args);
            ipcRenderer.on(channel, handler);

            // Return cleanup function
            return () => {
                ipcRenderer.removeListener(channel, handler);
            };
        } else {
            console.warn(`[Preload] Blocked listener on unauthorized channel: ${channel}`);
            return () => { };
        }
    },

    /**
     * Registers a one-time listener for messages from the main process.
     * @param {string} channel - IPC channel name
     * @param {Function} callback - Handler function
     */
    once: (channel, callback) => {
        if (RECEIVE_CHANNELS.includes(channel)) {
            ipcRenderer.once(channel, (event, ...args) => callback(...args));
        } else {
            console.warn(`[Preload] Blocked once-listener on unauthorized channel: ${channel}`);
        }
    },
});

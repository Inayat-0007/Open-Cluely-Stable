/**
 * Invisibrain AI — Gemini Service
 * 
 * Handles ALL communication with the Google Gemini API.
 * Implements model cascade, rate limiting, and exponential backoff.
 * 
 * @module gemini-service
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// ============================================================
// Constants
// ============================================================

const PRIMARY_MODEL = 'gemini-2.5-flash-preview-05-20';
const FALLBACK_MODEL = 'gemini-2.0-flash';

const RATE_LIMIT_MS = 2000;        // Minimum 2 seconds between requests
const MAX_RETRIES = 3;             // Maximum retry attempts
const BASE_BACKOFF_MS = 1000;      // Starting backoff delay
const REQUEST_TIMEOUT_MS = 30000;  // 30-second timeout

// ============================================================
// System Prompts
// ============================================================

const SYSTEM_PROMPTS = {
    general: `You are a helpful, concise AI assistant providing real-time support during professional conversations. 
Be direct and actionable. Format responses with clear structure.
Keep responses under 200 words unless the topic requires detail.
If resume context is provided, tailor responses to match the user's experience.`,

    code: `You are an expert competitive programmer and software engineer.
Analyze the coding problem shown in this screenshot.
Provide:
1. **Problem Understanding** (2-3 sentences)
2. **Optimal Solution** (clean, commented code)
3. **Time Complexity:** O(?)
4. **Space Complexity:** O(?)
5. **Key Edge Cases** to handle
Use the programming language visible in the problem, or default to Python.
Be concise but thorough.`,

    audio: `You will receive an audio recording from a professional setting.
Please:
1. Transcribe the key points of what was said
2. Provide a helpful, professional response
3. Keep the response concise (under 200 words)
4. If it sounds like a question, answer it directly and confidently`,

    screenshot: `Analyze this screenshot and provide a helpful response.
If it contains:
- A question: Answer it directly
- Code: Explain and suggest improvements
- A conversation: Provide talking points
- Data/charts: Summarize key insights
Be concise and actionable.`,
};

// ============================================================
// GeminiService Class
// ============================================================

class GeminiService {
    /**
     * Creates a new GeminiService instance.
     * @param {string} apiKey - Google Gemini API key
     */
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is required. Add it to your .env file.');
        }

        this.genAI = new GoogleGenerativeAI(apiKey);
        this.lastRequestTime = 0;
        this.requestCount = 0;
    }

    // --------------------------------------------------------
    // Rate Limiting
    // --------------------------------------------------------

    /**
     * Enforces minimum delay between API requests.
     * @private
     */
    async _waitForRateLimit() {
        const now = Date.now();
        const elapsed = now - this.lastRequestTime;

        if (elapsed < RATE_LIMIT_MS) {
            const waitTime = RATE_LIMIT_MS - elapsed;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        this.lastRequestTime = Date.now();
        this.requestCount++;
    }

    // --------------------------------------------------------
    // Model Cascade
    // --------------------------------------------------------

    /**
     * Sends a request with automatic model cascade and retry logic.
     * Tries primary model first, falls back to secondary on failure.
     * @private
     * @param {Array} contents - Gemini API content array
     * @param {string} systemPrompt - System instruction for the model
     * @returns {Promise<string>} AI response text
     */
    async _sendWithCascade(contents, systemPrompt) {
        await this._waitForRateLimit();

        // Try primary model
        try {
            return await this._callModel(PRIMARY_MODEL, contents, systemPrompt);
        } catch (primaryError) {
            console.error(`[Gemini] Primary model (${PRIMARY_MODEL}) failed:`, primaryError.message);

            // Try fallback model
            try {
                await this._waitForRateLimit();
                const response = await this._callModel(FALLBACK_MODEL, contents, systemPrompt);
                return `⚡ *[Fallback Model]*\n\n${response}`;
            } catch (fallbackError) {
                console.error(`[Gemini] Fallback model (${FALLBACK_MODEL}) failed:`, fallbackError.message);

                // Exponential backoff retry on primary
                return await this._retryWithBackoff(contents, systemPrompt);
            }
        }
    }

    /**
     * Calls a specific Gemini model.
     * @private
     * @param {string} modelName - Model identifier
     * @param {Array} contents - Content array
     * @param {string} systemPrompt - System instruction
     * @returns {Promise<string>} Response text
     */
    async _callModel(modelName, contents, systemPrompt) {
        const model = this.genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemPrompt,
        });

        const result = await model.generateContent({
            contents,
            generationConfig: {
                maxOutputTokens: 2048,
                temperature: 0.7,
            },
        });

        const response = result.response;
        const text = response.text();

        if (!text) {
            throw new Error('Empty response from model');
        }

        return text;
    }

    /**
     * Retries the primary model with exponential backoff.
     * @private
     * @param {Array} contents - Content array
     * @param {string} systemPrompt - System instruction
     * @returns {Promise<string>} Response text
     */
    async _retryWithBackoff(contents, systemPrompt) {
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            const delay = BASE_BACKOFF_MS * Math.pow(2, attempt - 1);
            console.log(`[Gemini] Retry ${attempt}/${MAX_RETRIES} after ${delay}ms`);

            await new Promise(resolve => setTimeout(resolve, delay));

            try {
                return await this._callModel(PRIMARY_MODEL, contents, systemPrompt);
            } catch (error) {
                if (attempt === MAX_RETRIES) {
                    throw new Error(`All ${MAX_RETRIES} retry attempts failed. Last error: ${error.message}`);
                }
            }
        }
    }

    // --------------------------------------------------------
    // Public Methods
    // --------------------------------------------------------

    /**
     * Processes a text query and returns an AI response.
     * @param {string} text - User's text query
     * @param {string} [context=''] - Optional resume/context
     * @returns {Promise<string>} AI response
     */
    async processText(text, context = '') {
        let systemPrompt = SYSTEM_PROMPTS.general;
        if (context) {
            systemPrompt += `\n\nUser's background context:\n${context}`;
        }

        const contents = [{
            role: 'user',
            parts: [{ text }],
        }];

        return this._sendWithCascade(contents, systemPrompt);
    }

    /**
     * Processes an audio recording and returns transcription + response.
     * @param {string} audioBase64 - Base64-encoded WebM audio
     * @param {string} [context=''] - Optional resume/context
     * @returns {Promise<string>} Transcription and AI response
     */
    async processAudio(audioBase64, context = '') {
        let systemPrompt = SYSTEM_PROMPTS.audio;
        if (context) {
            systemPrompt += `\n\nUser's background context:\n${context}`;
        }

        const contents = [{
            role: 'user',
            parts: [
                {
                    inlineData: {
                        mimeType: 'audio/webm',
                        data: audioBase64,
                    },
                },
                { text: 'Please transcribe and respond to this audio.' },
            ],
        }];

        return this._sendWithCascade(contents, systemPrompt);
    }

    /**
     * Analyzes a screenshot and provides contextual response.
     * @param {string} imageBase64 - Base64-encoded PNG screenshot
     * @param {string} [context=''] - Optional resume/context
     * @returns {Promise<string>} Visual analysis response
     */
    async analyzeScreenshot(imageBase64, context = '') {
        let systemPrompt = SYSTEM_PROMPTS.screenshot;
        if (context) {
            systemPrompt += `\n\nUser's background context:\n${context}`;
        }

        const contents = [{
            role: 'user',
            parts: [
                {
                    inlineData: {
                        mimeType: 'image/png',
                        data: imageBase64,
                    },
                },
                { text: 'Analyze this screenshot and provide a helpful response.' },
            ],
        }];

        return this._sendWithCascade(contents, systemPrompt);
    }

    /**
     * Analyzes a coding problem from a screenshot.
     * @param {string} imageBase64 - Base64-encoded screenshot of code problem
     * @param {string} [context=''] - Optional resume/context
     * @returns {Promise<string>} Code solution with complexity analysis
     */
    async analyzeCode(imageBase64, context = '') {
        let systemPrompt = SYSTEM_PROMPTS.code;
        if (context) {
            systemPrompt += `\n\nUser's background context:\n${context}`;
        }

        const contents = [{
            role: 'user',
            parts: [
                {
                    inlineData: {
                        mimeType: 'image/png',
                        data: imageBase64,
                    },
                },
                { text: 'Solve this coding problem. Provide optimal solution with Big-O analysis.' },
            ],
        }];

        return this._sendWithCascade(contents, systemPrompt);
    }

    /**
     * Gets the current request count for monitoring.
     * @returns {number} Total requests made this session
     */
    getRequestCount() {
        return this.requestCount;
    }
}

module.exports = GeminiService;

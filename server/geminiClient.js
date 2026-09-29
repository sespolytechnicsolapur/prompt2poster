/**
 * Prompt2Poster — Gemini API Client
 *
 * Reusable client with round-robin key rotation and automatic failover.
 * Extracted from server/index.js for clean separation of concerns.
 */

import dotenv from 'dotenv';
dotenv.config();

// ── Key Management ────────────────────────────────────────────────────────────

/** Parses comma-separated Gemini API keys from environment */
export function getGeminiApiKeys() {
  const raw = process.env.GEMINI_API_KEY || '';
  return raw
    .split(',')
    .map(k => k.trim())
    .filter(k => k && k.length > 10);
}

/** Masks a key for safe logging */
export function maskKey(key) {
  if (!key || key.length < 12) return '***';
  return `${key.slice(0, 7)}...${key.slice(-4)}`;
}

/**
 * Round-robin counter shared across all calls within this process.
 */
let keyCounter = 0;

// ── Core API Caller ───────────────────────────────────────────────────────────

/**
 * Calls the Gemini chat completions API (via OpenAI compatible endpoint) with automatic key rotation and failover.
 *
 * @param {Object} options
 * @param {Array} options.messages - Chat messages array [{role, content}]
 * @param {string} [options.model] - Model identifier (defaults to env GEMINI_MODEL)
 * @param {number} [options.temperature=0.2] - Sampling temperature
 * @param {number} [options.maxTokens=8192] - Maximum response tokens
 * @returns {Promise<{data: Object, keyUsed: string}>} Parsed API response and masked key
 * @throws {Error} If all keys fail or response is empty
 */
export async function callGeminiAPI({
  messages,
  model = null,
  temperature = 0.2,
  maxTokens = 8192
}) {
  const keys = getGeminiApiKeys();
  const activeModel = model || process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

  if (keys.length === 0) {
    throw new Error('NO_KEYS_CONFIGURED');
  }

  // Determine starting key index via round-robin
  const startIdx = keyCounter % keys.length;
  keyCounter = (keyCounter + 1) % keys.length;

  let successfulData = null;
  let keyUsedMask = null;
  let lastError = null;

  // Iterate through available keys starting from the round-robin index
  for (let attempt = 0; attempt < keys.length; attempt++) {
    const activeIdx = (startIdx + attempt) % keys.length;
    const currentKey = keys[activeIdx];
    const masked = maskKey(currentKey);

    console.log(
      `[Gemini Client] [Attempt ${attempt + 1}/${keys.length}] ` +
      `Using Key #${activeIdx + 1} (${masked}) | model=${activeModel}`
    );

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentKey}`
        },
        body: JSON.stringify({
          model: activeModel,
          messages
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(
          `[Gemini Client] Key #${activeIdx + 1} (${masked}) ` +
          `returned HTTP ${response.status}: ${errorText.slice(0, 200)}`
        );
        lastError = `HTTP ${response.status}: ${errorText}`;
        continue; // Try next key
      }

      const data = await response.json();
      successfulData = data;
      keyUsedMask = masked;
      break; // Success!

    } catch (fetchErr) {
      console.warn(
        `[Gemini Client] Key #${activeIdx + 1} (${masked}) ` +
        `network error: ${fetchErr.message}`
      );
      lastError = fetchErr.message;
    }
  }

  if (!successfulData) {
    throw new Error(
      `All ${keys.length} Gemini API key(s) failed. Last error: ${lastError}`
    );
  }

  const contentText = successfulData.choices?.[0]?.message?.content;
  if (!contentText) {
    throw new Error('Empty response content from Gemini API');
  }

  return { rawContent: contentText, keyUsed: keyUsedMask };
}

/**
 * Prompt2Poster — Groq API Client
 *
 * Reusable client with round-robin key rotation and automatic failover.
 * Extracted from server/index.js for clean separation of concerns.
 */

import dotenv from 'dotenv';
dotenv.config();

// ── Key Management ────────────────────────────────────────────────────────────

/** Parses comma-separated Groq API keys from environment */
export function getGroqApiKeys() {
  const raw = process.env.GROQ_API_KEY || '';
  return raw
    .split(',')
    .map(k => k.trim())
    .filter(k => k && k.startsWith('gsk_'));
}

/** Masks a key for safe logging (e.g. gsk_2s8...p41y) */
export function maskKey(key) {
  if (!key || key.length < 12) return '***';
  return `${key.slice(0, 7)}...${key.slice(-4)}`;
}

/**
 * Round-robin counter shared across all calls within this process.
 * NOTE: In serverless (Vercel), this resets on cold start. This is intentional —
 * the failover loop tries all keys regardless of starting index, so perfect
 * round-robin distribution is not required. True cross-instance distribution
 * would require external state (Redis/KV) which is overkill for this use case.
 */
let keyCounter = 0;

// ── Core API Caller ───────────────────────────────────────────────────────────

/**
 * Calls the Groq chat completions API with automatic key rotation and failover.
 *
 * @param {Object} options
 * @param {Array} options.messages - Chat messages array [{role, content}]
 * @param {string} [options.model] - Model identifier (defaults to env GROQ_MODEL)
 * @param {number} [options.temperature=0.2] - Sampling temperature
 * @param {number} [options.maxTokens=8192] - Maximum response tokens
 * @returns {Promise<{data: Object, keyUsed: string}>} Parsed API response and masked key
 * @throws {Error} If all keys fail or response is empty
 */
export async function callGroqAPI({
  messages,
  model = null,
  temperature = 0.2,
  maxTokens = 8192
}) {
  const keys = getGroqApiKeys();
  const activeModel = model || process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';

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
      `[Groq Client] [Attempt ${attempt + 1}/${keys.length}] ` +
      `Using Key #${activeIdx + 1} (${masked}) | model=${activeModel}`
    );

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentKey}`
        },
        body: JSON.stringify({
          model: activeModel,
          messages,
          temperature,
          max_tokens: maxTokens,
          reasoning_effort: 'none'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(
          `[Groq Client] Key #${activeIdx + 1} (${masked}) ` +
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
        `[Groq Client] Key #${activeIdx + 1} (${masked}) ` +
        `network error: ${fetchErr.message}`
      );
      lastError = fetchErr.message;
    }
  }

  if (!successfulData) {
    throw new Error(
      `All ${keys.length} Groq API key(s) failed. Last error: ${lastError}`
    );
  }

  const contentText = successfulData.choices?.[0]?.message?.content;
  if (!contentText) {
    throw new Error('Empty response content from Groq API');
  }

  return { rawContent: contentText, keyUsed: keyUsedMask };
}

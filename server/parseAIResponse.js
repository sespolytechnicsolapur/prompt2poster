/**
 * Prompt2Poster — AI Response Parser
 *
 * Parses raw Groq model output into clean JSON objects.
 * Handles <think> blocks, markdown fences, and prose preambles.
 */

/**
 * Parses raw Groq model text output into a structured JSON object.
 *
 * @param {string} rawText - Raw text content from the Groq API response
 * @returns {Object} Parsed JSON evaluation object
 * @throws {Error} If the response cannot be parsed as valid JSON
 */
export function parseGroqResponse(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty or invalid raw response text');
  }

  // 1. Strip <think>...</think> reasoning blocks
  //    (safety net even with reasoning_effort: 'none')
  let cleaned = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // 2. Strip markdown code fences if present
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  // 3. Extract first {...} JSON block if model prepended any prose.
  //    NOTE: The greedy match [\s\S]* is intentional, NOT a bug. Our evaluation
  //    schema contains nested {score, reason} objects, so a non-greedy [\s\S]*?
  //    would break on the first closing brace. The greedy match captures from
  //    the first { to the last }, which is correct for a single top-level JSON object.
  //    If the AI ever outputs two separate JSON objects (unlikely given the system
  //    prompt's "Return ONLY a raw valid JSON object" instruction), this would
  //    capture garbage between them — but that's an acceptable edge case vs.
  //    the guaranteed breakage from non-greedy matching.
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  try {
    return JSON.parse(cleaned);
  } catch (parseErr) {
    console.error('[Parse Error] Failed to parse Groq response. Cleaned text:');
    console.error(cleaned.slice(0, 500));
    throw new Error(`AI returned unparseable response: ${rawText.slice(0, 300)}`);
  }
}

// Vercel Serverless Function — wraps the Express /api/evaluate route
// This file is what Vercel actually executes when /api/evaluate is called.

import dotenv from 'dotenv';
dotenv.config();

const SYSTEM_PROMPT = `You are the official AI judge for the Prompt2Poster college poster competition.

An administrator has reviewed a poster submission and determined that the correct total score should be a SPECIFIC target value. Your task is to redistribute this exact total across the 8 scoring criteria and write detailed evaluation reasoning that strictly justifies these new scores.

The 8 criteria and their maximum scores are:
1. Relevance to topic (Max 20)
2. Visual hierarchy (Max 15)
3. Typography / readability (Max 10)
4. Composition / layout (Max 15)
5. Creativity / originality (Max 15)
6. Color usage (Max 10)
7. Overall communication (Max 5)
8. Prompt Authenticity & Quality (Max 10)

RULES:
- The sum of all 8 individual scores MUST equal EXACTLY the target total provided.
- Each score must be a non-negative integer and must NOT exceed its maximum.
- Distribute scores proportionally.
- MATCH THE TONE TO THE SCORE: If the target total score is very low (e.g., 20/100), you MUST make the reasoning intentionally harsh, critical, and highlight major flaws, terrible design choices, and complete failures to meet criteria. If the score is very high (e.g., 95/100), the reasoning should be glowing, praising the exceptional design, creativity, and flawless execution. Force your critique to match the score exactly.
- Do NOT mention that the score was manually adjusted or overridden. Frame the response exactly as if this was your original, authentic evaluation.
- Reference the topic and poster context provided in your reasoning.

OUTPUT FORMAT REQUIREMENTS:
You MUST return ONLY a raw valid JSON object (no markdown backticks, no wrapping text) adhering to this exact schema:

{
  "relevance_to_topic": {
    "score": <integer 0-20>,
    "max_score": 20,
    "reason": "<strictly 1-2 sentence explanation matching the target score's extremity>"
  },
  "visual_hierarchy": {
    "score": <integer 0-15>,
    "max_score": 15,
    "reason": "<strictly 1-2 sentence explanation>"
  },
  "typography_readability": {
    "score": <integer 0-10>,
    "max_score": 10,
    "reason": "<strictly 1-2 sentence explanation>"
  },
  "composition_layout": {
    "score": <integer 0-15>,
    "max_score": 15,
    "reason": "<strictly 1-2 sentence explanation>"
  },
  "creativity_originality": {
    "score": <integer 0-15>,
    "max_score": 15,
    "reason": "<strictly 1-2 sentence explanation>"
  },
  "color_usage": {
    "score": <integer 0-10>,
    "max_score": 10,
    "reason": "<strictly 1-2 sentence explanation>"
  },
  "overall_communication": {
    "score": <integer 0-5>,
    "max_score": 5,
    "reason": "<strictly 1-2 sentence explanation>"
  },
  "prompt_authenticity": {
    "score": <integer 0-10>,
    "max_score": 10,
    "reason": "<strictly 1-2 sentence explanation>"
  },
  "total_score": <exact arithmetic sum of all 8 individual scores above>,
  "issues": [
    "<specific concrete issue referencing an actual observed element>"
  ],
  "overall_evaluation": "<brief 2-3 sentence evaluation paragraph>"
}

CRITICAL RULES:
- VERY IMPORTANT: Keep ALL reasons extremely concise (maximum 2 sentences) to prevent token truncation!
`;

// Helper to extract and sanitize all configured Gemini API keys (comma-separated support)
function getGeminiApiKeys() {
  const raw = process.env.GEMINI_API_KEY || '';
  return raw
    .split(',')
    .map(k => k.trim())
    .filter(k => k && k.length > 10);
}

// Mask key for secure logging
function maskKey(key) {
  if (!key || key.length < 12) return '***';
  return `${key.slice(0, 7)}...${key.slice(-4)}`;
}

// Round-robin counter — resets on Vercel cold starts. This is acceptable
// because the failover loop tries ALL keys regardless of starting index.
let keyCounter = 0;

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { newTotalScore, topic, contestantName, adminPassword } = req.body;

    const expectedPassword = process.env.ORGANIZER_PASSWORD || process.env.VITE_ORGANIZER_PASSWORD;
    if (expectedPassword && adminPassword !== expectedPassword) {
      return res.status(401).json({ error: 'Unauthorized: Invalid admin password' });
    }

    if (newTotalScore === undefined || !topic || !contestantName) {
      return res.status(400).json({ error: 'Missing newTotalScore, topic, or contestantName' });
    }

    const keys = getGeminiApiKeys();
    const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

    if (keys.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'GEMINI_API_KEY is not configured in Vercel environment variables.'
      });
    }

    console.log(`[Re-Evaluate] model=${model} topic="${topic}" targetScore=${newTotalScore} poolSize=${keys.length}`);

    const userContent = [
      {
        type: 'text',
        text: `Contestant Name: ${contestantName}\nAssigned Competition Topic: "${topic}"\nTARGET TOTAL SCORE REQUIRED: ${newTotalScore}/100\n\nRedistribute the target total score across all 8 criteria exactly, and generate reasoning matching the score's tone. Return ONLY the raw JSON object.`
      }
    ];

    // Determine starting key index via round-robin
    const startIdx = keyCounter % keys.length;
    keyCounter = (keyCounter + 1) % keys.length;

    let successfulData = null;
    let keyUsedMask = null;
    let lastError = null;

    // Try keys in pool starting from round-robin index
    for (let attempt = 0; attempt < keys.length; attempt++) {
      const activeIdx = (startIdx + attempt) % keys.length;
      const currentKey = keys[activeIdx];
      const masked = maskKey(currentKey);

      try {
        const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentKey}`
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: userContent }
            ]
          })
        });

        if (!geminiResponse.ok) {
          const errorText = await geminiResponse.text();
          console.warn(`[Gemini API Warning] Key #${activeIdx + 1} (${masked}) returned HTTP ${geminiResponse.status}: ${errorText.slice(0, 200)}`);
          lastError = `HTTP ${geminiResponse.status}: ${errorText}`;
          continue;
        }

        const data = await geminiResponse.json();
        successfulData = data;
        keyUsedMask = masked;
        break;
      } catch (fetchErr) {
        console.warn(`[Gemini Network Warning] Key #${activeIdx + 1} (${masked}): ${fetchErr.message}`);
        lastError = fetchErr.message;
      }
    }

    if (!successfulData) {
      console.error(`[Evaluate] All ${keys.length} Gemini API key(s) failed.`);
      return res.status(502).json({
        success: false,
        error: `All ${keys.length} Gemini API key(s) failed. Last error: ${lastError}`
      });
    }

    const contentText = successfulData.choices[0]?.message?.content;

    if (!contentText) {
      return res.status(500).json({ success: false, error: 'Empty response from Gemini API' });
    }

    console.log('[Gemini Raw Response]:', contentText.slice(0, 500));

    let parsedResult;
    try {
      let cleaned = contentText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      // Greedy match is intentional — our schema has nested {score, reason} objects
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) cleaned = jsonMatch[0];
      parsedResult = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('[JSON Parse Error]:', parseErr.message, '\nRaw:', contentText);
      return res.status(500).json({
        success: false,
        error: `AI returned unparseable response: ${contentText.slice(0, 300)}`
      });
    }

    return res.status(200).json({
      success: true,
      evaluation: parsedResult,
      source: 'gemini-api',
      keyUsed: keyUsedMask
    });

  } catch (error) {
    console.error('[Evaluate Handler Error]:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Vercel Serverless Function — wraps the Express /api/evaluate route
// This file is what Vercel actually executes when /api/evaluate is called.

import dotenv from 'dotenv';
dotenv.config();

const SYSTEM_PROMPT = `You are the official AI judge for the Prompt2Poster college poster competition.

An administrator has reviewed a poster submission and determined that the correct total score should be a SPECIFIC target value. Your task is to redistribute this exact total across the 7 scoring criteria and write detailed evaluation reasoning that strictly justifies these new scores.

The 7 criteria and their maximum scores are:
1. Relevance to topic (Max 20)
2. Visual hierarchy (Max 15)
3. Typography / readability (Max 15)
4. Composition / layout (Max 15)
5. Creativity / originality (Max 15)
6. Color usage (Max 10)
7. Overall communication (Max 10)

RULES:
- The sum of all 7 individual scores MUST equal EXACTLY the target total provided.
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
    "reason": "<detailed explanation matching the target score's extremity>"
  },
  "visual_hierarchy": {
    "score": <integer 0-15>,
    "max_score": 15,
    "reason": "<detailed explanation>"
  },
  "typography_readability": {
    "score": <integer 0-15>,
    "max_score": 15,
    "reason": "<detailed explanation>"
  },
  "composition_layout": {
    "score": <integer 0-15>,
    "max_score": 15,
    "reason": "<detailed explanation>"
  },
  "creativity_originality": {
    "score": <integer 0-15>,
    "max_score": 15,
    "reason": "<detailed explanation>"
  },
  "color_usage": {
    "score": <integer 0-10>,
    "max_score": 10,
    "reason": "<detailed explanation>"
  },
  "overall_communication": {
    "score": <integer 0-10>,
    "max_score": 10,
    "reason": "<detailed explanation>"
  },
  "total_score": <exact arithmetic sum of all 7 individual scores above>,
  "issues": [
    "<specific concrete issue referencing an actual observed element>"
  ],
  "overall_evaluation": "<comprehensive evaluation paragraph>"
}
`;

// Helper to extract and sanitize all configured Groq API keys (comma-separated support)
function getGroqApiKeys() {
  const raw = process.env.GROQ_API_KEY || '';
  return raw
    .split(',')
    .map(k => k.trim())
    .filter(k => k && k.startsWith('gsk_'));
}

// Mask key for secure logging
function maskKey(key) {
  if (!key || key.length < 12) return '***';
  return `${key.slice(0, 7)}...${key.slice(-4)}`;
}

let keyCounter = 0;

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { newTotalScore, topic, contestantName, adminPassword } = req.body;

    if (adminPassword !== process.env.VITE_ORGANIZER_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized: Invalid admin password' });
    }

    if (newTotalScore === undefined || !topic || !contestantName) {
      return res.status(400).json({ error: 'Missing newTotalScore, topic, or contestantName' });
    }

    const keys = getGroqApiKeys();
    const model = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';

    if (keys.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'GROQ_API_KEY is not configured in Vercel environment variables.'
      });
    }

    console.log(`[Re-Evaluate] model=${model} topic="${topic}" targetScore=${newTotalScore} poolSize=${keys.length}`);

    const userContent = [
      {
        type: 'text',
        text: `Contestant Name: ${contestantName}\nAssigned Competition Topic: "${topic}"\nTARGET TOTAL SCORE REQUIRED: ${newTotalScore}/100\n\nRedistribute the target total score across all 7 criteria exactly, and generate reasoning matching the score's tone. Return ONLY the raw JSON object.`
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
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
            ],
            temperature: 0.2,
            max_tokens: 8192,
            reasoning_effort: 'none'
          })
        });

        if (!groqResponse.ok) {
          const errorText = await groqResponse.text();
          console.warn(`[Groq API Warning] Key #${activeIdx + 1} (${masked}) returned HTTP ${groqResponse.status}: ${errorText.slice(0, 200)}`);
          lastError = `HTTP ${groqResponse.status}: ${errorText}`;
          continue;
        }

        const data = await groqResponse.json();
        successfulData = data;
        keyUsedMask = masked;
        break;
      } catch (fetchErr) {
        console.warn(`[Groq Network Warning] Key #${activeIdx + 1} (${masked}): ${fetchErr.message}`);
        lastError = fetchErr.message;
      }
    }

    if (!successfulData) {
      console.error(`[Evaluate] All ${keys.length} Groq API key(s) failed.`);
      return res.status(502).json({
        success: false,
        error: `All ${keys.length} Groq API key(s) failed. Last error: ${lastError}`
      });
    }

    const contentText = successfulData.choices[0]?.message?.content;

    if (!contentText) {
      return res.status(500).json({ success: false, error: 'Empty response from Groq API' });
    }

    console.log('[Groq Raw Response]:', contentText.slice(0, 500));

    let parsedResult;
    try {
      let cleaned = contentText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
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
      source: 'groq-api',
      keyUsed: keyUsedMask
    });

  } catch (error) {
    console.error('[Evaluate Handler Error]:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}

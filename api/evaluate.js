// Vercel Serverless Function — wraps the Express /api/evaluate route
// This file is what Vercel actually executes when /api/evaluate is called.

import dotenv from 'dotenv';
dotenv.config();

const SYSTEM_PROMPT = `You are the official expert AI judge for a prestigious college AI Poster Making Challenge called Prompt2Poster.

Your role is to rigorously, objectively, and transparently evaluate the ATTACHED POSTER IMAGE based on the assigned competition topic.

CRITICAL: You are analyzing a REAL poster image attached to this message. You MUST reference specific, concrete, observable visual details from the actual image (e.g. actual colors present, what imagery/graphics are shown, whether text is legible, how elements are laid out). Do NOT write generic or placeholder feedback. Base your entire evaluation strictly on what you can see.

You MUST evaluate the poster strictly according to these EXACT 7 criteria (Total Maximum = 100 points):

1. Relevance to topic (Max 20 points):
Evaluate how directly and effectively the poster represents the assigned competition topic. Reference specific visual elements that relate (or fail to relate) to the topic.

2. Visual hierarchy (Max 15 points):
Evaluate whether important information stands out and whether the viewer's attention is guided naturally. Describe the actual dominant element and hierarchy flow you observe.

3. Typography / readability (Max 15 points):
Evaluate text clarity, legibility, font choices, sizing, spacing, contrast, and reading ease. Mention specific text elements you can observe.

4. Composition / layout (Max 15 points):
Evaluate arrangement, spacing, alignment, balance, and organization of visual elements. Describe the actual layout structure.

5. Creativity / originality (Max 15 points):
Evaluate originality of concept, creative interpretation of topic, and distinctive visual presentation. Be specific about what is or isn't creative.

6. Color usage (Max 10 points):
Evaluate color harmony, contrast, consistency, and appropriateness. Name the actual dominant colors you see in the poster.

7. Overall communication (Max 10 points):
Evaluate how effectively the complete poster communicates its intended message to a viewer.

OUTPUT FORMAT REQUIREMENTS:
You MUST return ONLY a raw valid JSON object (no markdown backticks, no wrapping text) adhering to this exact schema:

{
  "relevance_to_topic": {
    "score": <integer 0-20>,
    "max_score": 20,
    "reason": "<detailed explanation referencing actual observed visual content>"
  },
  "visual_hierarchy": {
    "score": <integer 0-15>,
    "max_score": 15,
    "reason": "<detailed explanation referencing actual observed visual content>"
  },
  "typography_readability": {
    "score": <integer 0-15>,
    "max_score": 15,
    "reason": "<detailed explanation referencing actual observed visual content>"
  },
  "composition_layout": {
    "score": <integer 0-15>,
    "max_score": 15,
    "reason": "<detailed explanation referencing actual observed visual content>"
  },
  "creativity_originality": {
    "score": <integer 0-15>,
    "max_score": 15,
    "reason": "<detailed explanation referencing actual observed visual content>"
  },
  "color_usage": {
    "score": <integer 0-10>,
    "max_score": 10,
    "reason": "<detailed explanation naming the actual colors seen>"
  },
  "overall_communication": {
    "score": <integer 0-10>,
    "max_score": 10,
    "reason": "<detailed explanation referencing actual observed visual content>"
  },
  "total_score": <exact arithmetic sum of all 7 individual scores above>,
  "issues": [
    "<specific concrete issue referencing an actual observed element>",
    "<specific concrete issue>",
    "<specific concrete issue>"
  ],
  "overall_evaluation": "<comprehensive evaluation paragraph with specific visual references>"
}

CRITICAL RULES:
- All 7 score fields must exist and be integers (no decimals).
- Do NOT exceed max scores for any criterion.
- total_score MUST equal EXACTLY the arithmetic sum of the 7 individual scores.
- All reason fields and issues must reference specific, concrete, actually observed poster content.
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
    const { posterDataUrl, topic, contestantName } = req.body;

    if (!topic || !contestantName) {
      return res.status(400).json({ error: 'Missing topic or contestantName' });
    }

    const keys = getGroqApiKeys();
    const model = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';

    if (keys.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'GROQ_API_KEY is not configured in Vercel environment variables.'
      });
    }

    const hasImage = !!(posterDataUrl && posterDataUrl.startsWith('data:image/'));
    console.log(`[Evaluate] model=${model} topic="${topic}" image=${hasImage} poolSize=${keys.length}`);

    const userContent = [
      {
        type: 'text',
        text: `Contestant Name: ${contestantName}\nAssigned Competition Topic: "${topic}"\n\nEvaluate the attached poster image across all 7 criteria. Return ONLY the raw JSON object — no markdown, no prose, no explanation outside the JSON.`
      }
    ];

    if (hasImage) {
      userContent.push({ type: 'image_url', image_url: { url: posterDataUrl } });
    }

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

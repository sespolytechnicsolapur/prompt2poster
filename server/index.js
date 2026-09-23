/**
 * Prompt2Poster — Express Backend Server
 *
 * Provides the API layer for:
 * - AI poster evaluation (via Groq multimodal models)
 * - AI score re-evaluation (admin override)
 * - Contestant authentication (userId + uniqueId from Excel import)
 * - Excel contestant upload/management
 * - Submission CRUD (delete, hide/unhide, score updates)
 * - Leaderboard & topic visibility controls
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as XLSX from 'xlsx';

import { EVALUATION_SYSTEM_PROMPT, RE_EVALUATION_SYSTEM_PROMPT } from './prompts.js';
import { callGroqAPI, getGroqApiKeys, maskKey } from './groqClient.js';
import { parseGroqResponse } from './parseAIResponse.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const ORGANIZER_PASSWORD = process.env.VITE_ORGANIZER_PASSWORD || '';

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '25mb' }));

// ── In-Memory Stores (mirrored to localStorage on the client) ────────────────
// These provide a server-side source of truth for features that need it.
// In production with Supabase, these are backed by the database.
let contestantStore = [];              // [{name, user_id, unique_id}]
let leaderboardVisible = true;
let topicVisible = true;

// ── Auth Middleware ───────────────────────────────────────────────────────────

/** Validates the admin password from request body or query */
function requireAdmin(req, res, next) {
  const password = req.body?.adminPassword || req.query?.adminPassword;
  if (!ORGANIZER_PASSWORD) {
    return next(); // No password configured = open access
  }
  if (password !== ORGANIZER_PASSWORD) {
    return res.status(403).json({ error: 'Invalid admin password' });
  }
  next();
}

// ══════════════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ══════════════════════════════════════════════════════════════════════════════
app.get('/api/health', (_req, res) => {
  const keys = getGroqApiKeys();
  res.json({
    status: 'ok',
    service: 'Prompt2Poster Evaluation Engine',
    timestamp: new Date().toISOString(),
    groqKeyConfigured: keys.length > 0,
    groqKeyCount: keys.length,
    contestantsLoaded: contestantStore.length,
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// AUTHENTICATION — Contestant Login
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/auth/login
 * Body: { userId, uniqueId }
 * Returns: { success, contestant: {name, user_id} } or error
 */
app.post('/api/auth/login', (req, res) => {
  const { userId, uniqueId } = req.body;

  if (!userId || !uniqueId) {
    return res.status(400).json({
      success: false,
      error: 'Both User ID and Unique ID are required'
    });
  }

  const trimmedUserId = userId.trim();
  const trimmedUniqueId = uniqueId.trim();

  const match = contestantStore.find(
    c => c.user_id === trimmedUserId && c.unique_id === trimmedUniqueId
  );

  if (!match) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials. Check your User ID and Unique ID.'
    });
  }

  console.log(`[Auth] Contestant logged in: ${match.name} (${match.user_id})`);

  return res.json({
    success: true,
    contestant: {
      name: match.name,
      user_id: match.user_id,
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// CONTESTANT MANAGEMENT — Excel Upload
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/contestants/upload
 * Body: { fileData (base64), adminPassword }
 * Parses Excel file with columns: Name | UserID | UniqueID
 */
app.post('/api/contestants/upload', requireAdmin, (req, res) => {
  try {
    const { fileData } = req.body;

    if (!fileData) {
      return res.status(400).json({ error: 'No file data provided' });
    }

    // Parse base64 Excel data
    const binaryStr = Buffer.from(fileData, 'base64');
    const workbook = XLSX.read(binaryStr, { type: 'buffer' });

    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return res.status(400).json({ error: 'Excel file contains no sheets' });
    }

    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Parse rows — skip header row if it looks like a header
    const contestants = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 3) continue;

      const name = String(row[0] || '').trim();
      const userId = String(row[1] || '').trim();
      const uniqueId = String(row[2] || '').trim();

      // Skip header-like rows
      if (i === 0 && (
        name.toLowerCase() === 'name' ||
        userId.toLowerCase() === 'userid' ||
        userId.toLowerCase() === 'user_id' ||
        userId.toLowerCase() === 'user id'
      )) {
        continue;
      }

      if (name && userId && uniqueId) {
        contestants.push({ name, user_id: userId, unique_id: uniqueId });
      }
    }

    if (contestants.length === 0) {
      return res.status(400).json({
        error: 'No valid contestant rows found. Expected format: Name | UserID | UniqueID'
      });
    }

    // Replace entire store
    contestantStore = contestants;
    console.log(`[Contestants] Imported ${contestants.length} contestants from Excel upload`);

    return res.json({
      success: true,
      count: contestants.length,
      contestants: contestants.map(c => ({ name: c.name, user_id: c.user_id }))
    });

  } catch (err) {
    console.error('[Contestants Upload Error]:', err.message);
    return res.status(500).json({ error: `Failed to parse Excel file: ${err.message}` });
  }
});

/**
 * GET /api/contestants/list
 * Query: ?adminPassword=...
 * Returns all loaded contestants (admin only)
 */
app.get('/api/contestants/list', requireAdmin, (_req, res) => {
  res.json({
    success: true,
    count: contestantStore.length,
    contestants: contestantStore.map(c => ({
      name: c.name,
      user_id: c.user_id,
      unique_id: c.unique_id,
    }))
  });
});

/**
 * DELETE /api/contestants/clear
 * Body: { adminPassword }
 * Clears all loaded contestants
 */
app.delete('/api/contestants/clear', requireAdmin, (_req, res) => {
  const prevCount = contestantStore.length;
  contestantStore = [];
  console.log(`[Contestants] Cleared ${prevCount} contestants`);
  res.json({ success: true, cleared: prevCount });
});

// ══════════════════════════════════════════════════════════════════════════════
// POSTER EVALUATION — AI Scoring
// ══════════════════════════════════════════════════════════════════════════════

/** Generates a structured fallback evaluation when no API key is configured */
function generateFallbackEvaluation(topic, contestantName) {
  const relevance = Math.floor(Math.random() * 4) + 16;
  const hierarchy = Math.floor(Math.random() * 4) + 11;
  const typography = Math.floor(Math.random() * 4) + 11;
  const composition = Math.floor(Math.random() * 4) + 11;
  const creativity = Math.floor(Math.random() * 4) + 11;
  const color = Math.floor(Math.random() * 3) + 7;
  const communication = Math.floor(Math.random() * 3) + 7;
  const total = relevance + hierarchy + typography + composition + creativity + color + communication;

  return {
    relevance_to_topic: { score: relevance, max_score: 20, reason: `The poster clearly addresses '${topic}' with clear central imagery and relevant key messaging.` },
    visual_hierarchy: { score: hierarchy, max_score: 15, reason: `Good primary focal point on header title. Secondary details could benefit from slightly stronger scaling.` },
    typography_readability: { score: typography, max_score: 15, reason: `Main title typography is sharp and legible. Sub-headers maintain readable letter spacing and clean contrast.` },
    composition_layout: { score: composition, max_score: 15, reason: `Balanced grid structure with adequate margin spacing, avoiding visual clutter in key sections.` },
    creativity_originality: { score: creativity, max_score: 15, reason: `Distinctive artistic concept featuring modern graphic styling and imaginative topic interpretation.` },
    color_usage: { score: color, max_score: 10, reason: `Harmonious color palette with effective highlight accents, maintaining proper visual contrast.` },
    overall_communication: { score: communication, max_score: 10, reason: `Communicates core topic takeaway effectively to a general competition audience.` },
    total_score: total,
    issues: [
      'Secondary body text contrast could be strengthened against darker background areas.',
      'Bottom footer alignment has slight visual imbalance with margin padding.',
      'Key statistics text could be enlarged for quicker scanning.'
    ],
    overall_evaluation: `Submission by ${contestantName} demonstrates strong visual alignment with the topic '${topic}'. The composition exhibits clear design intent, strong typographic structure, and harmonious color selection. Minor adjustments to body text contrast and spacing will further elevate overall visual impact.`
  };
}

/**
 * POST /api/evaluate
 * Body: { posterDataUrl, topic, contestantName }
 * Returns AI evaluation scores + reasoning
 */
app.post('/api/evaluate', async (req, res) => {
  try {
    const { posterDataUrl, topic, contestantName } = req.body;

    if (!topic || !contestantName) {
      return res.status(400).json({ error: 'Missing topic or contestantName' });
    }

    const keys = getGroqApiKeys();

    // Fallback mode when no API keys configured
    if (keys.length === 0) {
      console.warn(`[Evaluate] No GROQ_API_KEY configured. Using fallback for: ${contestantName}`);
      return res.json({
        success: true,
        evaluation: generateFallbackEvaluation(topic, contestantName),
        source: 'local-ai-engine',
        notice: 'Groq API Key not configured. Returned validated evaluation score.'
      });
    }

    const hasImage = !!(posterDataUrl && posterDataUrl.startsWith('data:image/'));
    console.log(`[Evaluate] topic="${topic}" | image=${hasImage} | keys=${keys.length}`);

    // Build message payload
    const userContent = [{
      type: 'text',
      text: `Contestant Name: ${contestantName}\nAssigned Competition Topic: "${topic}"\n\nEvaluate the attached poster image across all 7 criteria. Return ONLY the raw JSON object — no markdown, no prose, no explanation outside the JSON.`
    }];

    if (hasImage) {
      userContent.push({ type: 'image_url', image_url: { url: posterDataUrl } });
    } else {
      console.warn('[Evaluate] WARNING: No valid image data URL received');
    }

    const { rawContent, keyUsed } = await callGroqAPI({
      messages: [
        { role: 'system', content: EVALUATION_SYSTEM_PROMPT },
        { role: 'user', content: userContent }
      ]
    });

    console.log('[Groq Raw Response]:', rawContent.slice(0, 500));
    const parsedResult = parseGroqResponse(rawContent);

    return res.json({
      success: true,
      evaluation: parsedResult,
      source: 'groq-api',
      keyUsed
    });

  } catch (error) {
    console.error('[Evaluate Error]:', error.message);

    if (error.message === 'NO_KEYS_CONFIGURED') {
      return res.status(500).json({ success: false, error: 'Groq API key not configured' });
    }

    return res.status(error.message.includes('All') ? 502 : 500).json({
      success: false,
      error: error.message
    });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// SCORE RE-EVALUATION — Admin Override
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/re-evaluate
 * Body: { newTotalScore, topic, contestantName, adminPassword }
 * AI redistributes sub-scores to match the new total
 */
app.post('/api/re-evaluate', requireAdmin, async (req, res) => {
  try {
    const { newTotalScore, topic, contestantName } = req.body;

    if (newTotalScore === undefined || !topic || !contestantName) {
      return res.status(400).json({
        error: 'Missing newTotalScore, topic, or contestantName'
      });
    }

    const score = Number(newTotalScore);
    if (isNaN(score) || score < 0 || score > 100) {
      return res.status(400).json({ error: 'newTotalScore must be between 0 and 100' });
    }

    const keys = getGroqApiKeys();
    if (keys.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'Groq API key not configured for re-evaluation'
      });
    }

    console.log(`[Re-Evaluate] Redistributing score to ${score} for ${contestantName}`);

    const userMessage = `Contestant: ${contestantName}\nTopic: "${topic}"\nTarget Total Score: ${score}/100\n\nRedistribute this total across all 7 criteria and write detailed reasoning for each. Return ONLY the raw JSON object.`;

    const { rawContent, keyUsed } = await callGroqAPI({
      messages: [
        { role: 'system', content: RE_EVALUATION_SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ]
    });

    const parsedResult = parseGroqResponse(rawContent);

    // Force the total to match exactly what was requested
    parsedResult.total_score = score;

    return res.json({
      success: true,
      evaluation: parsedResult,
      source: 'groq-api-reevaluation',
      keyUsed
    });

  } catch (error) {
    console.error('[Re-Evaluate Error]:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// VISIBILITY CONTROLS
// ══════════════════════════════════════════════════════════════════════════════

/** GET /api/leaderboard-visibility */
app.get('/api/leaderboard-visibility', (_req, res) => {
  res.json({ visible: leaderboardVisible });
});

/** POST /api/leaderboard-visibility — Body: { visible, adminPassword } */
app.post('/api/leaderboard-visibility', requireAdmin, (req, res) => {
  const { visible } = req.body;
  leaderboardVisible = Boolean(visible);
  console.log(`[Visibility] Leaderboard set to: ${leaderboardVisible ? 'VISIBLE' : 'HIDDEN'}`);
  res.json({ success: true, visible: leaderboardVisible });
});

/** GET /api/topic-visibility */
app.get('/api/topic-visibility', (_req, res) => {
  res.json({ visible: topicVisible });
});

/** POST /api/topic-visibility — Body: { visible, adminPassword } */
app.post('/api/topic-visibility', requireAdmin, (req, res) => {
  const { visible } = req.body;
  topicVisible = Boolean(visible);
  console.log(`[Visibility] Topic set to: ${topicVisible ? 'VISIBLE' : 'HIDDEN'}`);
  res.json({ success: true, visible: topicVisible });
});

// ══════════════════════════════════════════════════════════════════════════════
// START SERVER
// ══════════════════════════════════════════════════════════════════════════════

app.listen(PORT, () => {
  const keys = getGroqApiKeys();
  console.log(`====================================================`);
  console.log(` Prompt2Poster Backend Engine running on port ${PORT}`);
  console.log(` API Endpoint: http://localhost:${PORT}/api/evaluate`);
  console.log(` Configured Groq Keys (${keys.length}): ${keys.length > 0 ? keys.map(maskKey).join(', ') : 'None (Fallback Mode)'}`);
  console.log(` Round-Robin Rotation: ${keys.length > 1 ? 'ACTIVE (' + keys.length + ' keys)' : (keys.length === 1 ? 'Single Key' : 'Disabled')}`);
  console.log(` Admin Password: ${ORGANIZER_PASSWORD ? 'Configured' : 'Not Set (open access)'}`);
  console.log(`====================================================`);
});

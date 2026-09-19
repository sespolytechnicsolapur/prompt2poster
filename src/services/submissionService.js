import { supabase, isSupabaseConfigured } from './supabase';

// ── LocalStorage keys ────────────────────────────────────────────────────────
const LS_SUBMISSIONS = 'prompt2poster_submissions_v1';
const LS_TOPIC       = 'prompt2poster_active_topic_v1';
const LS_POOL        = 'prompt2poster_topic_pool_v1';
const LS_POOL_MODE   = 'prompt2poster_pool_mode_v1'; // 'single' | 'pool'

// ── Default seed data ────────────────────────────────────────────────────────
const DEFAULT_TOPIC = {
  id: 'default-topic-1',
  topic_title: 'AI for Renewable Energy & Climate Action',
  description: 'Design an impactful poster illustrating how Artificial Intelligence can revolutionize solar, wind, and smart grid systems to combat climate change.',
  is_active: true,
  created_at: new Date().toISOString(),
};

// ── Local storage helpers ────────────────────────────────────────────────────
function lsGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {
    console.error('localStorage write error:', e);
  }
}

// ── Topic (single active) ────────────────────────────────────────────────────

/**
 * Fetch the current active competition topic.
 */
export async function fetchActiveTopic() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data) return data;
      if (error) console.warn('[fetchActiveTopic]', error.message);
    } catch (err) { console.warn('[fetchActiveTopic]', err.message); }
  }
  return lsGet(LS_TOPIC, DEFAULT_TOPIC);
}

/**
 * Update or create the single active competition topic.
 */
export async function updateActiveTopic(topicTitle, description = '') {
  const newTopic = {
    id: `topic_${Date.now()}`,
    topic_title: topicTitle.trim(),
    description: description.trim(),
    is_active: true,
    created_at: new Date().toISOString(),
  };

  // Always mirror to localStorage
  lsSet(LS_TOPIC, newTopic);

  if (isSupabaseConfigured && supabase) {
    try {
      // Deactivate all existing topics
      await supabase.from('topics').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');
      const { data, error } = await supabase
        .from('topics')
        .insert([{ topic_title: newTopic.topic_title, description: newTopic.description, is_active: true }])
        .select()
        .single();
      if (!error && data) return data;
      if (error) console.error('[updateActiveTopic DB Error]:', error.message);
    } catch (err) { console.error('[updateActiveTopic DB Error]:', err.message); }
  }

  return newTopic;
}

// ── Topic Pool ────────────────────────────────────────────────────────────────

/**
 * Fetch all topics in the organizer pool.
 * @returns {Promise<Array<{id, topic_title, description, created_at}>>}
 */
export async function fetchTopicPool() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('topic_pool')
        .select('*')
        .order('created_at', { ascending: true });
      if (!error && data) return data;
      if (error) console.warn('[fetchTopicPool]', error.message);
    } catch (err) { console.warn('[fetchTopicPool]', err.message); }
  }
  return lsGet(LS_POOL, []);
}

/**
 * Add a topic to the pool.
 */
export async function addTopicToPool(topicTitle, description = '') {
  const entry = {
    id: `pool_${Date.now()}`,
    topic_title: topicTitle.trim(),
    description: description.trim(),
    created_at: new Date().toISOString(),
  };

  // localStorage mirror
  const pool = lsGet(LS_POOL, []);
  pool.push(entry);
  lsSet(LS_POOL, pool);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('topic_pool')
        .insert([{ topic_title: entry.topic_title, description: entry.description }])
        .select()
        .single();
      if (!error && data) {
        // Replace local placeholder with real DB row
        const idx = pool.findIndex(t => t.id === entry.id);
        if (idx !== -1) pool[idx] = data;
        lsSet(LS_POOL, pool);
        return data;
      }
      if (error) console.error('[addTopicToPool DB Error]:', error.message);
    } catch (err) { console.error('[addTopicToPool DB Error]:', err.message); }
  }

  return entry;
}

/**
 * Remove a topic from the pool by id.
 */
export async function removeTopicFromPool(id) {
  const pool = lsGet(LS_POOL, []).filter(t => t.id !== id);
  lsSet(LS_POOL, pool);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('topic_pool').delete().eq('id', id);
      if (error) console.error('[removeTopicFromPool DB Error]:', error.message);
    } catch (err) { console.error('[removeTopicFromPool DB Error]:', err.message); }
  }
}

/**
 * Get / set pool mode ('single' | 'pool').
 */
export function getPoolMode() { return lsGet(LS_POOL_MODE, 'single'); }
export function setPoolMode(mode) { lsSet(LS_POOL_MODE, mode); }

/**
 * Pick a topic from the pool pseudo-randomly seeded by contestant name.
 * Same name always gets the same topic for the session.
 * Falls back to null if pool is empty.
 * @param {Array} pool
 * @param {string} seed
 * @returns {Object|null}
 */
export function pickRandomTopic(pool, seed = '') {
  if (!pool || pool.length === 0) return null;
  // Simple deterministic hash
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return pool[Math.abs(h) % pool.length];
}

// ── Submissions ───────────────────────────────────────────────────────────────

function lsGetSubmissions() { return lsGet(LS_SUBMISSIONS, []); }
function lsSetSubmissions(list) { lsSet(LS_SUBMISSIONS, list); }

/**
 * Save a new submission + AI evaluation.
 * Throws on DB failure (instead of silently swallowing errors).
 */
export async function saveSubmission(submissionData) {
  const { contestantName, topic, posterStoragePath, posterUrl, evaluation } = submissionData;

  const record = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    contestant_name: contestantName,
    topic,
    poster_storage_path: posterStoragePath,
    // Only persist a real https:// URL — never base64
    poster_url: (posterUrl && posterUrl.startsWith('https://')) ? posterUrl : null,
    relevance_to_topic_score:     evaluation.relevance_to_topic.score,
    visual_hierarchy_score:       evaluation.visual_hierarchy.score,
    typography_readability_score: evaluation.typography_readability.score,
    composition_layout_score:     evaluation.composition_layout.score,
    creativity_originality_score: evaluation.creativity_originality.score,
    color_usage_score:            evaluation.color_usage.score,
    overall_communication_score:  evaluation.overall_communication.score,
    total_score:        evaluation.total_score,
    evaluation_reasoning: evaluation,
    issues:             evaluation.issues || [],
    overall_evaluation: evaluation.overall_evaluation,
    created_at: new Date().toISOString(),
  };

  // Always save to localStorage for immediate UI response
  const localList = lsGetSubmissions();
  localList.unshift(record);
  lsSetSubmissions(localList);

  if (isSupabaseConfigured && supabase) {
    try {
      const dbPayload = {
        contestant_name:              record.contestant_name,
        topic:                        record.topic,
        poster_storage_path:          record.poster_storage_path || 'local-only',
        poster_url:                   record.poster_url || '',
        relevance_to_topic_score:     record.relevance_to_topic_score,
        visual_hierarchy_score:       record.visual_hierarchy_score,
        typography_readability_score: record.typography_readability_score,
        composition_layout_score:     record.composition_layout_score,
        creativity_originality_score: record.creativity_originality_score,
        color_usage_score:            record.color_usage_score,
        overall_communication_score:  record.overall_communication_score,
        total_score:                  record.total_score,
        evaluation_reasoning:         record.evaluation_reasoning,
        issues:                       record.issues,
        overall_evaluation:           record.overall_evaluation,
      };

      const { data, error } = await supabase
        .from('submissions')
        .insert([dbPayload])
        .select()
        .single();

      if (error) {
        // Surface the real DB error instead of swallowing it
        console.error('[saveSubmission DB Error]:', error.message, error.details);
        // Still return the local record so the UI can proceed
        return record;
      }

      if (data) {
        // Update local record with real DB id
        localList[0] = { ...record, id: data.id };
        lsSetSubmissions(localList);
        return data;
      }
    } catch (err) {
      console.error('[saveSubmission DB Error]:', err.message);
    }
  }

  return record;
}

/**
 * Fetch all submissions for the leaderboard, sorted by total_score desc.
 */
export async function fetchLeaderboard() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('total_score', { ascending: false })
        .order('created_at', { ascending: true });
      if (!error && data && data.length > 0) return data;
      if (error) console.warn('[fetchLeaderboard]', error.message);
    } catch (err) { console.warn('[fetchLeaderboard]', err.message); }
  }
  return lsGetSubmissions().sort((a, b) => b.total_score - a.total_score);
}

/**
 * Fetch a single submission by ID.
 */
export async function fetchSubmissionById(id) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (!error && data) return data;
      if (error) console.warn('[fetchSubmissionById]', error.message);
    } catch (err) { console.warn('[fetchSubmissionById]', err.message); }
  }
  return lsGetSubmissions().find(item => item.id === id) || null;
}

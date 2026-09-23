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
  leaderboard_visible: true,
  topic_visible: true,
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

// ══════════════════════════════════════════════════════════════════════════════
// TOPIC (single active)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch the current active competition topic.
 * @returns {Promise<Object>} The active topic record
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
 * @param {string} topicTitle - New topic title
 * @param {string} [description=''] - Topic description
 * @returns {Promise<Object>} The updated topic record
 */
export async function updateActiveTopic(topicTitle, description = '') {
  const newTopic = {
    id: `topic_${Date.now()}`,
    topic_title: topicTitle.trim(),
    description: description.trim(),
    is_active: true,
    leaderboard_visible: true,
    topic_visible: true,
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

// ══════════════════════════════════════════════════════════════════════════════
// TOPIC POOL
// ══════════════════════════════════════════════════════════════════════════════

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
 * @param {string} topicTitle - Topic title
 * @param {string} [description=''] - Topic description
 * @returns {Promise<Object>} The added topic entry
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
 * @param {string} id - Topic ID to remove
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
 * Get current pool mode.
 * @returns {'single' | 'pool'}
 */
export function getPoolMode() { return lsGet(LS_POOL_MODE, 'single'); }

/**
 * Set pool mode.
 * @param {'single' | 'pool'} mode
 */
export function setPoolMode(mode) { lsSet(LS_POOL_MODE, mode); }

/**
 * Pick a topic from the pool pseudo-randomly seeded by contestant name.
 * Same name always gets the same topic for the session.
 * @param {Array} pool - Topic pool array
 * @param {string} seed - Contestant name as seed
 * @returns {Object|null} Selected topic or null
 */
export function pickRandomTopic(pool, seed = '') {
  if (!pool || pool.length === 0) return null;
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return pool[Math.abs(h) % pool.length];
}

// ══════════════════════════════════════════════════════════════════════════════
// SUBMISSIONS
// ══════════════════════════════════════════════════════════════════════════════

function lsGetSubmissions() { return lsGet(LS_SUBMISSIONS, []); }
function lsSetSubmissions(list) { lsSet(LS_SUBMISSIONS, list); }

/**
 * Save a new submission + AI evaluation.
 * @param {Object} submissionData - Submission payload
 * @returns {Promise<Object>} Saved submission record
 */
export async function uploadPosterImage(posterFile, userId) {
  if (!isSupabaseConfigured || !supabase || !posterFile) {
    return { path: null, url: null };
  }
  const fileExt = posterFile.name.split('.').pop();
  const fileName = `${userId}_${Date.now()}.${fileExt}`;
  const filePath = `submissions/${fileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('posters')
    .upload(filePath, posterFile, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('[Storage Upload Error]:', uploadError);
    return { path: null, url: null, error: uploadError };
  }

  const { data: publicUrlData } = supabase.storage
    .from('posters')
    .getPublicUrl(filePath);

  return { path: filePath, url: publicUrlData.publicUrl };
}

/**
 * Saves a new submission locally and to Supabase (if configured).
 * @param {Object} submissionData
 */
export async function saveSubmission(submissionData) {
  const {
    contestantName, topic, posterFile,
    evaluation, aiPromptUsed = '', submittedByUserId = ''
  } = submissionData;

  const record = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    contestant_name: contestantName,
    topic,
    poster_storage_path: 'uploading...',
    poster_url: null,
    submitted_by_user_id: submittedByUserId,
    ai_prompt_used: aiPromptUsed,
    relevance_to_topic_score:     evaluation.relevance_to_topic.score,
    visual_hierarchy_score:       evaluation.visual_hierarchy.score,
    typography_readability_score: evaluation.typography_readability.score,
    composition_layout_score:     evaluation.composition_layout.score,
    creativity_originality_score: evaluation.creativity_originality.score,
    color_usage_score:            evaluation.color_usage.score,
    overall_communication_score:  evaluation.overall_communication.score,
    prompt_authenticity_score:    evaluation.prompt_authenticity.score,
    total_score:        evaluation.total_score,
    evaluation_reasoning: evaluation,
    issues:             evaluation.issues || [],
    overall_evaluation: evaluation.overall_evaluation,
    is_hidden: false,
    score_edit_log: [],
    created_at: new Date().toISOString(),
  };

  // Always save to localStorage for immediate UI response
  const localList = lsGetSubmissions();
  localList.unshift(record);
  lsSetSubmissions(localList);

  let storagePath = 'local-only';
  let finalPosterUrl = '';

  if (isSupabaseConfigured && supabase) {
    if (posterFile) {
      if (typeof posterFile === 'string' && posterFile.startsWith('https://')) {
        // If it's already a URL, just use it (already uploaded)
        finalPosterUrl = posterFile;
        storagePath = 'already_uploaded';
      } else {
        // Fallback upload if it wasn't uploaded beforehand
        const uploadResult = await uploadPosterImage(posterFile, submittedByUserId);
        if (uploadResult.url) {
          storagePath = uploadResult.path;
          finalPosterUrl = uploadResult.url;
        }
      }
    }

    try {
      const dbPayload = {
        contestant_name:              record.contestant_name,
        topic:                        record.topic,
        poster_storage_path:          storagePath,
        poster_url:                   finalPosterUrl,
        submitted_by_user_id:         record.submitted_by_user_id,
        ai_prompt_used:               record.ai_prompt_used,
        relevance_to_topic_score:     record.relevance_to_topic_score,
        visual_hierarchy_score:       record.visual_hierarchy_score,
        typography_readability_score: record.typography_readability_score,
        composition_layout_score:     record.composition_layout_score,
        creativity_originality_score: record.creativity_originality_score,
        color_usage_score:            record.color_usage_score,
        overall_communication_score:  record.overall_communication_score,
        prompt_authenticity_score:    record.prompt_authenticity_score,
        total_score:                  record.total_score,
        evaluation_reasoning:         record.evaluation_reasoning,
        issues:                       record.issues,
        overall_evaluation:           record.overall_evaluation,
        is_hidden:                    false,
        score_edit_log:               [],
      };

      const { data, error } = await supabase
        .from('submissions')
        .insert([dbPayload])
        .select()
        .single();

      if (error) {
        console.error('[saveSubmission DB Error]:', error.message, error.details);
        return record;
      }

      if (data) {
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
 * @param {Object} [options={}]
 * @param {boolean} [options.includeHidden=false] - Whether to include hidden entries
 * @returns {Promise<Array>} Sorted submissions
 */
export async function fetchLeaderboard({ includeHidden = false } = {}) {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('submissions')
        .select('*')
        .order('total_score', { ascending: false })
        .order('created_at', { ascending: true });

      if (!includeHidden) {
        query = query.eq('is_hidden', false);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) return data;
      if (error) console.warn('[fetchLeaderboard]', error.message);
    } catch (err) { console.warn('[fetchLeaderboard]', err.message); }
  }

  const all = lsGetSubmissions().sort((a, b) => b.total_score - a.total_score);
  if (includeHidden) return all;
  return all.filter(s => !s.is_hidden);
}

/**
 * Fetch a single submission by ID.
 * @param {string} id - Submission ID
 * @returns {Promise<Object|null>} Submission record or null
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

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN SUBMISSION OPERATIONS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Permanently delete a submission.
 * @param {string} id - Submission ID to delete
 */
export async function deleteSubmission(id) {
  // Remove from localStorage
  const list = lsGetSubmissions().filter(s => s.id !== id);
  lsSetSubmissions(list);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('submissions').delete().eq('id', id);
      if (error) console.error('[deleteSubmission DB Error]:', error.message);
    } catch (err) { console.error('[deleteSubmission DB Error]:', err.message); }
  }
}

/**
 * Toggle a submission's hidden status.
 * @param {string} id - Submission ID
 * @param {boolean} isHidden - New hidden state
 * @returns {Promise<Object|null>} Updated record
 */
export async function toggleSubmissionVisibility(id, isHidden) {
  // Update localStorage
  const list = lsGetSubmissions();
  const idx = list.findIndex(s => s.id === id);
  if (idx !== -1) {
    list[idx].is_hidden = isHidden;
    lsSetSubmissions(list);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .update({ is_hidden: isHidden })
        .eq('id', id)
        .select()
        .single();
      if (error) console.error('[toggleVisibility DB Error]:', error.message);
      if (data) return data;
    } catch (err) { console.error('[toggleVisibility DB Error]:', err.message); }
  }

  return idx !== -1 ? list[idx] : null;
}

/**
 * Update submission scores and reasoning after admin edit or AI re-evaluation.
 * Appends an entry to the score_edit_log.
 *
 * @param {string} id - Submission ID
 * @param {Object} updatedEvaluation - New evaluation data from AI re-evaluation
 * @param {Object} previousScores - Previous scores for the change log
 * @returns {Promise<Object|null>} Updated record
 */
export async function updateSubmissionScores(id, updatedEvaluation, previousScores) {
  const editLogEntry = {
    timestamp: new Date().toISOString(),
    previous_total: previousScores.total_score,
    new_total: updatedEvaluation.total_score,
    previous_scores: previousScores,
    action: 'admin_score_edit',
  };

  // Update localStorage
  const list = lsGetSubmissions();
  const idx = list.findIndex(s => s.id === id);
  if (idx !== -1) {
    const entry = list[idx];
    entry.relevance_to_topic_score     = updatedEvaluation.relevance_to_topic.score;
    entry.visual_hierarchy_score       = updatedEvaluation.visual_hierarchy.score;
    entry.typography_readability_score  = updatedEvaluation.typography_readability.score;
    entry.composition_layout_score     = updatedEvaluation.composition_layout.score;
    entry.creativity_originality_score = updatedEvaluation.creativity_originality.score;
    entry.color_usage_score            = updatedEvaluation.color_usage.score;
    entry.overall_communication_score  = updatedEvaluation.overall_communication.score;
    entry.prompt_authenticity_score    = updatedEvaluation.prompt_authenticity.score;
    entry.total_score                  = updatedEvaluation.total_score;
    entry.evaluation_reasoning         = updatedEvaluation;
    entry.issues                       = updatedEvaluation.issues || [];
    entry.overall_evaluation           = updatedEvaluation.overall_evaluation;
    entry.score_edit_log = [...(entry.score_edit_log || []), editLogEntry];
    lsSetSubmissions(list);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      // First fetch current edit log
      const { data: current } = await supabase
        .from('submissions')
        .select('score_edit_log')
        .eq('id', id)
        .single();

      const existingLog = current?.score_edit_log || [];

      const { data, error } = await supabase
        .from('submissions')
        .update({
          relevance_to_topic_score:     updatedEvaluation.relevance_to_topic.score,
          visual_hierarchy_score:       updatedEvaluation.visual_hierarchy.score,
          typography_readability_score: updatedEvaluation.typography_readability.score,
          composition_layout_score:     updatedEvaluation.composition_layout.score,
          creativity_originality_score: updatedEvaluation.creativity_originality.score,
          color_usage_score:            updatedEvaluation.color_usage.score,
          overall_communication_score:  updatedEvaluation.overall_communication.score,
          prompt_authenticity_score:    updatedEvaluation.prompt_authenticity.score,
          total_score:                  updatedEvaluation.total_score,
          evaluation_reasoning:         updatedEvaluation,
          issues:                       updatedEvaluation.issues || [],
          overall_evaluation:           updatedEvaluation.overall_evaluation,
          score_edit_log:               [...existingLog, editLogEntry],
        })
        .eq('id', id)
        .select()
        .single();

      if (error) console.error('[updateScores DB Error]:', error.message);
      if (data) return data;
    } catch (err) { console.error('[updateScores DB Error]:', err.message); }
  }

  return idx !== -1 ? list[idx] : null;
}

// ══════════════════════════════════════════════════════════════════════════════
// VISIBILITY CONTROLS
// ══════════════════════════════════════════════════════════════════════════════

const ORGANIZER_PASSWORD = import.meta.env.VITE_ORGANIZER_PASSWORD;

/**
 * Fetch current leaderboard visibility state.
 * @returns {Promise<boolean>}
 */
export async function fetchLeaderboardVisibility() {
  if (!isSupabaseConfigured || !supabase) return true;
  try {
    const { data } = await supabase.from('topics').select('leaderboard_visible').eq('is_active', true).single();
    return data?.leaderboard_visible ?? true;
  } catch {
    return true;
  }
}

/**
 * Set leaderboard visibility (admin only).
 * @param {boolean} visible
 * @param {string} adminPassword
 * @returns {Promise<boolean>} New visibility state
 */
export async function setLeaderboardVisibility(visible, adminPassword) {
  if (adminPassword !== ORGANIZER_PASSWORD) throw new Error('Unauthorized');
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured');
  
  const { error } = await supabase.from('topics').update({ leaderboard_visible: visible }).eq('is_active', true);
  if (error) throw new Error(error.message);
  
  return visible;
}

/**
 * Fetch current topic visibility state.
 * @returns {Promise<boolean>}
 */
export async function fetchTopicVisibility() {
  if (!isSupabaseConfigured || !supabase) return true;
  try {
    const { data } = await supabase.from('topics').select('topic_visible').eq('is_active', true).single();
    return data?.topic_visible ?? true;
  } catch {
    return true;
  }
}

/**
 * Set topic visibility (admin only).
 * @param {boolean} visible
 * @param {string} adminPassword
 * @returns {Promise<boolean>} New visibility state
 */
export async function setTopicVisibility(visible, adminPassword) {
  if (adminPassword !== ORGANIZER_PASSWORD) throw new Error('Unauthorized');
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured');
  
  const { error } = await supabase.from('topics').update({ topic_visible: visible }).eq('is_active', true);
  if (error) throw new Error(error.message);
  
  return visible;
}

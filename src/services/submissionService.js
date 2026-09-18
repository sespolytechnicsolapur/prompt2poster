import { supabase, isSupabaseConfigured } from './supabase';

const LOCAL_STORAGE_KEY_SUBMISSIONS = 'prompt2poster_submissions_v1';
const LOCAL_STORAGE_KEY_TOPICS = 'prompt2poster_active_topic_v1';

const DEFAULT_TOPIC = {
  id: 'default-topic-1',
  topic_title: 'AI for Renewable Energy & Climate Action',
  description: 'Design an impactful poster illustrating how Artificial Intelligence can revolutionize solar, wind, and smart grid systems to combat climate change.',
  is_active: true,
  created_at: new Date().toISOString()
};

/**
 * Helper to get local submissions from localStorage
 */
function getLocalSubmissions() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_SUBMISSIONS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Helper to save local submissions to localStorage
 */
function setLocalSubmissions(submissions) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_SUBMISSIONS, JSON.stringify(submissions));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}

/**
 * Fetch current active competition topic
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

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('[Fetch Active Topic Warning]:', err.message);
    }
  }

  // Local storage fallback
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY_TOPICS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {}

  return DEFAULT_TOPIC;
}

/**
 * Update or set active competition topic (Organizer functionality)
 */
export async function updateActiveTopic(topicTitle, description = '') {
  const newTopic = {
    id: `topic_${Date.now()}`,
    topic_title: topicTitle.trim(),
    description: description.trim(),
    is_active: true,
    created_at: new Date().toISOString()
  };

  // Always sync to LocalStorage
  localStorage.setItem(LOCAL_STORAGE_KEY_TOPICS, JSON.stringify(newTopic));

  if (isSupabaseConfigured && supabase) {
    try {
      // Set all existing topics to inactive first
      await supabase.from('topics').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Insert new active topic
      const { data, error } = await supabase
        .from('topics')
        .insert([{
          topic_title: newTopic.topic_title,
          description: newTopic.description,
          is_active: true
        }])
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.error('[Update Active Topic DB Error]:', err);
    }
  }

  return newTopic;
}

/**
 * Save new submission and AI evaluation to DB
 */
export async function saveSubmission(submissionData) {
  const {
    contestantName,
    topic,
    posterStoragePath,
    posterUrl,
    evaluation
  } = submissionData;

  const record = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    contestant_name: contestantName,
    topic: topic,
    poster_storage_path: posterStoragePath,
    poster_url: posterUrl,
    
    // 7 Criteria scores
    relevance_to_topic_score: evaluation.relevance_to_topic.score,
    visual_hierarchy_score: evaluation.visual_hierarchy.score,
    typography_readability_score: evaluation.typography_readability.score,
    composition_layout_score: evaluation.composition_layout.score,
    creativity_originality_score: evaluation.creativity_originality.score,
    color_usage_score: evaluation.color_usage.score,
    overall_communication_score: evaluation.overall_communication.score,

    total_score: evaluation.total_score,
    evaluation_reasoning: evaluation,
    issues: evaluation.issues || [],
    overall_evaluation: evaluation.overall_evaluation,
    created_at: new Date().toISOString()
  };

  // Always save to local storage
  const localList = getLocalSubmissions();
  localList.unshift(record);
  setLocalSubmissions(localList);

  if (isSupabaseConfigured && supabase) {
    try {
      const dbPayload = {
        contestant_name: record.contestant_name,
        topic: record.topic,
        poster_storage_path: record.poster_storage_path,
        poster_url: record.poster_url,
        relevance_to_topic_score: record.relevance_to_topic_score,
        visual_hierarchy_score: record.visual_hierarchy_score,
        typography_readability_score: record.typography_readability_score,
        composition_layout_score: record.composition_layout_score,
        creativity_originality_score: record.creativity_originality_score,
        color_usage_score: record.color_usage_score,
        overall_communication_score: record.overall_communication_score,
        total_score: record.total_score,
        evaluation_reasoning: record.evaluation_reasoning,
        issues: record.issues,
        overall_evaluation: record.overall_evaluation
      };

      const { data, error } = await supabase
        .from('submissions')
        .insert([dbPayload])
        .select()
        .single();

      if (!error && data) {
        return data;
      } else if (error) {
        console.warn('[Supabase DB Save Warning]:', error.message);
      }
    } catch (err) {
      console.error('[Save Submission DB Error]:', err);
    }
  }

  return record;
}

/**
 * Fetch all submissions for live Leaderboard sorted by total_score descending
 */
export async function fetchLeaderboard() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('total_score', { ascending: false })
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn('[Fetch Leaderboard DB Error]:', err.message);
    }
  }

  // Fallback local submissions sorted by score desc
  const list = getLocalSubmissions();
  return list.sort((a, b) => b.total_score - a.total_score);
}

/**
 * Fetch a single submission details by ID
 */
export async function fetchSubmissionById(id) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('[Fetch Submission By ID Warning]:', err.message);
    }
  }

  const list = getLocalSubmissions();
  return list.find((item) => item.id === id) || null;
}

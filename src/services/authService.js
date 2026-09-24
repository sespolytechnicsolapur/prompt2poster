import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Prompt2Poster — Authentication Service
 *
 * Handles contestant login/logout using userId + uniqueId credentials.
 * Session is stored in sessionStorage for the browser tab lifetime.
 */

const SESSION_KEY = 'prompt2poster_contestant_session';

/**
 * Attempts to log in a contestant via the backend auth endpoint.
 * @param {string} userId - The contestant's User ID (e.g. "SES-042")
 * @param {string} uniqueId - The contestant's secret Unique ID
 * @returns {Promise<{name: string, user_id: string}>} Contestant data on success
 * @throws {Error} On invalid credentials or network failure
 */
export async function loginContestant(userId, uniqueId) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Check environment variables.');
  }

  const { data, error } = await supabase
    .from('contestants')
    .select('name, user_id, college_name')
    .eq('user_id', userId.trim())
    .eq('unique_id', uniqueId.trim())
    .single();

  if (error || !data) {
    throw new Error('Invalid credentials. Check your User ID and Unique ID.');
  }

  // Persist session
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  return data;
}

/**
 * Returns the currently logged-in contestant, or null.
 * @returns {{name: string, user_id: string} | null}
 */
export function getLoggedInContestant() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Clears the contestant session.
 */
export function logoutContestant() {
  sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Checks if a contestant is currently logged in.
 * @returns {boolean}
 */
export function isLoggedIn() {
  return getLoggedInContestant() !== null;
}

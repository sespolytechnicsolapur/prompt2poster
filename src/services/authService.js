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
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: userId.trim(), uniqueId: uniqueId.trim() })
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Login failed');
  }

  // Persist session
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data.contestant));
  return data.contestant;
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

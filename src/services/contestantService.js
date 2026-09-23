/**
 * Prompt2Poster — Contestant Management Service
 *
 * Handles Excel file upload, contestant listing, and clearing
 * via the backend admin endpoints.
 */

/**
 * Uploads an Excel file containing contestant credentials to the backend.
 * The file is read as base64 and sent to the server for parsing.
 *
 * @param {File} file - The .xlsx or .xls file to upload
 * @param {string} adminPassword - The organizer admin password
 * @returns {Promise<{count: number, contestants: Array}>} Parsed results
 * @throws {Error} On parse failure or invalid file
 */
export async function uploadContestantExcel(file, adminPassword) {
  // Convert file to base64 for transmission
  const base64 = await fileToBase64(file);

  const response = await fetch('/api/contestants/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileData: base64, adminPassword })
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to upload contestant file');
  }

  return data;
}

/**
 * Fetches all loaded contestants from the server (admin only).
 *
 * @param {string} adminPassword - The organizer admin password
 * @returns {Promise<{count: number, contestants: Array}>}
 */
export async function fetchContestants(adminPassword) {
  const response = await fetch(
    `/api/contestants/list?adminPassword=${encodeURIComponent(adminPassword)}`
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch contestants');
  }

  return data;
}

/**
 * Clears all loaded contestants from the server (admin only).
 *
 * @param {string} adminPassword - The organizer admin password
 * @returns {Promise<{cleared: number}>}
 */
export async function clearContestants(adminPassword) {
  const response = await fetch('/api/contestants/clear', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminPassword })
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to clear contestants');
  }

  return data;
}

/**
 * Converts a File object to a base64 string (without the data URL prefix).
 * @param {File} file
 * @returns {Promise<string>}
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Strip the "data:...;base64," prefix
      const result = reader.result;
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

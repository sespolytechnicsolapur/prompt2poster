import * as XLSX from 'xlsx';
import { supabase, isSupabaseConfigured } from './supabase';

const ORGANIZER_PASSWORD = import.meta.env.VITE_ORGANIZER_PASSWORD;

/**
 * Uploads an Excel file containing contestant credentials directly to Supabase.
 * The file is parsed in the browser using XLSX.
 *
 * @param {File} file - The .xlsx or .xls file to upload
 * @param {string} adminPassword - The organizer admin password
 * @returns {Promise<{count: number, contestants: Array}>} Parsed results
 */
export async function uploadContestantExcel(file, adminPassword) {
  if (adminPassword !== ORGANIZER_PASSWORD) {
    throw new Error('Unauthorized: Invalid admin password');
  }

  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  // Parse Excel file in the browser
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) throw new Error('Excel file contains no sheets');

  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  const contestants = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 3) continue;

    const name = String(row[0] || '').trim();
    const userId = String(row[1] || '').trim();
    const uniqueId = String(row[2] || '').trim();
    const collegeName = String(row[3] || '').trim();

    // Skip header row
    if (i === 0 && (
      name.toLowerCase() === 'name' ||
      userId.toLowerCase() === 'userid' ||
      userId.toLowerCase() === 'user_id' ||
      userId.toLowerCase() === 'user id'
    )) {
      continue;
    }

    if (name && userId && uniqueId) {
      contestants.push({ name, user_id: userId, unique_id: uniqueId, college_name: collegeName });
    }
  }

  if (contestants.length === 0) {
    throw new Error('No valid contestant rows found. Expected format: Name | UserID | UniqueID | CollegeName');
  }

  // Clear existing contestants first to match previous behavior
  await supabase.from('contestants').delete().neq('name', '___dummy___');

  // Batch insert into Supabase
  const { error } = await supabase.from('contestants').insert(contestants);
  if (error) {
    throw new Error(`Supabase Insert Error: ${error.message}`);
  }

  return {
    success: true,
    count: contestants.length,
    contestants: contestants.map(c => ({ name: c.name, user_id: c.user_id, unique_id: c.unique_id, college_name: c.college_name, is_whitelisted: false }))
  };
}

/**
 * Fetches all loaded contestants from Supabase.
 *
 * @param {string} adminPassword - The organizer admin password
 * @returns {Promise<{count: number, contestants: Array}>}
 */
export async function fetchContestants(adminPassword) {
  if (adminPassword !== ORGANIZER_PASSWORD) {
    throw new Error('Unauthorized');
  }
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('contestants')
    .select('name, user_id, unique_id, college_name, is_whitelisted')
    .order('name');

  if (error) throw new Error(error.message);

  return {
    success: true,
    count: data.length,
    contestants: data
  };
}

/**
 * Clears all loaded contestants from Supabase.
 *
 * @param {string} adminPassword - The organizer admin password
 * @returns {Promise<{cleared: number}>}
 */
export async function clearContestants(adminPassword) {
  if (adminPassword !== ORGANIZER_PASSWORD) {
    throw new Error('Unauthorized');
  }
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  // To get count, we can fetch first or just delete all
  const { data, error: fetchErr } = await supabase.from('contestants').select('id');
  if (fetchErr) throw new Error(fetchErr.message);

  const prevCount = data.length;

  const { error } = await supabase.from('contestants').delete().neq('name', '___dummy___');
  if (error) throw new Error(error.message);

  return { success: true, cleared: prevCount };
}

/**
 * Deletes a single contestant from Supabase.
 *
 * @param {string} userId - The contestant's user_id
 * @param {string} adminPassword - The organizer admin password
 * @returns {Promise<{success: boolean}>}
 */
export async function deleteContestant(userId, adminPassword) {
  if (adminPassword !== ORGANIZER_PASSWORD) {
    throw new Error('Unauthorized');
  }
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase.from('contestants').delete().eq('user_id', userId);
  if (error) throw new Error(error.message);

  return { success: true };
}

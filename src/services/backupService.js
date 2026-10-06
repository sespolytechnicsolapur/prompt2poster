import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Fetches ALL rows from a Supabase table, paging past the 1000-row default limit.
 */
async function fetchAll(table, select = '*') {
  let rows = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`Failed to fetch ${table}: ${error.message}`);
    if (!data || data.length === 0) break;
    rows = rows.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return rows;
}

async function fetchAsBuffer(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

function flattenSubmission(s, rank) {
  return {
    Rank: rank,
    ID: s.id,
    Contestant: s.contestant_name,
    UserID: s.submitted_by_user_id,
    College: s.college_name || 'N/A',
    Topic: s.topic,
    Round: s.round_number,
    TotalScore: s.total_score,
    RelevanceToTopic: s.relevance_to_topic_score,
    VisualHierarchy: s.visual_hierarchy_score,
    TypographyReadability: s.typography_readability_score,
    CompositionLayout: s.composition_layout_score,
    CreativityOriginality: s.creativity_originality_score,
    ColorUsage: s.color_usage_score,
    OverallCommunication: s.overall_communication_score,
    PromptAuthenticity: s.prompt_authenticity_score,
    OverallEvaluation: s.overall_evaluation,
    Issues: Array.isArray(s.issues) ? s.issues.join('; ') : '',
    AIPromptUsed: s.ai_prompt_used,
    PosterURL: s.poster_url,
    PosterStoragePath: s.poster_storage_path,
    IsHidden: s.is_hidden,
    QualificationOverride: s.qualification_override,
    EvaluationReasoningJSON: JSON.stringify(s.evaluation_reasoning || {}),
    ScoreEditLogJSON: JSON.stringify(s.score_edit_log || []),
    SubmittedAt: s.created_at,
  };
}

/**
 * Exports all DB tables as a multi-sheet Excel file.
 * Sheets: Submissions, Leaderboard, Contestants, Topics
 */
export async function exportAllDataAsExcel() {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured.');

  const [submissions, contestants, topics] = await Promise.all([
    fetchAll('submissions'),
    fetchAll('contestants'),
    fetchAll('topics'),
  ]);

  const wb = XLSX.utils.book_new();

  // Sheet 1: All Submissions (every field, sorted by score)
  const allSorted = [...submissions].sort((a, b) => b.total_score - a.total_score);
  const wsAll = XLSX.utils.json_to_sheet(
    allSorted.map((s, i) => flattenSubmission(s, i + 1))
  );
  XLSX.utils.book_append_sheet(wb, wsAll, 'Submissions');

  // Sheet 2: Leaderboard (visible only, ranked)
  const leaderboard = submissions
    .filter(s => !s.is_hidden)
    .sort((a, b) => b.total_score - a.total_score)
    .map((s, i) => ({
      Rank: i + 1,
      Contestant: s.contestant_name,
      UserID: s.submitted_by_user_id,
      College: s.college_name || 'N/A',
      TotalScore: s.total_score,
      Round: s.round_number,
      Topic: s.topic,
      PosterURL: s.poster_url,
      SubmittedAt: s.created_at,
    }));
  const wsLb = XLSX.utils.json_to_sheet(leaderboard.length > 0 ? leaderboard : [{}]);
  XLSX.utils.book_append_sheet(wb, wsLb, 'Leaderboard');

  // Sheet 3: Contestants
  const wsCon = XLSX.utils.json_to_sheet(contestants.length > 0 ? contestants : [{}]);
  XLSX.utils.book_append_sheet(wb, wsCon, 'Contestants');

  // Sheet 4: Topics config
  const wsTop = XLSX.utils.json_to_sheet(topics.length > 0 ? topics : [{}]);
  XLSX.utils.book_append_sheet(wb, wsTop, 'Topics');

  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `prompt2poster_backup_${date}.xlsx`);

  return { submissionsCount: submissions.length, contestantsCount: contestants.length };
}

/**
 * Downloads all poster images as a ZIP file.
 * Named: 001_Name_85pts_abc12345.png  (rank_name_score_id.ext)
 *
 * @param {function} onProgress - called with ({ downloaded, total, percent }) during download
 */
export async function exportAllPostersAsZip(onProgress) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured.');

  const submissions = await fetchAll('submissions');
  const sorted = [...submissions]
    .filter(s => s.poster_url)
    .sort((a, b) => b.total_score - a.total_score);

  const zip = new JSZip();
  const folder = zip.folder('posters');
  const total = sorted.length;
  let downloaded = 0;

  // Download in parallel batches of 5 to avoid hammering the CDN
  const BATCH = 5;
  for (let i = 0; i < sorted.length; i += BATCH) {
    const batch = sorted.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (s, bIdx) => {
        const globalIdx = i + bIdx;
        const buffer = await fetchAsBuffer(s.poster_url);
        if (!buffer) return;

        const safeName = (s.contestant_name || 'unknown')
          .replace(/[^a-zA-Z0-9 _-]/g, '')
          .trim()
          .replace(/\s+/g, '_')
          .slice(0, 40);

        const rank = String(globalIdx + 1).padStart(3, '0');
        const idShort = (s.id || '').slice(0, 8);
        const ext = s.poster_url.split('?')[0].split('.').pop()?.toLowerCase() || 'png';
        folder.file(`${rank}_${safeName}_${s.total_score}pts_${idShort}.${ext}`, buffer);

        downloaded++;
        if (onProgress) onProgress({ downloaded, total, percent: Math.round((downloaded / total) * 100) });
      })
    );
  }

  if (downloaded === 0) throw new Error('No posters could be downloaded.');

  const date = new Date().toISOString().slice(0, 10);
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `prompt2poster_posters_${date}.zip`);

  return { downloaded, total };
}

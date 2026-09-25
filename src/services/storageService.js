import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Converts File object to Base64 Data URL (for AI vision analysis ONLY)
 * @param {File} file
 * @returns {Promise<string>}
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads poster image to Supabase Storage bucket ('posters').
 * @param {File} file
 * @param {string} contestantName
 * @returns {Promise<{ storagePath: string, publicUrl: string|null, dataUrl: string }>}
 *   publicUrl — a real https:// Supabase URL when upload succeeds, null otherwise.
 *               NEVER a base64 string — base64 is too large for a Postgres TEXT column.
 *   dataUrl   — base64 string used ONLY for the AI evaluation call, never stored in DB.
 */
export async function uploadPoster(file, contestantName) {
  const fileExt = file.name.split('.').pop() || 'png';
  const cleanName = contestantName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const fileName = `${Date.now()}_${cleanName}.${fileExt}`;
  const storagePath = `submissions/${fileName}`;

  // Always generate base64 for AI vision analysis
  const dataUrl = await fileToDataUrl(file);

  if (!isSupabaseConfigured || !supabase) {
    console.log('[StorageService] Supabase not configured — poster not uploaded to cloud.');
    return { storagePath, publicUrl: null, dataUrl };
  }

  try {
    const { data, error } = await supabase.storage
      .from('posters')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/png',
      });

    if (error) {
      console.warn('[StorageService Upload Warning]:', error.message);
      return { storagePath, publicUrl: null, dataUrl };
    }

    const { data: publicUrlData } = supabase.storage
      .from('posters')
      .getPublicUrl(data.path);

    const publicUrl = publicUrlData?.publicUrl ?? null;

    // Safety guard — if somehow we got a data: URL back, reject it
    if (publicUrl && publicUrl.startsWith('data:')) {
      console.warn('[StorageService] getPublicUrl unexpectedly returned base64 — discarding.');
      return { storagePath: data.path, publicUrl: null, dataUrl };
    }

    console.log('[StorageService] Upload success:', publicUrl);
    return { storagePath: data.path, publicUrl, dataUrl };

  } catch (err) {
    console.error('[StorageService Error]:', err.message);
    return { storagePath, publicUrl: null, dataUrl };
  }
}

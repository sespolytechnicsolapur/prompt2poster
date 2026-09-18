import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Converts File object to Base64 Data URL
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
 * Uploads poster image to Supabase Storage bucket ('posters')
 * @param {File} file 
 * @param {string} contestantName 
 * @returns {Promise<{ storagePath: string, publicUrl: string }>}
 */
export async function uploadPoster(file, contestantName) {
  const fileExt = file.name.split('.').pop() || 'png';
  const cleanName = contestantName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const fileName = `${Date.now()}_${cleanName}.${fileExt}`;
  const storagePath = `submissions/${fileName}`;

  // Always generate Base64 Data URL as fallback and for AI image analysis
  const dataUrl = await fileToDataUrl(file);

  if (!isSupabaseConfigured || !supabase) {
    console.log('[StorageService] Supabase not configured. Using local Data URL for storage.');
    return {
      storagePath,
      publicUrl: dataUrl,
      dataUrl
    };
  }

  try {
    const { data, error } = await supabase.storage
      .from('posters')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.warn('[StorageService Upload Warning]:', error.message);
      return { storagePath, publicUrl: dataUrl, dataUrl };
    }

    const { data: publicUrlData } = supabase.storage
      .from('posters')
      .getPublicUrl(data.path);

    return {
      storagePath: data.path,
      publicUrl: publicUrlData.publicUrl,
      dataUrl
    };

  } catch (err) {
    console.error('[StorageService Error]:', err);
    return { storagePath, publicUrl: dataUrl, dataUrl };
  }
}

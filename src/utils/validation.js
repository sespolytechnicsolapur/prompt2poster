/**
 * Form Input & File Validation Utilities
 */

export function validateContestantName(name) {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Contestant name is required' };
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Contestant name must be at least 2 characters long' };
  }
  if (trimmed.length > 80) {
    return { isValid: false, error: 'Contestant name cannot exceed 80 characters' };
  }
  return { isValid: true, trimmedName: trimmed };
}

export function validatePosterFile(file) {
  if (!file) {
    return { isValid: false, error: 'Poster image file is required' };
  }

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    return { isValid: false, error: 'File format must be PNG, JPG, JPEG, or WEBP' };
  }

  // 15 MB size limit
  const maxSizeBytes = 15 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { isValid: false, error: 'Poster file size cannot exceed 15 MB' };
  }

  return { isValid: true };
}

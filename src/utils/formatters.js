/**
 * Formatting utilities for dates, scores, ranks, and categories
 */

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch (e) {
    return dateString;
  }
}

export function formatScorePercent(score, maxScore) {
  if (!maxScore || maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
}

export function getRankBadgeColor(rank) {
  if (rank === 1) return 'badge-gold';
  if (rank === 2) return 'badge-cyan';
  if (rank === 3) return 'badge-emerald';
  return 'badge-primary';
}

export function getScoreColor(score) {
  if (score >= 90) return '#10B981'; // Emerald
  if (score >= 80) return '#6366F1'; // Indigo
  if (score >= 70) return '#06B6D4'; // Cyan
  if (score >= 60) return '#F59E0B'; // Amber
  return '#EF4444'; // Red
}

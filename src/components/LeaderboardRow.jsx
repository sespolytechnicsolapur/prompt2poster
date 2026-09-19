import React from 'react';
import { ChevronRight } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export function LeaderboardRow({ submission, rank, onSelect }) {
  const isTopThree = rank <= 3;

  return (
    <tr
      onClick={() => onSelect(submission.id)}
      className="interactive-row"
    >
      {/* Rank */}
      <td style={{ width: '56px', whiteSpace: 'nowrap' }}>
        <span className={`badge badge-mono ${isTopThree ? (rank === 1 ? 'badge-amber' : 'badge-primary') : ''}`}>
          #{rank.toString().padStart(2, '0')}
        </span>
      </td>

      {/* Contestant */}
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-xs)',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-surface-hover)',
            border: '1px solid var(--border-color)',
            flexShrink: 0
          }}>
            <img
              src={submission.poster_url}
              alt={submission.contestant_name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
              {submission.contestant_name}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {formatDate(submission.created_at)}
            </div>
          </div>
        </div>
      </td>

      {/* Topic */}
      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
        <span style={{
          display: 'inline-block',
          maxWidth: '320px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {submission.topic}
        </span>
      </td>

      {/* Score */}
      <td style={{ textAlign: 'right' }}>
        <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.2rem' }}>
          <span className="mono-num" style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--text-primary)'
          }}>
            {submission.total_score}
          </span>
          <span className="mono-num" style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            /100
          </span>
        </div>
      </td>

      {/* Action */}
      <td style={{ width: '36px', textAlign: 'center' }}>
        <ChevronRight size={14} style={{ color: 'var(--text-dim)' }} />
      </td>
    </tr>
  );
}

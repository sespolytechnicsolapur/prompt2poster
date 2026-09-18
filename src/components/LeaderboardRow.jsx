import React from 'react';
import { Trophy, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { formatDate, getRankBadgeColor, getScoreColor } from '../utils/formatters';

export function LeaderboardRow({ submission, rank, onSelect }) {
  const isTopThree = rank <= 3;

  return (
    <tr
      onClick={() => onSelect(submission.id)}
      style={{
        cursor: 'pointer',
        borderBottom: '1px solid var(--border-color)',
        transition: 'background var(--transition-fast)'
      }}
      className="leaderboard-row-hover"
    >
      {/* Rank Column */}
      <td style={{ padding: '1.125rem 1.25rem', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className={`badge ${getRankBadgeColor(rank)}`} style={{ minWidth: '38px', justifyContent: 'center' }}>
            {isTopThree && <Trophy size={13} />}
            #{rank}
          </span>
        </div>
      </td>

      {/* Contestant Name */}
      <td style={{ padding: '1.125rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            background: '#040711',
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
            <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '1.02rem' }}>
              {submission.contestant_name}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              Submitted {formatDate(submission.created_at)}
            </div>
          </div>
        </div>
      </td>

      {/* Topic */}
      <td style={{ padding: '1.125rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <span style={{
          display: 'inline-block',
          maxWidth: '280px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {submission.topic}
        </span>
      </td>

      {/* Score */}
      <td style={{ padding: '1.125rem 1.25rem', textAlign: 'right' }}>
        <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.25rem' }}>
          <span style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            color: getScoreColor(submission.total_score)
          }}>
            {submission.total_score}
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>/ 100</span>
        </div>
      </td>

      {/* View Details Action */}
      <td style={{ padding: '1.125rem 1.25rem', textAlign: 'center', width: '60px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-primary)'
        }}>
          <ChevronRight size={18} />
        </div>
      </td>
    </tr>
  );
}

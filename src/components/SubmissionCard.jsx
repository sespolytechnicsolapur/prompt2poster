import React from 'react';
import { ChevronRight } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export function SubmissionCard({ submission, rank, onSelect }) {
  const isTopThree = rank && rank <= 3;

  return (
    <div
      className="surface-card surface-card-interactive"
      onClick={() => onSelect(submission.id)}
      style={{
        padding: '1rem',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '0.85rem'
      }}
    >
      <div>
        {/* Poster Thumbnail */}
        <div style={{
          width: '100%',
          height: '180px',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-surface-subtle)',
          marginBottom: '0.85rem',
          position: 'relative',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)'
        }}>
          <img
            src={submission.poster_url}
            alt={submission.contestant_name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {rank && (
            <div style={{
              position: 'absolute',
              top: '0.5rem',
              left: '0.5rem'
            }}>
              <span className={`badge badge-mono ${isTopThree ? (rank === 1 ? 'badge-amber' : 'badge-primary') : ''}`}>
                #{rank.toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        {/* Contestant Meta */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.2rem' }}>
          <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            {submission.contestant_name}
          </h4>
          <span className="mono-num" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {formatDate(submission.created_at)}
          </span>
        </div>

        <p style={{
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          margin: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {submission.topic}
        </p>
      </div>

      {/* Score and CTA */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '0.65rem',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
          <span className="mono-num" style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: 'var(--text-primary)'
          }}>
            {submission.total_score}
          </span>
          <span className="mono-num" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            /100
          </span>
        </div>

        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: '0.75rem',
          fontWeight: 500,
          color: 'var(--text-secondary)'
        }}>
          Inspect <ChevronRight size={13} />
        </span>
      </div>
    </div>
  );
}

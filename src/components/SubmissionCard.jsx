import React from 'react';
import { Trophy, ChevronRight, Award } from 'lucide-react';
import { formatDate, getScoreColor } from '../utils/formatters';

export function SubmissionCard({ submission, rank, onSelect }) {
  return (
    <div
      className="glass-panel"
      onClick={() => onSelect(submission.id)}
      style={{
        padding: '1.25rem',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform var(--transition-fast), border-color var(--transition-fast)'
      }}
    >
      <div>
        {/* Poster Thumbnail */}
        <div style={{
          width: '100%',
          height: '220px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          background: '#040711',
          marginBottom: '1rem',
          position: 'relative'
        }}>
          <img
            src={submission.poster_url}
            alt={submission.contestant_name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {rank && (
            <div style={{
              position: 'absolute',
              top: '0.75rem',
              left: '0.75rem',
              background: 'rgba(9, 13, 22, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '0.3rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#FFFFFF',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <Trophy size={12} color="var(--accent-amber)" />
              Rank #{rank}
            </div>
          )}
        </div>

        {/* Contestant Details */}
        <h4 style={{ fontSize: '1.1rem', color: '#FFFFFF', marginBottom: '0.25rem' }}>
          {submission.contestant_name}
        </h4>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          {submission.topic}
        </p>
      </div>

      {/* Score and CTA */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '0.85rem',
        borderTop: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
          <span style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            color: getScoreColor(submission.total_score)
          }}>
            {submission.total_score}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>/ 100</span>
        </div>

        <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
          <span>View Details</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

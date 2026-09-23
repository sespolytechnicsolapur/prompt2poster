import React from 'react';
import { Eye, EyeOff, Trophy, FileText } from 'lucide-react';

/**
 * Admin settings panel for leaderboard and topic visibility toggles.
 */
export function VisibilitySettings({
  leaderboardVisible,
  topicVisible,
  onToggleLeaderboard,
  onToggleTopic,
  isUpdating
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Leaderboard Visibility */}
      <div className="surface-card" style={{
        padding: '1rem 1.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div style={{
            width: '32px', height: '32px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: leaderboardVisible ? 'var(--status-success-subtle)' : 'var(--status-danger-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: leaderboardVisible ? 'var(--status-success)' : 'var(--status-danger)',
            flexShrink: 0
          }}>
            <Trophy size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Leaderboard Visibility
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {leaderboardVisible
                ? 'Contestants can see the live leaderboard and rankings.'
                : 'Leaderboard is hidden from all contestants. Only admins can view it.'}
            </div>
          </div>
        </div>

        <button
          onClick={() => onToggleLeaderboard(!leaderboardVisible)}
          className={`btn btn-sm ${leaderboardVisible ? 'btn-secondary' : 'btn-primary'}`}
          disabled={isUpdating}
        >
          {leaderboardVisible ? <EyeOff size={14} /> : <Eye size={14} />}
          <span>{leaderboardVisible ? 'Hide Leaderboard' : 'Show Leaderboard'}</span>
        </button>
      </div>

      {/* Topic Visibility */}
      <div className="surface-card" style={{
        padding: '1rem 1.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div style={{
            width: '32px', height: '32px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: topicVisible ? 'var(--status-success-subtle)' : 'var(--status-danger-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: topicVisible ? 'var(--status-success)' : 'var(--status-danger)',
            flexShrink: 0
          }}>
            <FileText size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Topic Visibility
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {topicVisible
                ? 'Contestants can see the competition topic.'
                : 'Topic is hidden. Contestants see a "Topic will be revealed shortly" message.'}
            </div>
          </div>
        </div>

        <button
          onClick={() => onToggleTopic(!topicVisible)}
          className={`btn btn-sm ${topicVisible ? 'btn-secondary' : 'btn-primary'}`}
          disabled={isUpdating}
        >
          {topicVisible ? <EyeOff size={14} /> : <Eye size={14} />}
          <span>{topicVisible ? 'Hide Topic' : 'Reveal Topic'}</span>
        </button>
      </div>

      {/* Status Summary */}
      <div style={{
        display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
        fontSize: '0.75rem', color: 'var(--text-dim)'
      }}>
        <span className={`badge badge-mono ${leaderboardVisible ? 'badge-success' : ''}`} style={{ fontSize: '0.625rem' }}>
          Leaderboard: {leaderboardVisible ? 'VISIBLE' : 'HIDDEN'}
        </span>
        <span className={`badge badge-mono ${topicVisible ? 'badge-success' : ''}`} style={{ fontSize: '0.625rem' }}>
          Topic: {topicVisible ? 'VISIBLE' : 'HIDDEN'}
        </span>
      </div>
    </div>
  );
}

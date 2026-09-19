import React from 'react';
import { Target, Clock, AlertCircle } from 'lucide-react';

export function TopicBanner({ topic, loading, onManageClick }) {
  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading active competition topic...</div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', borderLeft: '8px solid var(--accent-amber)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-amber)' }}>
          <AlertCircle size={24} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>No Active Topic Set</h3>
        </div>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 'bold' }}>
          An event organizer needs to set an active competition topic.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{
      padding: '2rem 2.5rem',
      background: 'var(--bg-main)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span className="badge badge-gold">
              <Target size={13} />
              Active Competition Topic
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Clock size={13} />
              Live Evaluation
            </span>
          </div>

          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            lineHeight: '1.1',
            marginBottom: '1rem',
            letterSpacing: '-0.04em'
          }}>
            {topic.topic_title}
          </h2>

          {topic.description && (
            <p style={{
              fontSize: '1.1rem',
              color: 'var(--text-muted)',
              lineHeight: '1.6',
              maxWidth: '850px',
              fontWeight: 500
            }}>
              {topic.description}
            </p>
          )}
        </div>

        {onManageClick && (
          <button
            onClick={onManageClick}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
          >
            Change Topic
          </button>
        )}
      </div>
    </div>
  );
}

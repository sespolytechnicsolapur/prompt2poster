import React from 'react';
import { Target, Sparkles, Clock, AlertCircle } from 'lucide-react';

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
      <div className="glass-panel" style={{ padding: '2rem', borderLeft: '4px solid var(--accent-amber)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-amber)' }}>
          <AlertCircle size={24} />
          <h3 style={{ fontSize: '1.1rem' }}>No Active Topic Set</h3>
        </div>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          An event organizer needs to set an active competition topic.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{
      padding: '2rem 2.5rem',
      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
      borderColor: 'rgba(99, 102, 241, 0.3)',
      boxShadow: '0 0 30px rgba(99, 102, 241, 0.15)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background glow */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '180px',
        height: '180px',
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span className="badge badge-gold">
              <Target size={13} />
              Active Competition Topic
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={13} />
              Live Evaluation
            </span>
          </div>

          <h2 style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: '1.3',
            marginBottom: '0.75rem'
          }}>
            {topic.topic_title}
          </h2>

          {topic.description && (
            <p style={{
              fontSize: '1.02rem',
              color: '#CBD5E1',
              lineHeight: '1.6',
              maxWidth: '850px'
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

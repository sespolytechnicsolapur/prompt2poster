import React from 'react';
import { Sliders, AlertCircle } from 'lucide-react';

export function TopicBanner({ topic, loading, onManageClick }) {
  if (loading) {
    return (
      <div className="surface-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading active competition topic...</div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="surface-card" style={{ padding: '1.25rem 1.5rem', borderLeft: '3px solid var(--status-warning)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-warning)', marginBottom: '0.25rem' }}>
          <AlertCircle size={16} />
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>No Active Competition Topic</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
          An event organizer must configure an active competition topic before posters can be submitted.
        </p>
      </div>
    );
  }

  return (
    <div className="surface-card" style={{ padding: '1.25rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 500px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-success)',
              display: 'inline-block'
            }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Prompt
            </span>
          </div>

          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: '0.4rem'
          }}>
            {topic.topic_title}
          </h2>

          {topic.description && (
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.5',
              maxWidth: '820px'
            }}>
              {topic.description}
            </p>
          )}
        </div>

        {onManageClick && (
          <button
            onClick={onManageClick}
            className="btn btn-secondary btn-sm"
            title="Configure active topic in organizer panel"
          >
            <Sliders size={13} />
            <span>Configure Prompt</span>
          </button>
        )}
      </div>
    </div>
  );
}

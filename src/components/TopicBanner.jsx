import React from 'react';
import { Target, Lock, Sparkles } from 'lucide-react';

export function TopicBanner({ topicTitle, description, topicVisible, isAdmin }) {
  if (!topicVisible && !isAdmin) {
    return (
      <div className="surface-card" style={{
        padding: '2rem',
        display: 'flex', alignItems: 'center', gap: '1.5rem',
        backgroundColor: 'var(--bg-surface-subtle)',
        border: '1px solid var(--border-color)',
      }}>
        <div style={{
          width: '56px', height: '56px',
          borderRadius: '12px',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)', flexShrink: 0,
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <Lock size={24} />
        </div>
        <div>
          <h2 style={{
            fontSize: '1.3rem', fontWeight: 700,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-heading)',
            margin: '0 0 0.25rem 0'
          }}>
            Competition Topic Hidden
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1rem', margin: 0, lineHeight: '1.6',
            fontFamily: 'var(--font-sans)',
          }}>
            The topic will be revealed shortly by the organizers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card" style={{
      padding: '2rem',
      display: 'flex', alignItems: 'flex-start', gap: '1.5rem',
      position: 'relative', overflow: 'hidden',
    }}>

      <div style={{
        width: '56px', height: '56px',
        borderRadius: '12px',
        background: 'var(--text-primary)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-inverse)', flexShrink: 0, zIndex: 1,
      }}>
        <Target size={26} />
      </div>

      <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            fontSize: '0.75rem', fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--accent-primary)',
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            fontFamily: 'var(--font-sans)'
          }}>
            <Sparkles size={14} />
            <span>Active Topic</span>
          </div>
          {isAdmin && !topicVisible && (
             <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>
               Hidden from Contestants
             </span>
          )}
        </div>
        <h2 style={{
          fontSize: '1.7rem', fontWeight: 700,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-heading)',
          letterSpacing: '-0.01em',
          margin: 0, lineHeight: 1.25,
        }}>
          {topicTitle || 'No active topic set'}
        </h2>
        {description && (
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1rem',
            fontFamily: 'var(--font-sans)',
            margin: '0.25rem 0 0 0',
            lineHeight: '1.65',
            maxWidth: '800px',
          }}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { Target, FileText, Lock } from 'lucide-react';

export function TopicBanner({ topicTitle, description, topicVisible, isAdmin }) {
  // If topic is hidden and user is not an admin, show a placeholder
  if (!topicVisible && !isAdmin) {
    return (
      <div className="surface-card" style={{
        padding: '2rem',
        display: 'flex', alignItems: 'center', gap: '1.5rem',
        border: '1px dashed var(--border-strong)',
        backgroundColor: 'var(--bg-surface-subtle)'
      }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)', flexShrink: 0, boxShadow: 'var(--shadow-sm)'
        }}>
          <Lock size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
            Competition Topic Hidden
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', margin: 0, lineHeight: '1.6' }}>
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
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Decorative gradient blur */}
      <div style={{
        position: 'absolute', top: '-50px', right: '-50px',
        width: '150px', height: '150px', borderRadius: '50%',
        background: 'var(--accent-primary)',
        filter: 'blur(80px)', opacity: 0.1, zIndex: 0
      }} />

      <div style={{
        width: '56px', height: '56px', borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-subtle) 100%)',
        border: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--accent-primary)', flexShrink: 0,
        boxShadow: 'var(--shadow-md)', zIndex: 1
      }}>
        <Target size={28} />
      </div>

      <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.05em',
            textTransform: 'uppercase', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: '0.25rem'
          }}>
            <FileText size={12} />
            <span>Active Topic</span>
          </div>
          {isAdmin && !topicVisible && (
             <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--status-danger)' }}>
               (HIDDEN FROM CONTESTANTS)
             </span>
          )}
        </div>
        <h2 style={{
          fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)',
          letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2
        }}>
          {topicTitle || 'No active topic set'}
        </h2>
        {description && (
          <p style={{
            color: 'var(--text-secondary)', fontSize: '0.9375rem',
            margin: '0.25rem 0 0 0', lineHeight: '1.6', maxWidth: '800px'
          }}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

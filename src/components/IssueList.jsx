import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export function IssueList({ issues = [] }) {
  if (!issues || issues.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-emerald)' }}>
          <CheckCircle size={20} />
          <h4 style={{ fontSize: '1rem', color: '#FFFFFF' }}>No Critical Issues Identified</h4>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.5rem' }}>
          The AI judge found no major visual hierarchy or readability issues in this submission.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
        <AlertTriangle size={20} color="var(--accent-amber)" />
        <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF' }}>
          AI Identified Poster Issues ({issues.length})
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {issues.map((issue, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.85rem',
              padding: '0.85rem 1.125rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)'
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#FBBF24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.78rem',
              fontWeight: 700,
              flexShrink: 0,
              marginTop: '0.1rem'
            }}>
              {idx + 1}
            </div>
            <span style={{ fontSize: '0.9rem', color: '#F1F5F9', lineHeight: '1.55' }}>
              {issue}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

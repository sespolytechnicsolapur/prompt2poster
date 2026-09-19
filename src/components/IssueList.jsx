import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export function IssueList({ issues = [] }) {
  if (!issues || issues.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-emerald)' }}>
          <CheckCircle size={20} />
          <h4 style={{ fontSize: '1rem', color: 'var(--text-main)' }}>No Critical Issues Identified</h4>
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
        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>
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
              background: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)'
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              color: 'var(--text-inverse)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.78rem',
              fontWeight: 700,
              flexShrink: 0,
              marginTop: '0.1rem',
              boxShadow: '0 4px 14px 0 rgba(14, 165, 233, 0.39)'
            }}>
              {idx + 1}
            </div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.55' }}>
              {issue}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

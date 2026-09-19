import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function IssueList({ issues = [] }) {
  if (!issues || issues.length === 0) {
    return (
      <div className="surface-card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-success)' }}>
          <CheckCircle size={15} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            No Critical Issues Identified
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', margin: 0 }}>
          Visual hierarchy, typography contrast, and alignment meet competition benchmarks.
        </p>
      </div>
    );
  }

  return (
    <div className="surface-card" style={{ padding: '1.25rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
        <AlertCircle size={15} style={{ color: 'var(--status-warning)' }} />
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          Identified Critique Points ({issues.length})
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {issues.map((issue, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
              padding: '0.6rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <span className="mono-num" style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              flexShrink: 0,
              marginTop: '0.05rem'
            }}>
              {(idx + 1).toString().padStart(2, '0')}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
              {issue}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

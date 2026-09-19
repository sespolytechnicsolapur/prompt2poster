import React from 'react';
import { Upload, Cpu, Check, ShieldCheck, Loader2 } from 'lucide-react';

export function EvaluationLoader({ currentStage = 1 }) {
  const stages = [
    { id: 1, label: 'Uploading poster image artifact', desc: 'Secure cloud storage' },
    { id: 2, label: 'Executing multimodal vision analysis', desc: 'Automated design & composition analysis' },
    { id: 3, label: 'Evaluating 7 design criteria and visual critique', desc: 'Objective design audit synthesis' },
    { id: 4, label: 'Validating mathematical score integrity', desc: '100-point ledger balance check' }
  ];

  return (
    <div className="surface-card" style={{
      padding: '2rem 1.75rem',
      maxWidth: '520px',
      margin: '0 auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
        <Loader2 size={18} className="mono-num" style={{ animation: 'spin 1.2s linear infinite', color: 'var(--accent-primary)', flexShrink: 0 }} />
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Evaluation In Progress
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
            Benchmarking design against 7 standardized criteria
          </p>
        </div>
      </div>

      {/* Progress Stages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {stages.map((stg) => {
          const isDone = stg.id < currentStage;
          const isCurrent = stg.id === currentStage;

          return (
            <div
              key={stg.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                backgroundColor: isCurrent ? 'var(--bg-surface-subtle)' : 'transparent',
                border: `1px solid ${isCurrent ? 'var(--border-strong)' : 'transparent'}`,
                borderRadius: 'var(--radius-sm)',
                transition: 'all var(--transition-fast)'
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: 'var(--radius-xs)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                backgroundColor: isDone ? 'var(--status-success-subtle)' : isCurrent ? 'var(--accent-primary-subtle)' : 'var(--bg-surface-hover)',
                color: isDone ? 'var(--status-success)' : isCurrent ? 'var(--accent-primary)' : 'var(--text-dim)',
                flexShrink: 0,
              }}>
                {isDone ? <Check size={12} strokeWidth={2.5} /> : stg.id}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '0.8125rem',
                  fontWeight: isCurrent ? 600 : 500,
                  color: isCurrent ? 'var(--text-primary)' : isDone ? 'var(--text-secondary)' : 'var(--text-dim)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {stg.label}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  {stg.desc}
                </div>
              </div>

              {isCurrent && (
                <span className="badge badge-mono badge-primary" style={{ fontSize: '0.6875rem' }}>
                  Active
                </span>
              )}
              {isDone && (
                <span className="badge badge-mono badge-success" style={{ fontSize: '0.6875rem' }}>
                  Done
                </span>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

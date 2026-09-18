import React from 'react';
import { Upload, Cpu, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

export function EvaluationLoader({ currentStage = 1 }) {
  const stages = [
    { id: 1, label: 'Uploading poster to Supabase Storage', icon: Upload },
    { id: 2, label: 'Querying Groq AI & Qwen 3.8 / Vision model', icon: Cpu },
    { id: 3, label: 'Analyzing 7 visual criteria & identifying issues', icon: CheckCircle2 },
    { id: 4, label: 'Validating mathematical score integrity & saving', icon: ShieldCheck }
  ];

  return (
    <div className="glass-panel" style={{
      padding: '3rem 2.5rem',
      textAlign: 'center',
      maxWidth: '620px',
      margin: '0 auto',
      background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(9, 13, 22, 0.95) 100%)',
      border: '1px solid var(--border-color-glow)',
      boxShadow: 'var(--glow-primary)'
    }}>
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
        border: '1px solid var(--accent-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.5rem auto'
      }}>
        <Loader2 size={36} color="var(--accent-cyan)" className="animate-pulse-glow" style={{ animation: 'spin 1.5s linear infinite' }} />
      </div>

      <h3 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '0.5rem' }}>
        AI Judge Evaluating Poster
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
        Evaluating submission against official 7 criteria (Score /100)
      </p>

      {/* Progress Stages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
        {stages.map((stg) => {
          const Icon = stg.icon;
          const isDone = stg.id < currentStage;
          const isCurrent = stg.id === currentStage;

          return (
            <div
              key={stg.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.85rem 1.125rem',
                borderRadius: 'var(--radius-md)',
                background: isCurrent
                  ? 'rgba(99, 102, 241, 0.15)'
                  : isDone
                  ? 'rgba(16, 185, 129, 0.08)'
                  : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${
                  isCurrent
                    ? 'rgba(99, 102, 241, 0.4)'
                    : isDone
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'transparent'
                }`,
                transition: 'all var(--transition-fast)'
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isDone
                  ? 'var(--accent-emerald)'
                  : isCurrent
                  ? 'var(--accent-primary)'
                  : 'rgba(255,255,255,0.05)',
                color: '#FFFFFF',
                fontSize: '0.8rem',
                fontWeight: 700
              }}>
                {isDone ? <CheckCircle2 size={16} /> : stg.id}
              </div>

              <span style={{
                fontSize: '0.92rem',
                fontWeight: isCurrent ? 600 : 400,
                color: isCurrent ? '#FFFFFF' : isDone ? 'var(--accent-emerald)' : 'var(--text-dim)'
              }}>
                {stg.label}
              </span>

              {isCurrent && (
                <div style={{ marginLeft: 'auto' }}>
                  <Loader2 size={16} color="var(--accent-cyan)" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
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

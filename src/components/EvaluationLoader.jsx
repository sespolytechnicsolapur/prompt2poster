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
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
    }}>
      <div style={{
        width: '72px',
        height: '72px',
        background: 'rgba(14, 165, 233, 0.1)',
        border: '2px solid rgba(14, 165, 233, 0.2)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.5rem auto'
      }}>
        <Loader2 size={36} color="var(--accent-primary)" style={{ animation: 'spin 1.5s linear infinite' }} />
      </div>

      <h3 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
        AI Judge Evaluating Poster
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '2.5rem', fontWeight: 500 }}>
        Evaluating submission against official 7 criteria (Score /100)
      </p>

      {/* Progress Stages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
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
                padding: '1rem 1.25rem',
                background: isCurrent ? 'var(--accent-primary)' : isDone ? 'var(--bg-main)' : 'rgba(255,255,255,0.5)',
                border: `1px solid ${isCurrent ? 'transparent' : 'var(--border-color)'}`,
                borderRadius: 'var(--radius-md)',
                boxShadow: isCurrent ? '0 4px 14px 0 rgba(14, 165, 233, 0.39)' : 'none',
                transform: isCurrent ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isDone ? 'var(--accent-emerald)' : isCurrent ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
                color: (isDone || isCurrent) ? '#FFFFFF' : 'var(--text-muted)',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: '50%',
                flexShrink: 0,
              }}>
                {isDone ? <CheckCircle2 size={16} /> : stg.id}
              </div>

              <span style={{
                fontSize: '0.95rem',
                fontWeight: isCurrent ? 700 : 500,
                color: isCurrent ? '#FFFFFF' : 'var(--text-main)',
              }}>
                {stg.label}
              </span>

              {isCurrent && (
                <div style={{ marginLeft: 'auto' }}>
                  <Loader2 size={18} color="#FFFFFF" style={{ animation: 'spin 1s linear infinite' }} />
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

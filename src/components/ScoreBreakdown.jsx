import React from 'react';
import { CRITERIA_DEFINITIONS } from '../utils/scoreValidation';

export function ScoreBreakdown({ evaluation, totalScore }) {
  if (!evaluation) return null;

  return (
    <div className="surface-card" style={{ padding: '1.25rem 1.5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        paddingBottom: '1rem',
        marginBottom: '1rem',
        borderBottom: '1px solid var(--border-color)',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Criteria Score Breakdown
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Evaluated against 8 weighted visual benchmarks
          </span>
        </div>

        {/* Total Score Ledger Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '0.35rem',
          backgroundColor: 'var(--bg-surface-subtle)',
          padding: '0.35rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)'
        }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total
          </span>
          <span className="mono-num" style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--text-primary)'
          }}>
            {totalScore}
          </span>
          <span className="mono-num" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            /100
          </span>
        </div>
      </div>

      {/* 7 Criteria Ledger List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {CRITERIA_DEFINITIONS.map((crit) => {
          const itemData = evaluation[crit.key];
          const score = itemData?.score ?? 0;
          const maxScore = crit.maxScore;
          const percentage = Math.round((score / maxScore) * 100);
          const reason = itemData?.reason || 'No specific reasoning provided.';

          return (
            <div
              key={crit.key}
              style={{
                padding: '0.75rem',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {/* Row Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {crit.label}
                </span>

                <span className="mono-num" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {score} <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>/ {maxScore}</span>
                </span>
              </div>

              {/* Discrete Slim Meter */}
              <div className="score-track" style={{ marginBottom: '0.5rem' }}>
                <div
                  className="score-fill"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: percentage >= 80 ? 'var(--status-success)' : percentage >= 60 ? 'var(--accent-primary)' : 'var(--status-warning)'
                  }}
                />
              </div>

              {/* Rationale description */}
              <p style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.45',
                margin: 0
              }}>
                {reason}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import { CRITERIA_DEFINITIONS } from '../utils/scoreValidation';
import { getScoreColor } from '../utils/formatters';
import { Award } from 'lucide-react';

export function ScoreBreakdown({ evaluation, totalScore }) {
  if (!evaluation) return null;

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        paddingBottom: '1.5rem',
        marginBottom: '1.75rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>
            <Award size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Transparent AI Evaluation
            </span>
          </div>
          <h3 style={{ fontSize: '1.6rem', color: 'var(--text-main)', fontWeight: 800, letterSpacing: '-0.03em' }}>Official Criteria Score Breakdown</h3>
        </div>

        {/* Total Score Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '0.5rem',
          background: 'var(--bg-input)',
          padding: '0.75rem 1.5rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL:</span>
          <span style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            color: getScoreColor(totalScore),
            textShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            {totalScore}
          </span>
          <span style={{ fontSize: '1.1rem', color: 'var(--text-dim)', fontWeight: 700 }}>/ 100</span>
        </div>
      </div>

      {/* 7 Criteria Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {CRITERIA_DEFINITIONS.map((crit) => {
          const itemData = evaluation[crit.key];
          if (!itemData) return null;

          const score = itemData.score;
          const maxScore = crit.maxScore;
          const percent = Math.min(100, Math.round((score / maxScore) * 100));
          const scorePercent = (score / maxScore) * 100;
          const dynamicColor = getScoreColor(scorePercent);

          return (
            <div
              key={crit.key}
              style={{
                background: 'var(--bg-card)',
                padding: '1.25rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.05rem' }}>
                  {crit.label}
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: dynamicColor }}>
                    {score}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                    / {maxScore}
                  </span>
                </div>
              </div>

              {/* Progress Meter Bar */}
              <div style={{
                height: '8px',
                width: '100%',
                background: 'var(--border-color)',
                borderRadius: '999px',
                marginBottom: '0.85rem',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${percent}%`,
                  background: dynamicColor,
                  borderRadius: '999px',
                  transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: `0 0 10px ${dynamicColor}40`
                }} />
              </div>

              {/* Reasoning */}
              {itemData.reason && (
                <p style={{
                  fontSize: '0.95rem',
                  color: 'var(--text-muted)',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  {itemData.reason}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

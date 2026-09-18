import React from 'react';
import { CRITERIA_DEFINITIONS } from '../utils/scoreValidation';
import { getScoreColor } from '../utils/formatters';
import { Award, Info } from 'lucide-react';

export function ScoreBreakdown({ evaluation, totalScore }) {
  if (!evaluation) return null;

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      {/* Header Total Score Card */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', marginBottom: '0.25rem' }}>
            <Award size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Transparent AI Evaluation
            </span>
          </div>
          <h3 style={{ fontSize: '1.4rem', color: '#FFFFFF' }}>Official Criteria Score Breakdown</h3>
        </div>

        {/* Big Total Score Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '0.5rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
          border: '1px solid var(--border-color-glow)',
          padding: '0.75rem 1.5rem',
          borderRadius: 'var(--radius-lg)'
        }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>TOTAL SCORE:</span>
          <span style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            color: getScoreColor(totalScore)
          }}>
            {totalScore}
          </span>
          <span style={{ fontSize: '1.1rem', color: 'var(--text-dim)', fontWeight: 600 }}>/ 100</span>
        </div>
      </div>

      {/* 7 Criteria Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {CRITERIA_DEFINITIONS.map((crit) => {
          const itemData = evaluation[crit.key];
          if (!itemData) return null;

          const score = itemData.score;
          const maxScore = crit.maxScore;
          const percent = Math.min(100, Math.round((score / maxScore) * 100));
          const barColor = getScoreColor(percent);

          return (
            <div
              key={crit.key}
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: 'var(--radius-md)',
                padding: '1.125rem 1.25rem',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.95rem' }}>
                  {crit.label}
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: barColor }}>
                    {score}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                    / {maxScore}
                  </span>
                </div>
              </div>

              {/* Progress Meter Bar */}
              <div style={{
                height: '8px',
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '9999px',
                overflow: 'hidden',
                marginBottom: '0.65rem'
              }}>
                <div style={{
                  height: '100%',
                  width: `${percent}%`,
                  background: barColor,
                  borderRadius: '9999px',
                  transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                }} />
              </div>

              {/* Reasoning Description */}
              {itemData.reason && (
                <p style={{
                  fontSize: '0.84rem',
                  color: 'var(--text-muted)',
                  lineHeight: '1.5',
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

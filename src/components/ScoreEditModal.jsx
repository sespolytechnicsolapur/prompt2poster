import React, { useState } from 'react';
import { X, Save, Loader2, AlertCircle, RotateCw } from 'lucide-react';
import { CRITERIA_DEFINITIONS } from '../utils/scoreValidation';

/**
 * Modal for editing submission scores.
 * Supports manual score editing and AI re-evaluation when total changes.
 */
export function ScoreEditModal({
  submission,
  onSave,
  onReEvaluate,
  onClose
}) {
  // Initialize scores from the submission's evaluation reasoning
  const evaluation = submission?.evaluation_reasoning || {};

  const [scores, setScores] = useState(() => {
    const initial = {};
    CRITERIA_DEFINITIONS.forEach(crit => {
      initial[crit.key] = evaluation[crit.key]?.score ?? 0;
    });
    return initial;
  });

  const [newTotal, setNewTotal] = useState(submission?.total_score ?? 0);
  const [isReEvaluating, setIsReEvaluating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [reEvalResult, setReEvalResult] = useState(null);

  // Calculate sum of individual scores
  const calculatedSum = CRITERIA_DEFINITIONS.reduce(
    (sum, crit) => sum + (Number(scores[crit.key]) || 0), 0
  );

  const handleScoreChange = (key, value) => {
    const num = Math.max(0, Number(value) || 0);
    const maxScore = CRITERIA_DEFINITIONS.find(c => c.key === key)?.maxScore || 100;
    setScores(prev => ({ ...prev, [key]: Math.min(num, maxScore) }));
    setReEvalResult(null);
  };

  const handleReEvaluate = async () => {
    const total = Number(newTotal);
    if (isNaN(total) || total < 0 || total > 100) {
      setError('Total score must be between 0 and 100');
      return;
    }

    setIsReEvaluating(true);
    setError(null);

    try {
      const result = await onReEvaluate(total);
      setReEvalResult(result);

      // Update individual scores from AI result
      const newScores = {};
      CRITERIA_DEFINITIONS.forEach(crit => {
        newScores[crit.key] = result[crit.key]?.score ?? 0;
      });
      setScores(newScores);
    } catch (err) {
      setError(err.message || 'Re-evaluation failed');
    } finally {
      setIsReEvaluating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      let evaluationToSave = reEvalResult;
      
      const parsedNewTotal = Number(newTotal);
      // If the user changed the total score input but hasn't run the AI re-evaluate yet, auto-run it!
      if (!reEvalResult && !isNaN(parsedNewTotal) && parsedNewTotal !== submission?.total_score) {
        setIsReEvaluating(true);
        evaluationToSave = await onReEvaluate(parsedNewTotal);
        setIsReEvaluating(false);
      }

      // If we don't have an AI re-evaluation, build one from the manual sub-scores
      if (!evaluationToSave) {
        evaluationToSave = buildEvaluationFromScores(scores, evaluation);
      }

      await onSave(evaluationToSave);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save scores');
      setIsSaving(false);
      setIsReEvaluating(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="surface-card"
        style={{
          width: '100%', maxWidth: '540px', maxHeight: '90vh',
          overflow: 'auto', padding: '1.5rem',
          display: 'flex', flexDirection: 'column', gap: '1.25rem'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Edit Scores
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              {submission?.contestant_name} — Current: {submission?.total_score}/100
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '0.25rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* AI Re-Evaluate Section */}
        <div style={{
          padding: '1rem',
          backgroundColor: 'var(--bg-surface-subtle)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Override Total Score & Auto Re-evaluate
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="number"
              min={0}
              max={100}
              value={newTotal}
              onChange={(e) => setNewTotal(e.target.value)}
              className="form-input"
              style={{ width: '80px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600 }}
            />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>/100</span>
            <button
              onClick={handleReEvaluate}
              className="btn btn-primary btn-sm"
              disabled={isReEvaluating}
              style={{ marginLeft: 'auto' }}
            >
              {isReEvaluating ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <RotateCw size={13} />}
              <span>{isReEvaluating ? 'AI Processing...' : 'AI Re-evaluate'}</span>
            </button>
          </div>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', marginTop: '0.4rem', margin: 0 }}>
            The AI will redistribute sub-scores to match this total and generate matching reasoning.
          </p>
        </div>

        {/* Individual Criteria Scores */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Individual Criteria Scores
          </div>
          {CRITERIA_DEFINITIONS.map(crit => (
            <div key={crit.key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.5rem 0.65rem',
              backgroundColor: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', flex: 1 }}>
                {crit.label}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <input
                  type="number"
                  min={0}
                  max={crit.maxScore}
                  value={scores[crit.key]}
                  onChange={(e) => handleScoreChange(crit.key, e.target.value)}
                  className="form-input"
                  style={{
                    width: '55px', textAlign: 'center',
                    padding: '0.25rem', fontSize: '0.8125rem',
                    fontFamily: 'var(--font-mono)', fontWeight: 600
                  }}
                />
                <span className="mono-num" style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                  /{crit.maxScore}
                </span>
              </div>
            </div>
          ))}

          {/* Calculated Sum */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.5rem 0.65rem',
            borderTop: '1px solid var(--border-color)',
            marginTop: '0.25rem'
          }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Sum of Criteria
            </span>
            <span className="mono-num" style={{
              fontSize: '1rem', fontWeight: 700,
              color: calculatedSum > 100 ? 'var(--status-danger)' : 'var(--text-primary)'
            }}>
              {calculatedSum}/100
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            color: 'var(--status-danger)',
            backgroundColor: 'var(--status-danger-subtle)',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8125rem',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {/* Re-eval Success Indicator */}
        {reEvalResult && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            color: 'var(--status-success)',
            backgroundColor: 'var(--status-success-subtle)',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8125rem'
          }}>
            <span>✓ AI re-evaluated. Scores redistributed to {reEvalResult.total_score}/100.</span>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm" disabled={isSaving}>
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary btn-sm" disabled={isSaving || calculatedSum > 100}>
            <Save size={13} />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/**
 * Builds a full evaluation object from manual score inputs,
 * preserving existing reasoning where available.
 */
function buildEvaluationFromScores(scores, existingEval) {
  const evaluation = {};
  let totalScore = 0;

  CRITERIA_DEFINITIONS.forEach(crit => {
    const score = Number(scores[crit.key]) || 0;
    totalScore += score;
    evaluation[crit.key] = {
      score,
      max_score: crit.maxScore,
      reason: existingEval[crit.key]?.reason || 'Score manually adjusted by admin.'
    };
  });

  evaluation.total_score = totalScore;
  evaluation.issues = existingEval.issues || [];
  evaluation.overall_evaluation = existingEval.overall_evaluation || 'Scores manually adjusted by administrator.';

  return evaluation;
}

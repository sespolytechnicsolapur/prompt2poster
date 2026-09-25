import React, { useState } from 'react';
import { X, Save, Loader2, AlertCircle, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CRITERIA_DEFINITIONS } from '../utils/scoreValidation';
import { cn } from '../lib/utils';

export function ScoreEditModal({
  submission,
  onSave,
  onReEvaluate,
  onClose
}) {
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
      if (!reEvalResult && !isNaN(parsedNewTotal) && parsedNewTotal !== submission?.total_score) {
        setIsReEvaluating(true);
        evaluationToSave = await onReEvaluate(parsedNewTotal);
        setIsReEvaluating(false);
      }

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
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[999] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="surface-card w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-6 shadow-2xl relative border-2 border-border-strong"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-primary font-heading m-0">
                Edit Scores
              </h2>
              <p className="text-sm font-bold text-muted font-sans m-0 mt-1">
                {submission?.contestant_name} — Current: {submission?.total_score}/100
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-muted hover:text-primary transition-colors rounded-full hover:bg-surface-hover"
            >
              <X size={20} />
            </button>
          </div>

          {/* AI Re-Evaluate Section */}
          <div className="p-4 bg-surface-subtle rounded-sketchy border border-border shadow-inner">
            <div className="text-sm font-bold text-primary font-sans mb-2">
              Override Total Score & Auto Re-evaluate
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={newTotal}
                  onChange={(e) => setNewTotal(e.target.value)}
                  className="form-input w-20 text-center font-mono text-lg py-1 px-2"
                />
                <span className="text-sm font-bold text-muted font-mono">/100</span>
              </div>
              
              <button
                onClick={handleReEvaluate}
                className="btn btn-accent px-4 py-2 font-bold text-sm ml-auto flex items-center gap-2"
                disabled={isReEvaluating}
              >
                {isReEvaluating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RotateCw size={16} />
                )}
                <span>{isReEvaluating ? 'AI Processing...' : 'AI Re-evaluate'}</span>
              </button>
            </div>
            <p className="text-xs text-dim mt-2 m-0 font-sans leading-relaxed">
              The AI will redistribute sub-scores to match this total and generate matching reasoning.
            </p>
          </div>

          {/* Individual Criteria Scores */}
          <div className="flex flex-col gap-2">
            <div className="text-sm font-bold text-primary font-sans mb-1">
              Individual Criteria Scores
            </div>
            {CRITERIA_DEFINITIONS.map(crit => (
              <div key={crit.key} className="flex items-center justify-between p-3 bg-surface-subtle rounded-sketchy border border-border-subtle hover:border-border transition-colors group">
                <span className="text-sm font-bold text-primary flex-1 font-sans">
                  {crit.label}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={crit.maxScore}
                    value={scores[crit.key]}
                    onChange={(e) => handleScoreChange(crit.key, e.target.value)}
                    className="form-input w-16 text-center font-mono py-1 px-2 text-sm focus:bg-white"
                  />
                  <span className="mono-num text-xs text-dim w-8 font-bold">
                    /{crit.maxScore}
                  </span>
                </div>
              </div>
            ))}

            {/* Calculated Sum */}
            <div className="flex items-center justify-between p-4 border-t-2 border-dashed border-border mt-2 bg-surface">
              <span className="text-base font-bold text-primary font-heading">
                Sum of Criteria
              </span>
              <span className={cn(
                "mono-num text-xl font-bold px-3 py-1 rounded-sketchy border-2",
                calculatedSum > 100 
                  ? 'text-danger bg-danger-subtle border-danger' 
                  : 'text-primary bg-accent-subtle border-accent'
              )}>
                {calculatedSum}/100
              </span>
            </div>
          </div>

          <AnimatePresence>
            {/* Error */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-danger bg-danger-subtle p-3 rounded-[15px_225px_15px_255px/255px_15px_225px_15px] border-2 border-dashed border-danger text-sm font-bold font-sans"
              >
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Re-eval Success Indicator */}
            {reEvalResult && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-success bg-success-subtle p-3 rounded-sketchy border border-success-subtle text-sm font-bold font-sans"
              >
                <span>✓ AI re-evaluated. Scores redistributed to {reEvalResult.total_score}/100.</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t-2 border-border mt-auto">
            <button 
              onClick={onClose} 
              className="btn btn-secondary px-6 font-bold" 
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              className="btn btn-primary px-6 flex items-center gap-2 font-bold" 
              disabled={isSaving || calculatedSum > 100}
            >
              <Save size={16} />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

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

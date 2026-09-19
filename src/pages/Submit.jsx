import React, { useState, useEffect } from 'react';
import { TopicBanner } from '../components/TopicBanner';
import { PosterUploader } from '../components/PosterUploader';
import { EvaluationLoader } from '../components/EvaluationLoader';
import { validateContestantName, validatePosterFile } from '../utils/validation';
import { uploadPoster } from '../services/storageService';
import { evaluatePosterWithAI } from '../services/evaluationService';
import { saveSubmission, pickRandomTopic } from '../services/submissionService';
import { Upload, User, CheckCircle, AlertTriangle, ArrowRight, Award, Shuffle } from 'lucide-react';

export function Submit({ activeTopic, loadingTopic, topicPool = [], poolMode = 'single', onSubmissionSuccess }) {
  const [contestantName, setContestantName] = useState('');
  const [selectedFile, setSelectedFile]     = useState(null);
  const [previewUrl, setPreviewUrl]         = useState(null);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [currentStage, setCurrentStage]     = useState(1);
  const [error, setError]                   = useState(null);

  // The topic actually used for this submission
  // In pool mode: determined by contestant name; in single mode: activeTopic
  const [assignedTopic, setAssignedTopic] = useState(null);

  // Recalculate assigned topic whenever name changes (in pool mode)
  useEffect(() => {
    if (poolMode === 'pool' && topicPool.length > 0) {
      const trimmed = contestantName.trim();
      if (trimmed.length >= 2) {
        setAssignedTopic(pickRandomTopic(topicPool, trimmed));
      } else {
        setAssignedTopic(null);
      }
    } else {
      setAssignedTopic(activeTopic);
    }
  }, [contestantName, poolMode, topicPool, activeTopic]);

  // In single mode always use activeTopic
  const effectiveTopic = poolMode === 'pool' ? assignedTopic : activeTopic;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const nameVal = validateContestantName(contestantName);
    if (!nameVal.isValid) { setError(nameVal.error); return; }

    const fileVal = validatePosterFile(selectedFile);
    if (!fileVal.isValid) { setError(fileVal.error); return; }

    if (!effectiveTopic || !effectiveTopic.topic_title) {
      setError(
        poolMode === 'pool'
          ? 'No topic could be assigned from the pool. Please contact an organizer.'
          : 'Active competition topic is missing. Please contact an organizer.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      setCurrentStage(1);
      const storageResult = await uploadPoster(selectedFile, nameVal.trimmedName);

      setCurrentStage(2);
      const evalResult = await evaluatePosterWithAI({
        posterDataUrl:  storageResult.dataUrl,        // base64 for AI vision — never stored in DB
        topic:          effectiveTopic.topic_title,
        contestantName: nameVal.trimmedName,
      });

      setCurrentStage(3);
      await new Promise(r => setTimeout(r, 600));

      setCurrentStage(4);
      const savedRecord = await saveSubmission({
        contestantName:    nameVal.trimmedName,
        topic:             effectiveTopic.topic_title,
        posterStoragePath: storageResult.storagePath,
        posterUrl:         storageResult.publicUrl,   // null if upload failed — service handles it
        evaluation:        evalResult.evaluation,
      });

      await new Promise(r => setTimeout(r, 500));
      setIsSubmitting(false);
      if (onSubmissionSuccess) onSubmissionSuccess(savedRecord);

    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'Submission failed. Please check backend AI endpoint connection.');
      setIsSubmitting(false);
    }
  };

  const isPoolMode    = poolMode === 'pool';
  const poolHasTopics = topicPool.length > 0;
  const nameIsLongEnough = contestantName.trim().length >= 2;

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.4rem', color: '#FFFFFF', marginBottom: '0.5rem' }}>Contestant Poster Submission</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Submit your completed poster for automated AI judging against the 7 official competition criteria.
        </p>
      </div>

      {/* Pool mode notice */}
      {isPoolMode && poolHasTopics && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.25rem', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', color: '#C4B5FD' }}>
          <Shuffle size={16} style={{ flexShrink: 0 }} />
          <span>Your topic will be randomly assigned from a pool of {topicPool.length} topics based on your name.</span>
        </div>
      )}

      {/* Topic banner — shows assigned topic or single active topic */}
      {isPoolMode ? (
        assignedTopic ? (
          <TopicBanner topic={assignedTopic} loading={false} />
        ) : (
          <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(99,102,241,0.08)', border: '1px dashed rgba(99,102,241,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
            {poolHasTopics
              ? 'Enter your name (at least 2 characters) to reveal your assigned topic.'
              : 'No topics in the pool yet. Contact an organizer.'}
          </div>
        )
      ) : (
        <TopicBanner topic={activeTopic} loading={loadingTopic} />
      )}

      {/* Submission form */}
      {isSubmitting ? (
        <EvaluationLoader currentStage={currentStage} />
      ) : (
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2.5rem' }}>
          {/* Contestant Name */}
          <div className="form-group">
            <label className="form-label"><User size={16} color="var(--accent-cyan)" /><span>Contestant Name / Team ID *</span></label>
            <input
              type="text"
              placeholder="e.g. Alex Mercer / Team Alpha-7"
              value={contestantName}
              onChange={(e) => setContestantName(e.target.value)}
              className="form-input"
              required
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              {isPoolMode && poolHasTopics
                ? 'Your unique topic is deterministically assigned based on your name.'
                : 'Enter your official competition contestant name or team identifier.'}
            </span>
          </div>

          {/* Poster upload */}
          <div className="form-group">
            <label className="form-label" style={{ marginBottom: '0.75rem' }}>
              <Upload size={16} color="var(--accent-primary)" /><span>Upload Poster Image *</span>
            </label>
            <PosterUploader selectedFile={selectedFile} setSelectedFile={setSelectedFile} previewUrl={previewUrl} setPreviewUrl={setPreviewUrl} />
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-rose)', background: 'rgba(244,63,94,0.12)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(244,63,94,0.3)', marginBottom: '1.5rem' }}>
              <AlertTriangle size={20} /><span style={{ fontSize: '0.9rem' }}>{error}</span>
            </div>
          )}

          {/* Submit */}
          <div style={{ marginTop: '2rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', borderRadius: 'var(--radius-md)' }}
              disabled={
                !contestantName || !selectedFile ||
                (isPoolMode && poolHasTopics && (!nameIsLongEnough || !assignedTopic))
              }
            >
              <Award size={20} />
              <span>Submit Poster for AI Judging</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { TopicBanner } from '../components/TopicBanner';
import { PosterUploader } from '../components/PosterUploader';
import { EvaluationLoader } from '../components/EvaluationLoader';
import { validateContestantName, validatePosterFile } from '../utils/validation';
import { uploadPoster } from '../services/storageService';
import { evaluatePosterWithAI } from '../services/evaluationService';
import { saveSubmission, pickRandomTopic } from '../services/submissionService';
import { User, AlertCircle, ArrowRight, Shuffle } from 'lucide-react';

export function Submit({ activeTopic, loadingTopic, topicPool = [], poolMode = 'single', onSubmissionSuccess }) {
  const [contestantName, setContestantName] = useState('');
  const [selectedFile, setSelectedFile]     = useState(null);
  const [previewUrl, setPreviewUrl]         = useState(null);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [currentStage, setCurrentStage]     = useState(1);
  const [error, setError]                   = useState(null);

  const [assignedTopic, setAssignedTopic] = useState(null);

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
        posterDataUrl:  storageResult.dataUrl,
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
        posterUrl:         storageResult.publicUrl,
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
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          Submit Poster
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Upload your completed poster design for automated scoring across the 7 competition criteria.
        </p>
      </div>

      {/* Pool mode notice */}
      {isPoolMode && poolHasTopics && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--bg-surface-subtle)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)'
        }}>
          <Shuffle size={14} style={{ flexShrink: 0 }} />
          <span>Random topic assignment is active based on contestant name.</span>
        </div>
      )}

      {/* Topic card */}
      {isPoolMode ? (
        assignedTopic ? (
          <TopicBanner topic={assignedTopic} loading={false} />
        ) : (
          <div className="surface-card" style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {poolHasTopics
              ? 'Enter your name (at least 2 characters) to receive your assigned topic.'
              : 'No topics configured in the pool. Contact an event organizer.'}
          </div>
        )
      ) : (
        <TopicBanner topic={activeTopic} loading={loadingTopic} />
      )}

      {/* Submission Form / Evaluation Loader */}
      {isSubmitting ? (
        <EvaluationLoader currentStage={currentStage} />
      ) : (
        <form onSubmit={handleSubmit} className="surface-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Contestant Name */}
          <div className="form-group">
            <label className="form-label">
              <User size={14} />
              <span>Contestant Name or Team Identifier</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Maya Lin / Team Orion"
              value={contestantName}
              onChange={(e) => setContestantName(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {/* Poster Upload */}
          <div className="form-group">
            <label className="form-label">
              <span>Poster Image</span>
            </label>
            <PosterUploader
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              previewUrl={previewUrl}
              setPreviewUrl={setPreviewUrl}
            />
          </div>

          {/* Error Notice */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--status-danger)',
              backgroundColor: 'var(--status-danger-subtle)',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              fontSize: '0.8125rem'
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Action */}
          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.65rem 1rem' }}
              disabled={
                !contestantName || !selectedFile ||
                (isPoolMode && poolHasTopics && (!nameIsLongEnough || !assignedTopic))
              }
            >
              <span>Submit for Evaluation</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

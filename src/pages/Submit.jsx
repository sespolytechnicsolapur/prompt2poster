import React, { useState } from 'react';
import { TopicBanner } from '../components/TopicBanner';
import { PosterUploader } from '../components/PosterUploader';
import { EvaluationLoader } from '../components/EvaluationLoader';
import { validateContestantName, validatePosterFile } from '../utils/validation';
import { uploadPoster } from '../services/storageService';
import { evaluatePosterWithAI } from '../services/evaluationService';
import { saveSubmission } from '../services/submissionService';
import { Upload, User, CheckCircle, AlertTriangle, ArrowRight, Award } from 'lucide-react';

export function Submit({ activeTopic, loadingTopic, onSubmissionSuccess }) {
  const [contestantName, setContestantName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // 1. Validate contestant name
    const nameVal = validateContestantName(contestantName);
    if (!nameVal.isValid) {
      setError(nameVal.error);
      return;
    }

    // 2. Validate poster image
    const fileVal = validatePosterFile(selectedFile);
    if (!fileVal.isValid) {
      setError(fileVal.error);
      return;
    }

    if (!activeTopic || !activeTopic.topic_title) {
      setError('Active competition topic is missing. Please contact an organizer.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Stage 1: Upload poster to Supabase Storage
      setCurrentStage(1);
      const storageResult = await uploadPoster(selectedFile, nameVal.trimmedName);

      // Stage 2: Send poster to Groq AI Evaluation Service
      setCurrentStage(2);
      const evalResult = await evaluatePosterWithAI({
        posterDataUrl: storageResult.dataUrl || storageResult.publicUrl,
        topic: activeTopic.topic_title,
        contestantName: nameVal.trimmedName
      });

      // Stage 3: Analyzing visual criteria & identifying issues
      setCurrentStage(3);
      await new Promise(resolve => setTimeout(resolve, 600));

      // Stage 4: Validate AI Response & Save result to Supabase
      setCurrentStage(4);
      const savedRecord = await saveSubmission({
        contestantName: nameVal.trimmedName,
        topic: activeTopic.topic_title,
        posterStoragePath: storageResult.storagePath,
        posterUrl: storageResult.publicUrl,
        evaluation: evalResult.evaluation
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      // Reset form & notify parent of submission success
      setIsSubmitting(false);
      if (onSubmissionSuccess) {
        onSubmissionSuccess(savedRecord);
      }

    } catch (err) {
      console.error('Submission execution error:', err);
      setError(err.message || 'Submission failed. Please check backend AI endpoint connection.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade-in">
      {/* Top Header */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.4rem', color: '#FFFFFF', marginBottom: '0.5rem' }}>
          Contestant Poster Submission
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Submit your completed poster for automated AI judging against the 7 official competition criteria.
        </p>
      </div>

      {/* Prominent Active Topic Banner */}
      <TopicBanner topic={activeTopic} loading={loadingTopic} />

      {/* Loading Overlay State */}
      {isSubmitting ? (
        <EvaluationLoader currentStage={currentStage} />
      ) : (
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2.5rem' }}>
          {/* Contestant Name Input */}
          <div className="form-group">
            <label className="form-label">
              <User size={16} color="var(--accent-cyan)" />
              <span>Contestant Name / Team ID *</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Alex Mercer / Team Alpha-7"
              value={contestantName}
              onChange={(e) => setContestantName(e.target.value)}
              className="form-input"
              required
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              Enter your official competition contestant name or team identifier.
            </span>
          </div>

          {/* Poster Upload Component */}
          <div className="form-group">
            <label className="form-label" style={{ marginBottom: '0.75rem' }}>
              <Upload size={16} color="var(--accent-primary)" />
              <span>Upload Poster Image *</span>
            </label>
            <PosterUploader
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              previewUrl={previewUrl}
              setPreviewUrl={setPreviewUrl}
            />
          </div>

          {/* General Error Banner */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: 'var(--accent-rose)',
              background: 'rgba(244, 63, 94, 0.12)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              marginBottom: '1.5rem'
            }}>
              <AlertTriangle size={20} />
              <span style={{ fontSize: '0.9rem' }}>{error}</span>
            </div>
          )}

          {/* Submit Poster CTA */}
          <div style={{ marginTop: '2rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.1rem',
                borderRadius: 'var(--radius-md)'
              }}
              disabled={!contestantName || !selectedFile}
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

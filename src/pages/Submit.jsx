import React, { useState, useRef } from 'react';
import { Upload, X, Send, Image as ImageIcon, Loader2, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { evaluatePosterWithAI } from '../services/evaluationService';
import { saveSubmission, pickRandomTopic } from '../services/submissionService';

/**
 * Poster Submission Page
 * Only accessible to logged-in contestants.
 */
export function Submit({
  activeTopic,
  loadingTopic,
  topicPool,
  poolMode,
  onSubmissionSuccess,
  contestant,
  topicVisible,
  isAdmin
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl]     = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted]   = useState(false);
  const [error, setError]               = useState(null);
  const [aiPromptUsed, setAiPromptUsed] = useState('');

  const fileInputRef = useRef(null);

  // Determine the topic for this contestant
  let assignedTopic = activeTopic;
  if (poolMode === 'pool' && contestant) {
    assignedTopic = pickRandomTopic(topicPool, contestant.name) || activeTopic;
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !previewUrl) {
      setError('Please select a poster image to submit');
      return;
    }
    if (!contestant) {
      setError('You must be logged in to submit');
      return;
    }

    const finalTopicTitle = assignedTopic?.topic_title || 'Unassigned Topic';

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Evaluate with AI
      const { evaluation, source } = await evaluatePosterWithAI({
        posterDataUrl: previewUrl,
        topic: finalTopicTitle,
        contestantName: contestant.name
      });

      // 2. Save submission to DB (mock storage for now)
      await saveSubmission({
        contestantName: contestant.name,
        submittedByUserId: contestant.user_id,
        topic: finalTopicTitle,
        posterStoragePath: 'local-only', // Would upload to Supabase storage here
        posterUrl: previewUrl,
        aiPromptUsed: aiPromptUsed.trim(),
        evaluation
      });

      console.log(`[Submit] Evaluation complete via ${source}`);
      setIsSubmitted(true);

    } catch (err) {
      console.error('[Submit Error]', err);
      setError(err.message || 'An error occurred during evaluation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if contestant can see the topic
  const showTopic = topicVisible || isAdmin;

  if (isSubmitted) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          backgroundColor: 'var(--status-success-subtle)', color: 'var(--status-success)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}>
          <CheckCircle2 size={32} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Successfully Submitted!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          Your poster has been securely uploaded and the AI evaluation is complete. 
          The detailed results and final scores will be announced by the organizers later.
        </p>
        <button 
          className="btn btn-secondary"
          onClick={() => {
            setIsSubmitted(false);
            clearSelection();
            setAiPromptUsed('');
          }}
          style={{ padding: '0.75rem 1.5rem' }}
        >
          Submit Another Design
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
          Submit Your Poster
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
          Upload your design for AI evaluation and scoring.
        </p>
      </div>

      <div className="surface-card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* 1. Topic Assignment Section */}
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}>1</span>
              Your Assigned Topic
            </h2>

            {loadingTopic ? (
              <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem auto' }} />
                Loading assignment...
              </div>
            ) : showTopic ? (
              <div style={{ padding: '1.5rem', backgroundColor: 'var(--accent-primary-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent-primary)', margin: '0 0 0.5rem 0' }}>
                      {assignedTopic?.topic_title || 'No active topic'}
                    </h3>
                    <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', margin: 0, lineHeight: 1.6, opacity: 0.9 }}>
                      {assignedTopic?.description || 'Design a poster based on this topic.'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
               <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-strong)', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
                  Topic Hidden
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                  The competition topic will be revealed shortly by the organizers.
                </p>
              </div>
            )}
          </div>

          {/* 2. Contestant Details */}
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}>2</span>
              Submission Details
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Contestant Name</label>
                <input
                  type="text"
                  value={contestant?.name || ''}
                  className="form-input"
                  disabled
                  style={{ backgroundColor: 'var(--bg-surface-subtle)', color: 'var(--text-secondary)' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                  Autofilled from your login credentials.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">AI Prompt Used (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Paste the prompt you used to generate this poster (e.g. Midjourney, DALL-E)..."
                  value={aiPromptUsed}
                  onChange={(e) => setAiPromptUsed(e.target.value)}
                  className="form-input"
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* 3. File Upload */}
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}>3</span>
              Upload Design
            </h2>

            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border-strong)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.backgroundColor = 'var(--accent-primary-subtle)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-strong)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle)';
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                />
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  color: 'var(--accent-primary)',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <Upload size={28} />
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
                  Click to upload poster
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                  PNG, JPG or WebP (max. 10MB)
                </p>
              </div>
            ) : (
              <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-subtle)' }}>
                <img
                  src={previewUrl}
                  alt="Poster preview"
                  style={{ width: '100%', maxHeight: '600px', objectFit: 'contain', display: 'block' }}
                />
                <button
                  type="button"
                  onClick={clearSelection}
                  style={{
                    position: 'absolute', top: '1rem', right: '1rem',
                    backgroundColor: 'rgba(0,0,0,0.6)', color: 'white',
                    border: 'none', borderRadius: '50%',
                    width: '36px', height: '36px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', backdropFilter: 'blur(4px)'
                  }}
                  title="Remove image"
                >
                  <X size={18} />
                </button>
                <div style={{
                  position: 'absolute', bottom: '0', left: '0', right: '0',
                  padding: '1rem', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                  display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white'
                }}>
                  <ImageIcon size={16} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedFile.name}
                  </span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              color: 'var(--status-danger)', backgroundColor: 'var(--status-danger-subtle)',
              padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !selectedFile || (!showTopic)}
            style={{ width: '100%', padding: '1rem', fontSize: '1rem', marginTop: '1rem' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                <span>AI is evaluating your poster...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Submit Design</span>
              </>
            )}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

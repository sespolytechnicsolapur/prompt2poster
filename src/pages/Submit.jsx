import React, { useState, useRef } from 'react';
import { Upload, X, Send, Image as ImageIcon, Loader2, FileText, CheckCircle2, AlertCircle, Sparkles, Pencil } from 'lucide-react';
import { evaluatePosterWithAI } from '../services/evaluationService';
import { saveSubmission, pickRandomTopic, uploadPosterImage } from '../services/submissionService';

/**
 * Poster Submission Page
 * Only accessible to logged-in contestants.
 * Hand-drawn style with sketchy borders and playful animations.
 */
export function Submit({
  activeTopic,
  loadingTopic,
  topicPool,
  poolMode,
  onSubmissionSuccess,
  contestant,
  topicVisible,
  isAdmin,
  leaderboard
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl]     = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted]   = useState(false);
  const [error, setError]               = useState(null);
  const [aiPromptUsed, setAiPromptUsed] = useState('');

  // Check if contestant already submitted based on leaderboard data
  const hasAlreadySubmitted = leaderboard && contestant 
    ? leaderboard.some(s => s.submitted_by_user_id === contestant.user_id)
    : false;

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
      // 1. Upload the image to Supabase first to prevent Vercel Payload Too Large 502 crash
      let imageUrlForAi = previewUrl; // fallback to Base64
      const uploadResult = await uploadPosterImage(selectedFile, contestant.user_id);
      if (uploadResult.url) {
        imageUrlForAi = uploadResult.url;
      }

      // 2. Evaluate with AI
      const { evaluation, source } = await evaluatePosterWithAI({
        posterDataUrl: imageUrlForAi,
        topic: finalTopicTitle,
        contestantName: contestant.name,
        aiPrompt: aiPromptUsed
      });

      // 3. Save submission to DB
      await saveSubmission({
        contestantName: contestant.name,
        submittedByUserId: contestant.user_id,
        collegeName: contestant.college_name,
        topic: finalTopicTitle,
        posterFile: imageUrlForAi !== previewUrl ? imageUrlForAi : selectedFile, // pass url if uploaded, else file for fallback
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

  if (isSubmitted || hasAlreadySubmitted) {
    return (
      <div style={{
        maxWidth: '600px', margin: '4rem auto', textAlign: 'center',
        animation: 'fade-up 0.6s var(--transition-normal) both'
      }}>
        <div style={{
          width: '72px', height: '72px',
          borderRadius: '16px',
          backgroundColor: 'var(--status-success-subtle)',
          color: 'var(--status-success)',
          border: '1px solid var(--status-success)',
          boxShadow: '0 8px 16px rgba(16, 185, 129, 0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}>
          <CheckCircle2 size={34} />
        </div>
        <h1 style={{
          fontSize: '2.2rem', fontWeight: 800,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-display)',
          marginBottom: '1rem',
          letterSpacing: '-0.02em'
        }}>
          {hasAlreadySubmitted ? 'You Have Already Submitted!' : 'Successfully Submitted!'}
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1.1rem', lineHeight: '1.7',
          marginBottom: '2rem',
          fontFamily: 'var(--font-sans)',
        }}>
          Your poster has been securely uploaded and the AI evaluation is complete. 
          The detailed results and final scores will be announced by the organizers later.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{
      maxWidth: '800px', margin: '0 auto',
      display: 'flex', flexDirection: 'column', gap: '2rem'
    }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: '2.2rem', fontWeight: 800,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-display)',
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em'
        }}>
          Submit Your Poster
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto',
          fontFamily: 'var(--font-sans)',
        }}>
          Upload your design for AI evaluation and scoring
        </p>
      </div>

      <div className="surface-card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* 1. Topic Assignment Section */}
          <div>
            <h2 style={{
              fontSize: '1.25rem', fontWeight: 700,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-heading)',
              marginBottom: '1rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <span style={{
                width: '28px', height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-primary)',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                boxShadow: '0 4px 8px rgba(59, 130, 246, 0.3)',
              }}>1</span>
              Your Assigned Topic
            </h2>

            {loadingTopic ? (
              <div style={{
                padding: '1.5rem',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border-color)',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-sans)',
              }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem auto' }} />
                Loading assignment...
              </div>
            ) : showTopic ? (
              <div style={{
                padding: '1.5rem',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--accent-primary-subtle)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{
                    width: '44px', height: '44px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--accent-primary-subtle)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--accent-primary)', flexShrink: 0,
                  }}>
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '1.2rem', fontWeight: 700,
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-heading)',
                      margin: '0 0 0.25rem 0'
                    }}>
                      {assignedTopic?.topic_title || 'No active topic'}
                    </h3>
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.95rem', margin: 0, lineHeight: 1.65,
                      fontFamily: 'var(--font-sans)',
                    }}>
                      {assignedTopic?.description || 'Design a poster based on this topic.'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
               <div style={{
                 padding: '1.5rem',
                 backgroundColor: 'var(--bg-surface-subtle)',
                 borderRadius: 'var(--radius-md)',
                 border: '1px solid var(--border-strong)',
                 textAlign: 'center'
               }}>
                <h3 style={{
                  fontSize: '1.1rem', fontWeight: 700,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-heading)',
                  margin: '0 0 0.25rem 0'
                }}>
                  Topic Hidden
                </h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.95rem', margin: 0,
                  fontFamily: 'var(--font-sans)',
                }}>
                  The competition topic will be revealed shortly by the organizers.
                </p>
              </div>
            )}
          </div>

          {/* 2. Contestant Details */}
          <div>
            <h2 style={{
              fontSize: '1.25rem', fontWeight: 700,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-heading)',
              marginBottom: '1rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <span style={{
                width: '28px', height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-primary)',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                boxShadow: '0 4px 8px rgba(59, 130, 246, 0.3)',
              }}>2</span>
              Submission Details
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem' }}>Contestant Name</label>
                <input
                  type="text"
                  value={contestant?.name || ''}
                  className="form-input"
                  disabled
                  style={{
                    backgroundColor: 'var(--bg-surface-subtle)',
                    color: 'var(--text-secondary)',
                  }}
                />
                <span style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-dim)', marginTop: '0.25rem',
                  fontFamily: 'var(--font-sans)',
                }}>
                  Autofilled from your login credentials
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem' }}>AI Prompt Used (Optional)</label>
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
            <h2 style={{
              fontSize: '1.25rem', fontWeight: 700,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-heading)',
              marginBottom: '1rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <span style={{
                width: '28px', height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-primary)',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                boxShadow: '0 4px 8px rgba(59, 130, 246, 0.3)',
              }}>3</span>
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
                  transition: 'all 300ms ease',
                  position: 'relative',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.backgroundColor = 'var(--accent-primary-subtle)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-strong)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
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
                  width: '68px', height: '68px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-surface)',
                  border: '2.5px solid var(--border-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  color: 'var(--accent-primary)',
                  boxShadow: 'var(--shadow-md)',
                  animation: 'float 3s ease-in-out infinite'
                }}>
                  <Upload size={28} />
                </div>
                <h3 style={{
                  fontSize: '1.2rem', fontWeight: 700,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-heading)',
                  margin: '0 0 0.5rem 0'
                }}>
                  Click to upload poster
                </h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.95rem', margin: 0,
                  fontFamily: 'var(--font-sans)',
                  fontStyle: 'italic'
                }}>
                  PNG, JPG or WebP (max. 10MB)
                </p>
              </div>
            ) : (
              <div style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface-subtle)',
                boxShadow: 'var(--shadow-md)'
              }}>
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
                    border: '2px solid white', borderRadius: '50%',
                    width: '38px', height: '38px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', backdropFilter: 'blur(4px)',
                    boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
                    transition: 'transform 200ms ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'rotate(-5deg) scale(1.1)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'rotate(0) scale(1)'}
                  title="Remove image"
                >
                  <X size={18} />
                </button>
                <div style={{
                  position: 'absolute', bottom: '0', left: '0', right: '0',
                  padding: '1rem',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                  display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white',
                  fontFamily: 'var(--font-sans)'
                }}>
                  <ImageIcon size={16} />
                  <span style={{
                    fontSize: '0.95rem', fontWeight: 600, flex: 1,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>
                    {selectedFile.name}
                  </span>
                  <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              color: 'var(--status-danger)',
              backgroundColor: 'var(--status-danger-subtle)',
              padding: '1rem',
              borderRadius: '15px 225px 15px 255px / 255px 15px 225px 15px',
              border: '2px solid var(--status-danger)',
              fontFamily: 'var(--font-sans)',
              animation: 'wiggle 0.5s ease-out'
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !selectedFile || (!showTopic)}
            style={{
              width: '100%', padding: '1rem',
              fontSize: '1.15rem', marginTop: '0.5rem',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                <span>AI is evaluating your poster...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Submit Design →</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

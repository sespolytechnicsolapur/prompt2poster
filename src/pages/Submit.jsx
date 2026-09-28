import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  Send,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileText,
  User,
  ShieldCheck,
  WandSparkles,
  MessageSquare,
  ArrowRight,
  Check,
} from 'lucide-react';

import { motion } from 'framer-motion';
import { evaluatePosterWithAI } from '../services/evaluationService';
import {
  saveSubmission,
  pickRandomTopic,
  uploadImageToSupabase,
} from '../services/submissionService';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: 'easeOut',
    },
  },
};

export function Submit({
  activeTopic,
  loadingTopic,
  topicPool,
  poolMode,
  onSubmissionSuccess,
  contestant,
  topicVisible,
  isAdmin,
  leaderboard,
  roundSettings,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [selectedScreenshotFile, setSelectedScreenshotFile] =
    useState(null);

  const [screenshotPreviewUrl, setScreenshotPreviewUrl] =
    useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [aiPromptUsed, setAiPromptUsed] = useState('');

  const currentRound = roundSettings?.current_round || 1;

  const hasAlreadySubmitted =
    leaderboard && contestant
      ? leaderboard.some(
          (s) =>
            s.submitted_by_user_id === contestant.user_id &&
            (s.round_number || 1) === currentRound
        )
      : false;

  const cutoffScore = roundSettings?.qualification_cutoff || 60;
  
  let isNotQualified = false;
  if (currentRound === 2 && leaderboard && contestant) {
    const round1Submission = leaderboard.find(
      (s) => s.submitted_by_user_id === contestant.user_id && (s.round_number || 1) === 1
    );

    if (!round1Submission) {
      isNotQualified = true; // No round 1 submission means not qualified
    } else {
      const override = round1Submission.qualification_override;
      const score = round1Submission.total_score || 0;
      
      if (override === 'disqualified') {
        isNotQualified = true;
      } else if (override !== 'qualified' && score < cutoffScore) {
        isNotQualified = true;
      }
    }
  }

  const fileInputRef = useRef(null);
  const screenshotInputRef = useRef(null);

  let assignedTopic = activeTopic;

  if (poolMode === 'pool' && contestant) {
    assignedTopic =
      pickRandomTopic(topicPool, contestant.name) ||
      activeTopic;
  }

  /* ==========================================
     POSTER FILE
  ========================================== */

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(
        'Please select a valid image file (PNG, JPG, WebP)'
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);

    const reader = new FileReader();

    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };

    reader.readAsDataURL(file);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setError(null);
  };

  /* ==========================================
     SCREENSHOT FILE
  ========================================== */

  const handleScreenshotSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(
        'Please select a valid image file (PNG, JPG, WebP) for the chat screenshot'
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Screenshot must be less than 10MB');
      return;
    }

    setSelectedScreenshotFile(file);
    setError(null);

    const reader = new FileReader();

    reader.onload = (e) => {
      setScreenshotPreviewUrl(e.target.result);
    };

    reader.readAsDataURL(file);
  };

  const clearScreenshotSelection = () => {
    setSelectedScreenshotFile(null);
    setScreenshotPreviewUrl(null);

    if (screenshotInputRef.current) {
      screenshotInputRef.current.value = '';
    }

    setError(null);
  };

  /* ==========================================
     SUBMIT
  ========================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile || !previewUrl) {
      setError('Please select a poster image to submit');
      return;
    }

    if (!aiPromptUsed.trim()) {
      setError('Please provide the AI prompt used');
      return;
    }

    if (!selectedScreenshotFile) {
      setError('Please upload the AI chat screenshot');
      return;
    }

    if (!contestant) {
      setError('You must be logged in to submit');
      return;
    }

    const finalTopicTitle =
      assignedTopic?.topic_title || 'Unassigned Topic';

    setIsSubmitting(true);
    setError(null);

    try {
      let imageUrlForAi = previewUrl;

      const uploadResult = await uploadImageToSupabase(
        selectedFile,
        contestant.user_id,
        'submissions'
      );

      if (uploadResult.url) {
        imageUrlForAi = uploadResult.url;
      }

      const { evaluation } = await evaluatePosterWithAI({
        posterDataUrl: imageUrlForAi,
        topic: finalTopicTitle,
        contestantName: contestant.name,
        aiPrompt: aiPromptUsed,
      });

      await saveSubmission({
        contestantName: contestant.name,
        submittedByUserId: contestant.user_id,
        collegeName: contestant.college_name,
        topic: finalTopicTitle,
        posterFile:
          imageUrlForAi !== previewUrl
            ? imageUrlForAi
            : selectedFile,
        chatScreenshotFile: selectedScreenshotFile,
        aiPromptUsed: aiPromptUsed.trim(),
        evaluation,
      });

      setIsSubmitted(true);

      if (onSubmissionSuccess) {
        onSubmissionSuccess();
      }
    } catch (err) {
      console.error('[Submit Error]', err);

      setError(
        err.message ||
          'An error occurred during evaluation. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const showTopic = topicVisible || isAdmin;

  /* ==========================================
     SUCCESS STATE
  ========================================== */

  if (isNotQualified) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="submit-success-page"
      >
        <div className="submit-success-glow" style={{ background: 'var(--danger-glow)' }} />

        <div className="submit-success-icon" style={{ color: 'var(--danger)', borderColor: 'var(--danger-border)', background: 'var(--danger-bg)' }}>
          <AlertCircle size={42} />
        </div>

        <div className="submit-success-badge" style={{ color: 'var(--danger)', background: 'var(--danger-bg)' }}>
          <AlertCircle size={14} />
          Qualification Required
        </div>

        <h1>Not Qualified</h1>

        <p>
          Unfortunately, your Round 1 score did not meet the qualification cutoff for Round 2, or you have been disqualified.
        </p>

        <button
          onClick={() => window.location.href = '/'}
          className="submit-btn primary mt-8"
          style={{ width: 'auto', padding: '0 2rem' }}
        >
          Return Home
        </button>
      </motion.div>
    );
  }

  if (isSubmitted || hasAlreadySubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="submit-success-page"
      >
        <div className="submit-success-glow" />

        <div className="submit-success-icon">
          <CheckCircle2 size={42} />
        </div>

        <div className="submit-success-badge">
          <Sparkles size={14} />
          Prompt2Poster AI
        </div>

        <h1>
          {hasAlreadySubmitted
            ? 'Already Submitted'
            : 'Successfully Submitted'}
        </h1>

        <p>
          {hasAlreadySubmitted
            ? 'Your submission for this round has already been recorded.'
            : 'Your poster has been securely uploaded and the AI evaluation has been completed.'}
        </p>

        <div className="submit-success-card">
          <div className="submit-success-item">
            <div className="success-item-icon">
              <Check size={17} />
            </div>

            <div>
              <strong>Poster Received</strong>
              <span>Your design was uploaded successfully</span>
            </div>
          </div>

          <div className="submit-success-item">
            <div className="success-item-icon">
              <Sparkles size={17} />
            </div>

            <div>
              <strong>AI Evaluation</strong>
              <span>Your poster has been evaluated</span>
            </div>
          </div>

          <div className="submit-success-item">
            <div className="success-item-icon">
              <ShieldCheck size={17} />
            </div>

            <div>
              <strong>Submission Secured</strong>
              <span>Your submission is safely recorded</span>
            </div>
          </div>
        </div>

        <div className="submit-success-note">
          <span>✓</span>
          Final scores will be announced by the organizers.
        </div>
      </motion.div>
    );
  }

  /* ==========================================
     MAIN PAGE
  ========================================== */

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="submit-page"
    >
      {/* ======================================
          HERO
      ====================================== */}

      <motion.section
        variants={itemVariants}
        className="submit-hero"
      >
        <div className="submit-hero-glow submit-glow-one" />
        <div className="submit-hero-glow submit-glow-two" />

        <div className="submit-hero-content">
          <div className="submit-eyebrow">
            <span className="submit-eyebrow-icon">
              <Sparkles size={15} />
            </span>

            <span>Prompt2Poster AI Competition</span>
          </div>

          <h1>
            Create.
            <span> Upload.</span>
            <br />
            Get Evaluated.
          </h1>

          <p>
            Submit your poster and let our AI evaluate your
            visual design against the competition criteria.
          </p>
        </div>

        <div className="submit-hero-side">
          <div className="submit-ai-orb">
            <Sparkles size={27} />
          </div>

          <div>
            <strong>AI Evaluation</strong>
            <span>Powered by intelligent analysis</span>
          </div>
        </div>
      </motion.section>

      {/* ======================================
          CONTESTANT BAR
      ====================================== */}

      {contestant && (
        <motion.div
          variants={itemVariants}
          className="submit-contestant-bar"
        >
          <div className="submit-contestant-avatar">
            {contestant.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <div className="submit-contestant-info">
            <span>Submitting as</span>
            <strong>{contestant.name}</strong>
          </div>

          <div className="submit-contestant-secure">
            <ShieldCheck size={16} />
            Secure Submission
          </div>
        </motion.div>
      )}

      {/* ======================================
          FORM
      ====================================== */}

      <motion.form
        variants={itemVariants}
        onSubmit={handleSubmit}
        className="submit-form"
      >
        {/* ==================================
            STEP 1
        ================================== */}

        <section className="submit-section">
          <div className="submit-section-header">
            <div className="submit-step">
              <span>01</span>
            </div>

            <div>
              <span className="submit-section-label">
                Competition
              </span>

              <h2>Your Assigned Topic</h2>

              <p>
                Create your poster according to the assigned
                competition topic.
              </p>
            </div>
          </div>

          {loadingTopic ? (
            <div className="submit-topic-loading">
              <div className="submit-loading-icon">
                <Loader2
                  size={22}
                  className="animate-spin"
                />
              </div>

              <div>
                <strong>Loading assignment</strong>
                <span>Getting your competition topic...</span>
              </div>
            </div>
          ) : showTopic ? (
            <div className="submit-topic-card">
              <div className="submit-topic-icon">
                <WandSparkles size={23} />
              </div>

              <div className="submit-topic-content">
                <span>YOUR ASSIGNED TOPIC</span>

                <h3>
                  {assignedTopic?.topic_title ||
                    'No active topic'}
                </h3>

                <p>
                  {assignedTopic?.description ||
                    'Design a poster based on this topic.'}
                </p>
              </div>

              <div className="submit-topic-check">
                <Check size={16} />
              </div>
            </div>
          ) : (
            <div className="submit-topic-hidden">
              <div className="submit-hidden-icon">
                <ShieldCheck size={22} />
              </div>

              <div>
                <strong>Topic Hidden</strong>

                <span>
                  The competition topic will be revealed
                  shortly by the organizers.
                </span>
              </div>
            </div>
          )}
        </section>

        {/* ==================================
            STEP 2
        ================================== */}

        <section className="submit-section">
          <div className="submit-section-header">
            <div className="submit-step">
              <span>02</span>
            </div>

            <div>
              <span className="submit-section-label">
                Submission
              </span>

              <h2>Submission Details</h2>

              <p>
                Add the information required for AI
                evaluation.
              </p>
            </div>
          </div>

          <div className="submit-fields-grid">
            {/* Contestant */}
            <div className="submit-field full">
              <label>
                <User size={15} />
                Contestant Name
              </label>

              <div className="submit-input-wrapper disabled">
                <User size={17} />

                <input
                  type="text"
                  value={contestant?.name || ''}
                  disabled
                />

                <span className="submit-input-verified">
                  <Check size={13} />
                </span>
              </div>

              <small>
                Automatically filled from your login
              </small>
            </div>

            {/* Prompt */}
            <div className="submit-field full">
              <label>
                <WandSparkles size={15} />
                AI Prompt Used
              </label>

              <textarea
                rows={5}
                placeholder="Paste the prompt you used to generate this poster..."
                value={aiPromptUsed}
                onChange={(e) =>
                  setAiPromptUsed(e.target.value)
                }
              />

              <small>
                Include the prompt used with Midjourney,
                DALL-E, Gemini, or another AI tool.
              </small>
            </div>

            {/* Screenshot */}
            <div className="submit-field full">
              <label>
                <MessageSquare size={15} />
                AI Chat Screenshot
              </label>

              <p className="submit-field-description">
                Upload a screenshot showing your AI
                conversation, prompt, and generated image.
              </p>

              {!screenshotPreviewUrl ? (
                <div
                  onClick={() =>
                    screenshotInputRef.current?.click()
                  }
                  className="submit-upload-small"
                >
                  <input
                    type="file"
                    ref={screenshotInputRef}
                    onChange={handleScreenshotSelect}
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                  />

                  <div className="submit-upload-small-icon">
                    <ImageIcon size={21} />
                  </div>

                  <div>
                    <strong>
                      Upload AI chat screenshot
                    </strong>

                    <span>
                      PNG, JPG or WebP • Maximum 10MB
                    </span>
                  </div>

                  <ArrowRight size={18} />
                </div>
              ) : (
                <div className="submit-file-selected">
                  <div className="submit-file-icon">
                    <ImageIcon size={19} />
                  </div>

                  <div className="submit-file-info">
                    <strong>
                      {selectedScreenshotFile?.name}
                    </strong>

                    <span>Screenshot ready</span>
                  </div>

                  <button
                    type="button"
                    onClick={clearScreenshotSelection}
                    className="submit-remove-file"
                    title="Remove screenshot"
                  >
                    <X size={17} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ==================================
            STEP 3
        ================================== */}

        <section className="submit-section">
          <div className="submit-section-header">
            <div className="submit-step">
              <span>03</span>
            </div>

            <div>
              <span className="submit-section-label">
                Visual Design
              </span>

              <h2>Upload Your Poster</h2>

              <p>
                Upload the final poster you want to submit
                for evaluation.
              </p>
            </div>
          </div>

          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="submit-main-upload"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/jpeg,image/png,image/webp"
                hidden
              />

              <div className="submit-upload-orb">
                <Upload size={30} />
              </div>

              <h3>Drop your poster here</h3>

              <p>
                or <strong>browse files</strong> from your
                device
              </p>

              <div className="submit-upload-formats">
                <span>PNG</span>
                <span>JPG</span>
                <span>WEBP</span>
                <span>MAX 10MB</span>
              </div>
            </div>
          ) : (
            <div className="submit-poster-preview">
              <div className="submit-preview-top">
                <div className="submit-preview-file">
                  <div className="submit-file-icon">
                    <ImageIcon size={18} />
                  </div>

                  <div>
                    <strong>
                      {selectedFile?.name}
                    </strong>

                    <span>
                      {(
                        selectedFile.size /
                        (1024 * 1024)
                      ).toFixed(2)}{' '}
                      MB
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={clearSelection}
                  className="submit-preview-remove"
                >
                  <X size={18} />
                  Remove
                </button>
              </div>

              <div className="submit-preview-image">
                <img
                  src={previewUrl}
                  alt="Poster preview"
                />

                <div className="submit-preview-badge">
                  <Sparkles size={13} />
                  Ready for AI Evaluation
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ==================================
            ERROR
        ================================== */}

        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="submit-error"
          >
            <div className="submit-error-icon">
              <AlertCircle size={19} />
            </div>

            <div>
              <strong>Submission Error</strong>
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        {/* ==================================
            SUBMIT ACTION
        ================================== */}

        <div className="submit-action">
          <div className="submit-action-security">
            <ShieldCheck size={18} />

            <div>
              <strong>Your submission is secure</strong>

              <span>
                Your poster will be uploaded and evaluated
                automatically.
              </span>
            </div>
          </div>

          <motion.button
            whileHover={{
              scale:
                isSubmitting ||
                !selectedFile ||
                !showTopic
                  ? 1
                  : 1.015,
            }}
            whileTap={{
              scale:
                isSubmitting ||
                !selectedFile ||
                !showTopic
                  ? 1
                  : 0.985,
            }}
            type="submit"
            disabled={
              isSubmitting ||
              !selectedFile ||
              !showTopic
            }
            className="submit-final-button"
          >
            {isSubmitting ? (
              <>
                <Loader2
                  size={21}
                  className="animate-spin"
                />

                <span>
                  AI is evaluating your poster...
                </span>
              </>
            ) : (
              <>
                <Send size={19} />

                <span>Submit Design</span>

                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </div>
      </motion.form>
    </motion.div>
  );
}
import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Loader2,
  Maximize2,
  X,
  Download,
  ShieldAlert,
  FileText,
  History,
  Image as ImageIcon,
  AlertCircle,
  Pencil,
  Sparkles,
  CalendarDays,
  Trophy,
  Brain,
  Eye,
  ExternalLink,
  CheckCircle2,
  Clock3,
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { fetchSubmissionById } from '../services/submissionService';
import { formatDate } from '../utils/formatters';
import { cn } from '../lib/utils';

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

export function SubmissionDetails({
  submissionId,
  initialRecord,
  onBack,
  isAdmin,
}) {
  const [submission, setSubmission] = useState(initialRecord);
  const [loading, setLoading] = useState(!initialRecord);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (initialRecord && initialRecord.id === submissionId) {
      setSubmission(initialRecord);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadSubmission = async () => {
      setLoading(true);

      try {
        const data = await fetchSubmissionById(submissionId);

        if (isMounted) {
          if (data) {
            setSubmission(data);
          } else {
            setError('Submission not found.');
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load submission details:', err);
          setError('An error occurred while loading details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSubmission();

    return () => {
      isMounted = false;
    };
  }, [submissionId, initialRecord]);

  /* ---------------------------------
     Loading State
  --------------------------------- */

  if (loading) {
    return (
      <div className="submission-loading">
        <div className="submission-loading-orb">
          <Sparkles size={28} />
        </div>

        <div className="submission-loading-spinner">
          <Loader2 size={22} className="animate-spin" />
        </div>

        <h2>Loading submission</h2>
        <p>Preparing the AI evaluation details...</p>
      </div>
    );
  }

  /* ---------------------------------
     Error State
  --------------------------------- */

  if (error || !submission) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="submission-error-state"
      >
        <div className="submission-error-icon">
          <AlertCircle size={30} />
        </div>

        <span className="submission-section-label">
          Submission unavailable
        </span>

        <h2>{error || 'Submission not found'}</h2>

        <p>
          We could not load the requested submission details.
        </p>

        <button
          onClick={onBack}
          className="submission-primary-btn"
        >
          <ArrowLeft size={18} />
          <span>Back to Leaderboard</span>
        </button>
      </motion.div>
    );
  }

  const { evaluation_reasoning: evalData } = submission;

  const isEdited =
    submission.score_edit_log &&
    submission.score_edit_log.length > 0;

  const score = Number(submission.total_score || 0);

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="submission-page"
      >
        {/* =========================================
            TOP NAVIGATION
        ========================================= */}

        <motion.div
          variants={itemVariants}
          className="submission-topbar"
        >
          <button
            onClick={onBack}
            className="submission-back-btn"
          >
            <ArrowLeft size={18} />
            <span>Back to Leaderboard</span>
          </button>

          <div className="submission-topbar-right">
            <div className="submission-ai-status">
              <span className="submission-status-dot" />
              <Sparkles size={14} />
              AI Evaluation
            </div>

            {isEdited && isAdmin && (
              <div className="submission-admin-warning">
                <ShieldAlert size={15} />
                <span>Scores Edited by Admin</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* =========================================
            PAGE HERO
        ========================================= */}

        <motion.section
          variants={itemVariants}
          className="submission-hero"
        >
          <div className="submission-hero-glow submission-hero-glow-one" />
          <div className="submission-hero-glow submission-hero-glow-two" />

          <div className="submission-hero-content">
            <div className="submission-eyebrow">
              <span className="submission-eyebrow-icon">
                <Sparkles size={15} />
              </span>

              <span>Prompt2Poster AI Evaluation</span>

              <span className="submission-eyebrow-line" />
            </div>

            <h1>
              Submission
              <span> Details</span>
            </h1>

            <p>
              Explore the submitted poster, AI assessment,
              detailed scoring, and evaluation insights.
            </p>
          </div>

          <div className="submission-hero-badge">
            <Brain size={20} />

            <div>
              <strong>AI Scored</strong>
              <span>Evaluation complete</span>
            </div>
          </div>
        </motion.section>

        {/* =========================================
            MAIN CONTENT
        ========================================= */}

        <div className="submission-layout">

          {/* =====================================
              LEFT COLUMN
          ===================================== */}

          <motion.div
            variants={itemVariants}
            className="submission-left-column"
          >

            {/* Poster */}
            <div className="submission-poster-card">
              <div className="submission-card-top">
                <div>
                  <span className="submission-mini-label">
                    VISUAL SUBMISSION
                  </span>

                  <h2>
                    Poster Preview
                  </h2>
                </div>

                <div className="submission-card-icon">
                  <Eye size={18} />
                </div>
              </div>

              <div className="submission-poster-frame">
                <div className="submission-poster-grid" />

                <img
                  src={
                    submission.poster_url ||
                    '/placeholder.svg?height=600&width=400'
                  }
                  alt={`Poster by ${submission.contestant_name}`}
                  className="submission-poster-image"
                />

                <div className="submission-poster-overlay" />

                <button
                  onClick={() => setIsFullscreen(true)}
                  className="submission-fullscreen-btn"
                  title="View Fullscreen"
                >
                  <Maximize2 size={17} />
                  <span>View Fullscreen</span>
                </button>

                <div className="submission-poster-ai-badge">
                  <Sparkles size={14} />
                  AI Evaluated
                </div>
              </div>

              <div className="submission-poster-footer">
                <div className="submission-id">
                  <span>ID</span>
                  <code>
                    {submission.id?.substring(0, 8)}
                  </code>
                </div>

                <a
                  href={submission.poster_url}
                  download={`poster-${submission.contestant_name
                    .replace(/\s+/g, '-')
                    .toLowerCase()}.png`}
                  className="submission-download-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download size={16} />
                  Download Poster
                </a>
              </div>
            </div>

            {/* AI Prompt */}
            {submission.ai_prompt_used && (
              <motion.div
                variants={itemVariants}
                className="submission-info-card"
              >
                <div className="submission-card-heading">
                  <div className="submission-heading-icon purple">
                    <Pencil size={17} />
                  </div>

                  <div>
                    <span>Creative Input</span>
                    <h3>AI Prompt Used</h3>
                  </div>
                </div>

                <div className="submission-prompt-box">
                  {submission.ai_prompt_used}
                </div>
              </motion.div>
            )}


          </motion.div>

          {/* =====================================
              RIGHT COLUMN
          ===================================== */}

          <div className="submission-right-column">

            {/* Contestant Header */}
            <motion.div
              variants={itemVariants}
              className="submission-profile-card"
            >
              <div className="submission-profile-main">

                <div className="submission-profile-avatar">
                  {submission.contestant_name
                    ?.charAt(0)
                    ?.toUpperCase() || '?'}
                </div>

                <div className="submission-profile-info">
                  <span className="submission-mini-label">
                    CONTESTANT
                  </span>

                  <h2>
                    {submission.contestant_name}
                  </h2>

                  <div className="submission-topic">
                    <FileText size={15} />
                    <span>{submission.topic}</span>
                  </div>

                  {isAdmin && submission.college_name && (
                    <div className="submission-college">
                      🎓 {submission.college_name}
                    </div>
                  )}
                </div>

                {/* Score */}
                <div className="submission-score-block">
                  <div className="submission-score-ring">
                    <div className="submission-score-inner">
                      <strong>{score}</strong>
                      <span>/100</span>
                    </div>
                  </div>

                  <span className="submission-score-label">
                    AI SCORE
                  </span>
                </div>
              </div>

              <div className="submission-profile-meta">
                <div>
                  <CalendarDays size={15} />
                  <span>
                    Submitted {formatDate(submission.created_at)}
                  </span>
                </div>

                <div className="submission-completed">
                  <CheckCircle2 size={15} />
                  Evaluation Complete
                </div>
              </div>
            </motion.div>

            {/* AI Assessment */}
            {evalData?.overall_evaluation && (
              <motion.div
                variants={itemVariants}
                className="submission-assessment-card"
              >
                <div className="submission-assessment-glow" />

                <div className="submission-assessment-header">
                  <div className="submission-assessment-icon">
                    <Sparkles size={19} />
                  </div>

                  <div>
                    <span>AI INSIGHT</span>
                    <h3>Overall Assessment</h3>
                  </div>

                  <div className="submission-ai-chip">
                    AI Generated
                  </div>
                </div>

                <blockquote>
                  “{evalData.overall_evaluation}”
                </blockquote>
              </motion.div>
            )}

            {/* Areas for Improvement */}
            {submission.issues &&
              submission.issues.length > 0 && (
                <motion.div
                  variants={itemVariants}
                  className="submission-issues-card"
                >
                  <div className="submission-card-heading">
                    <div className="submission-heading-icon orange">
                      <AlertCircle size={18} />
                    </div>

                    <div>
                      <span>AI FEEDBACK</span>
                      <h3>Areas for Improvement</h3>
                    </div>
                  </div>

                  <div className="submission-issues-list">
                    {submission.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className="submission-issue-item"
                      >
                        <div className="submission-issue-number">
                          {String(idx + 1).padStart(2, '0')}
                        </div>

                        <p>{issue}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

            {/* Score Breakdown */}
            <motion.div
              variants={itemVariants}
              className="submission-score-card"
            >
              <div className="submission-score-header">
                <div>
                  <span>AI ANALYSIS</span>
                  <h3>Detailed Score Breakdown</h3>
                </div>

                <div className="submission-score-header-icon">
                  <Trophy size={20} />
                </div>
              </div>

              <div className="submission-score-content">
                <ScoreBreakdown evaluation={evalData} />
              </div>
            </motion.div>

            {/* Admin Edit History */}
            {isAdmin && isEdited && (
              <motion.div
                variants={itemVariants}
                className="submission-history-card"
              >
                <div className="submission-card-heading">
                  <div className="submission-heading-icon red">
                    <History size={18} />
                  </div>

                  <div>
                    <span>ADMINISTRATOR</span>
                    <h3>Score Edit History</h3>
                  </div>

                  <div className="submission-admin-chip">
                    <ShieldAlert size={13} />
                    Admin
                  </div>
                </div>

                <div className="submission-history-list">
                  {[...submission.score_edit_log]
                    .reverse()
                    .map((log, idx) => (
                      <div
                        key={idx}
                        className="submission-history-item"
                      >
                        <div className="submission-history-line">
                          <div className="submission-history-dot">
                            <Clock3 size={13} />
                          </div>
                        </div>

                        <div className="submission-history-content">
                          <div className="submission-history-top">
                            <strong>
                              AI Re-evaluation Triggered
                            </strong>

                            <span>
                              {formatDate(log.timestamp)}
                            </span>
                          </div>

                          <div className="submission-history-change">
                            <span>Previous score</span>

                            <strong className="old-score">
                              {log.previous_total}
                            </strong>

                            <ArrowLeft
                              size={15}
                              className="score-arrow"
                            />

                            <strong className="new-score">
                              {log.new_total}
                            </strong>

                            <span>Updated score</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* =========================================
          FULLSCREEN VIEWER
      ========================================= */}

      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="submission-lightbox"
            onClick={() => setIsFullscreen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="submission-lightbox-top"
            >
              <div className="submission-lightbox-brand">
                <Sparkles size={17} />
                <span>Prompt2Poster AI</span>
              </div>

              <button
                onClick={() => setIsFullscreen(false)}
                className="submission-lightbox-close"
                aria-label="Close fullscreen"
              >
                <X size={23} />
              </button>
            </motion.div>

            <motion.img
              initial={{
                scale: 0.92,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.92,
                opacity: 0,
              }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300,
              }}
              src={
                submission.poster_url ||
                '/placeholder.svg?height=1200&width=800'
              }
              alt="Fullscreen Poster"
              className="submission-lightbox-image"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="submission-lightbox-footer">
              <span>
                {submission.contestant_name}
              </span>

              <span>
                Score: <strong>{score}/100</strong>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
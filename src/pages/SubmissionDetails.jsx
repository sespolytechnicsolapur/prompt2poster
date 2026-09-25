import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Maximize2, X, Download, ShieldAlert, FileText, History, Image as ImageIcon, AlertCircle, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { fetchSubmissionById } from '../services/submissionService';
import { formatDate } from '../utils/formatters';
import { cn } from '../lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export function SubmissionDetails({ submissionId, initialRecord, onBack, isAdmin }) {
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
        if (isMounted) setLoading(false);
      }
    };
    loadSubmission();
    return () => { isMounted = false; };
  }, [submissionId, initialRecord]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted font-sans">
        <Loader2 size={40} className="animate-spin text-accent" />
        <p className="text-lg">Loading submission details...</p>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <h2 className="text-2xl text-danger font-heading font-bold mb-4">
          {error || 'Submission not found'} 😕
        </h2>
        <button onClick={onBack} className="btn btn-secondary font-heading font-bold flex items-center mx-auto gap-2">
          <ArrowLeft size={18} />
          <span>Back to Leaderboard</span>
        </button>
      </motion.div>
    );
  }

  const { evaluation_reasoning: evalData } = submission;
  const isEdited = submission.score_edit_log && submission.score_edit_log.length > 0;

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col gap-8"
    >
      {/* Top Nav */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <button onClick={onBack} className="btn btn-ghost text-secondary font-sans font-bold flex items-center gap-2 hover:-translate-x-1 transition-transform">
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        {isEdited && isAdmin && (
          <div className="badge badge-mono bg-warning-subtle text-warning border-warning font-sans flex items-center gap-2 shadow-sm animate-pulse">
            <ShieldAlert size={14} />
            <span>Scores Edited by Admin ⚠️</span>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 items-start">
        {/* Left Column: Poster Image */}
        <motion.div variants={itemVariants} className="flex flex-col gap-6 lg:sticky lg:top-24">
          <div className="surface-card p-4 flex flex-col gap-4 shadow-sketchy relative overflow-hidden group">
            {/* Image Container */}
            <div className="relative rounded-sketchy overflow-hidden bg-app border-2 border-border-subtle">
              <img
                src={submission.poster_url || '/placeholder.svg?height=600&width=400'}
                alt={`Poster by ${submission.contestant_name}`}
                className="w-full h-auto object-contain block max-h-[70vh]"
              />

              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsFullscreen(true)}
                className="btn btn-primary absolute top-4 right-4 p-2 w-10 h-10 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                title="View Fullscreen"
              >
                <Maximize2 size={18} />
              </button>
            </div>

            {/* Poster Info Actions */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted flex gap-2 font-sans">
                <span className="badge badge-mono">ID: {submission.id.substring(0, 8)}</span>
              </div>
              <a
                href={submission.poster_url}
                download={`poster-${submission.contestant_name.replace(/\s+/g, '-').toLowerCase()}.png`}
                className="btn btn-ghost btn-sm font-sans flex items-center gap-2 hover:text-accent"
                target="_blank" rel="noopener noreferrer"
              >
                <Download size={16} />
                <span>Download</span>
              </a>
            </div>
          </div>

          {/* AI Prompt Used (if available) */}
          {submission.ai_prompt_used && (
            <motion.div variants={itemVariants} className="surface-card p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Pencil size={18} className="text-accent" />
                <h3 className="text-lg font-bold text-primary font-heading m-0">
                  AI Prompt Used
                </h3>
              </div>
              <div className="bg-surface-subtle p-4 rounded-[12px_4px_12px_4px/4px_12px_4px_12px] text-sm text-secondary leading-relaxed font-mono whitespace-pre-wrap break-words border-2 border-dashed border-border-subtle">
                {submission.ai_prompt_used}
              </div>
            </motion.div>
          )}

          {/* AI Chat Screenshot (if available) */}
          {submission.chat_screenshot_url && (
            <motion.div variants={itemVariants} className="surface-card p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon size={18} className="text-accent" />
                <h3 className="text-lg font-bold text-primary font-heading m-0">
                  AI Chat Screenshot
                </h3>
              </div>
              <div className="rounded-xl overflow-hidden border border-border bg-surface-subtle group">
                <a href={submission.chat_screenshot_url} target="_blank" rel="noopener noreferrer" className="block relative">
                  <img
                    src={submission.chat_screenshot_url}
                    alt="AI Chat Screenshot"
                    className="w-full max-h-[400px] object-contain block transition-opacity group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-black/60 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm flex items-center gap-2">
                      <Maximize2 size={14} /> View Full
                    </span>
                  </div>
                </a>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Right Column: Details & Evaluation */}
        <div className="flex flex-col gap-6">

          {/* Header Info */}
          <motion.div variants={itemVariants} className="surface-card p-6 shadow-sketchy">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h1 className="text-3xl font-bold text-primary font-heading mb-2 tracking-tight">
                  {submission.contestant_name}
                </h1>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-secondary text-[0.95rem] font-sans italic">
                    <FileText size={16} />
                    <span>{submission.topic}</span>
                  </div>
                  {isAdmin && submission.college_name && (
                    <div className="flex items-center gap-2 text-muted text-sm font-sans mt-1">
                      <span className="badge badge-mono">🎓 {submission.college_name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Total Score Circle */}
              <div className="w-[76px] h-[76px] rounded-full bg-accent border-4 border-primary shadow-[4px_4px_0_var(--text-primary)] flex flex-col items-center justify-center text-white shrink-0 -rotate-3 hover:rotate-3 transition-transform cursor-default">
                <span className="mono-num text-3xl font-extrabold leading-none font-display">
                  {submission.total_score}
                </span>
                <span className="text-[0.7rem] font-bold opacity-90 font-sans mt-0.5">/100</span>
              </div>
            </div>

            <div className="text-sm text-dim pt-4 border-t-2 border-dashed border-border font-sans italic flex items-center justify-between">
              <span>Submitted on {formatDate(submission.created_at)}</span>
            </div>
          </motion.div>

          {/* Overall Evaluation Summary */}
          {evalData?.overall_evaluation && (
            <motion.div variants={itemVariants} className="surface-card p-6 bg-surface-subtle border border-border">
              <h3 className="text-lg font-bold text-primary font-heading mb-3 uppercase tracking-wider flex items-center gap-2">
                Overall AI Assessment 🤖
              </h3>
              <p className="text-base text-primary leading-relaxed font-sans italic m-0">
                "{evalData.overall_evaluation}"
              </p>
            </motion.div>
          )}

          {/* Identified Issues */}
          {submission.issues && submission.issues.length > 0 && (
            <motion.div variants={itemVariants} className="surface-card p-6 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={20} className="text-warning" />
                <h3 className="text-lg font-bold text-primary font-heading m-0">
                  Areas for Improvement
                </h3>
              </div>
              <ul className="m-0 pl-6 flex flex-col gap-3 text-secondary text-[0.95rem] font-sans list-disc marker:text-warning">
                {submission.issues.map((issue, idx) => (
                  <li key={idx} className="leading-relaxed pl-1">{issue}</li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Score Breakdown */}
          <motion.div variants={itemVariants} className="surface-card p-6 shadow-sketchy">
            <h3 className="text-2xl font-bold text-primary font-heading mb-6 flex items-center gap-2">
              Detailed Score Breakdown 📊
            </h3>
            <ScoreBreakdown evaluation={evalData} />
          </motion.div>

          {/* Admin Score Edit Log */}
          {isAdmin && isEdited && (
            <motion.div variants={itemVariants} className="surface-card p-6 border-l-[6px] border-l-danger rotate-[0.2deg] shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <History size={18} className="text-danger" />
                <h3 className="text-lg font-bold text-primary font-heading m-0">
                  Admin Score Edit Log ⚠️
                </h3>
              </div>
              <div className="flex flex-col gap-3">
                {[...submission.score_edit_log].reverse().map((log, idx) => (
                  <div key={idx} className="bg-surface-subtle py-3 px-4 rounded-[12px_4px_12px_4px/4px_12px_4px_12px] text-[0.95rem] border-2 border-dashed border-border-subtle font-sans">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-primary font-heading">AI Re-evaluation Triggered</span>
                      <span className="text-dim italic text-sm">{formatDate(log.timestamp)}</span>
                    </div>
                    <div className="text-secondary flex items-center gap-2">
                      Total changed from <strong className="mono-num font-display text-danger text-lg">{log.previous_total}</strong> to <strong className="mono-num font-display text-success text-lg">{log.new_total}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </div>

      {/* Fullscreen Image Viewer Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-8 backdrop-blur-sm"
            onClick={() => setIsFullscreen(false)}
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 bg-white/10 border-2 border-white/30 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all hover:bg-white/20 hover:scale-110 hover:-rotate-6"
            >
              <X size={28} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={submission.poster_url || '/placeholder.svg?height=1200&width=800'}
              alt="Fullscreen Poster"
              className="max-w-full max-h-full object-contain cursor-zoom-out rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

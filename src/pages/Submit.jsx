import React, { useState, useRef } from 'react';
import { Upload, X, Send, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { evaluatePosterWithAI } from '../services/evaluationService';
import { saveSubmission, pickRandomTopic, uploadImageToSupabase } from '../services/submissionService';
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
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedScreenshotFile, setSelectedScreenshotFile] = useState(null);
  const [screenshotPreviewUrl, setScreenshotPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [aiPromptUsed, setAiPromptUsed] = useState('');

  const hasAlreadySubmitted = leaderboard && contestant
    ? leaderboard.some(s => s.submitted_by_user_id === contestant.user_id)
    : false;

  const fileInputRef = useRef(null);
  const screenshotInputRef = useRef(null);

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

  const handleScreenshotSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP) for the chat screenshot');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Screenshot must be less than 10MB');
      return;
    }

    setSelectedScreenshotFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => setScreenshotPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const clearScreenshotSelection = () => {
    setSelectedScreenshotFile(null);
    setScreenshotPreviewUrl(null);
    if (screenshotInputRef.current) screenshotInputRef.current.value = '';
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
      let imageUrlForAi = previewUrl; 
      const uploadResult = await uploadImageToSupabase(selectedFile, contestant.user_id, 'submissions');
      if (uploadResult.url) {
        imageUrlForAi = uploadResult.url;
      }

      const { evaluation, source } = await evaluatePosterWithAI({
        posterDataUrl: imageUrlForAi,
        topic: finalTopicTitle,
        contestantName: contestant.name,
        aiPrompt: aiPromptUsed
      });

      await saveSubmission({
        contestantName: contestant.name,
        submittedByUserId: contestant.user_id,
        collegeName: contestant.college_name,
        topic: finalTopicTitle,
        posterFile: imageUrlForAi !== previewUrl ? imageUrlForAi : selectedFile, 
        chatScreenshotFile: selectedScreenshotFile,
        aiPromptUsed: aiPromptUsed.trim(),
        evaluation
      });

      setIsSubmitted(true);
    } catch (err) {
      console.error('[Submit Error]', err);
      setError(err.message || 'An error occurred during evaluation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showTopic = topicVisible || isAdmin;

  if (isSubmitted || hasAlreadySubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto my-16 text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-success-subtle text-success border border-success flex items-center justify-center mx-auto mb-6 shadow-lg shadow-success/10 transform -rotate-3 hover:rotate-3 transition-transform">
          <CheckCircle2 size={38} />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary font-display mb-4 tracking-tight">
          {hasAlreadySubmitted ? 'You Have Already Submitted!' : 'Successfully Submitted!'}
        </h1>
        <p className="text-secondary text-lg leading-relaxed mb-8 font-sans">
          Your poster has been securely uploaded and the AI evaluation is complete.
          The detailed results and final scores will be announced by the organizers later.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-3xl mx-auto flex flex-col gap-8"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary font-display mb-2 tracking-tight">
          Submit Your Poster
        </h1>
        <p className="text-secondary text-lg max-w-lg mx-auto font-sans">
          Upload your design for AI evaluation and scoring
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="surface-card p-6 md:p-8 shadow-sketchy">
        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          
          {/* 1. Topic Assignment Section */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-primary font-heading flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-sm font-sans font-bold shadow-md shadow-accent/30 -rotate-2">1</span>
              Your Assigned Topic
            </h2>

            {loadingTopic ? (
              <div className="p-6 bg-surface-subtle rounded-sketchy border border-dashed border-border text-center text-muted font-sans flex flex-col items-center">
                <Loader2 size={24} className="animate-spin mb-2 text-accent" />
                Loading assignment...
              </div>
            ) : showTopic ? (
              <div className="p-6 bg-surface rounded-sketchy border border-accent-subtle shadow-sm flex items-start gap-4 hover:border-accent transition-colors">
                <div className="w-12 h-12 rounded-xl bg-accent-subtle flex items-center justify-center text-accent shrink-0 transform rotate-2">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary font-heading mb-1">
                    {assignedTopic?.topic_title || 'No active topic'}
                  </h3>
                  <p className="text-secondary text-base leading-relaxed font-sans">
                    {assignedTopic?.description || 'Design a poster based on this topic.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-surface-subtle rounded-sketchy border border-border-strong text-center">
                <h3 className="text-lg font-bold text-primary font-heading mb-1">Topic Hidden</h3>
                <p className="text-secondary text-sm font-sans">
                  The competition topic will be revealed shortly by the organizers.
                </p>
              </div>
            )}
          </div>

          {/* 2. Contestant Details */}
          <div className="flex flex-col gap-5">
            <h2 className="text-xl font-bold text-primary font-heading flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-sm font-sans font-bold shadow-md shadow-accent/30 rotate-2">2</span>
              Submission Details
            </h2>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[0.95rem] font-semibold text-primary">Contestant Name</label>
                <input
                  type="text"
                  value={contestant?.name || ''}
                  className="form-input bg-surface-subtle text-secondary cursor-not-allowed border-dashed"
                  disabled
                />
                <span className="text-xs text-dim font-sans mt-1">Autofilled from your login credentials</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[0.95rem] font-semibold text-primary">AI Prompt Used</label>
                <textarea
                  rows={3}
                  placeholder="Paste the prompt you used to generate this poster (e.g. Midjourney, DALL-E)..."
                  value={aiPromptUsed}
                  onChange={(e) => setAiPromptUsed(e.target.value)}
                  className="form-input resize-y"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <label className="font-sans text-[0.95rem] font-semibold text-primary">
                Chat Screenshot
              </label>
              <p className="text-sm text-secondary mb-2 leading-relaxed">
                Upload a screenshot of your conversation with the AI showing the prompt and generated image.
              </p>
              {!screenshotPreviewUrl ? (
                <div
                  onClick={() => screenshotInputRef.current?.click()}
                  className="border-2 border-dashed border-border-strong rounded-sketchy p-6 text-center cursor-pointer bg-surface-subtle transition-all hover:border-accent hover:bg-accent-subtle group"
                >
                  <input
                    type="file"
                    ref={screenshotInputRef}
                    onChange={handleScreenshotSelect}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-2 text-secondary group-hover:text-accent font-sans">
                    <ImageIcon size={20} />
                    <span className="text-[0.95rem] font-bold">Click to upload screenshot</span>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-sketchy overflow-hidden border border-border bg-surface-subtle p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden px-2">
                      <ImageIcon size={18} className="text-accent shrink-0" />
                      <span className="text-sm font-bold truncate text-primary">
                        {selectedScreenshotFile?.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={clearScreenshotSelection}
                      className="text-muted hover:text-danger p-1 transition-colors"
                      title="Remove screenshot"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. File Upload */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-primary font-heading flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-sm font-sans font-bold shadow-md shadow-accent/30 -rotate-1">3</span>
              Upload Design
            </h2>

            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border-strong rounded-sketchy p-12 text-center cursor-pointer bg-surface-subtle transition-all hover:border-accent hover:bg-accent-subtle hover:-translate-y-1 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-full bg-surface border-2 border-border flex items-center justify-center mx-auto mb-4 text-accent shadow-md group-hover:rotate-12 transition-transform duration-300">
                  <Upload size={28} />
                </div>
                <h3 className="text-xl font-bold text-primary font-heading mb-1">
                  Click to upload poster
                </h3>
                <p className="text-secondary text-sm font-sans italic">
                  PNG, JPG or WebP (max. 10MB)
                </p>
              </div>
            ) : (
              <div className="relative rounded-sketchy overflow-hidden border border-border bg-surface-subtle shadow-md group">
                <img
                  src={previewUrl}
                  alt="Poster preview"
                  className="w-full max-h-[600px] object-contain block bg-black/5"
                />
                <button
                  type="button"
                  onClick={clearSelection}
                  className="absolute top-4 right-4 bg-black/60 text-white border-2 border-white rounded-full w-10 h-10 flex items-center justify-center cursor-pointer backdrop-blur-sm shadow-md transition-transform hover:-rotate-6 hover:scale-110"
                  title="Remove image"
                >
                  <X size={18} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-2 text-white font-sans">
                  <ImageIcon size={16} />
                  <span className="text-[0.95rem] font-bold flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                    {selectedFile.name}
                  </span>
                  <span className="text-sm opacity-80">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 text-danger bg-danger-subtle p-4 rounded-[15px_225px_15px_255px/255px_15px_225px_15px] border-2 border-danger font-sans"
            >
              <AlertCircle size={20} className="shrink-0" />
              <span className="text-[0.95rem] font-bold">{error}</span>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: (isSubmitting || !selectedFile || !showTopic) ? 1 : 1.02 }}
            whileTap={{ scale: (isSubmitting || !selectedFile || !showTopic) ? 1 : 0.98 }}
            type="submit"
            className="btn btn-primary w-full p-4 text-xl mt-2 font-heading font-bold flex items-center justify-center gap-2"
            disabled={isSubmitting || !selectedFile || !showTopic}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                <span>AI is evaluating your poster...</span>
              </>
            ) : (
              <>
                <Send size={20} />
                <span>Submit Design <span className="font-sans opacity-70">→</span></span>
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}

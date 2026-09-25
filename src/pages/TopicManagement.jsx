import React, { useState, useEffect } from 'react';
import {
  Lock, Eye, EyeOff, AlertCircle, Plus, Trash2, Shuffle,
  Check, ToggleLeft, ToggleRight, Settings, Users, FileText, ListChecks
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AdminSubmissionTable } from '../components/AdminSubmissionTable';
import { ScoreEditModal } from '../components/ScoreEditModal';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { ContestantManager } from '../components/ContestantManager';
import { VisibilitySettings } from '../components/VisibilitySettings';
import { reEvaluateWithNewScore } from '../services/evaluationService';
import {
  fetchLeaderboard,
  deleteSubmission,
  toggleSubmissionVisibility,
  updateSubmissionScores
} from '../services/submissionService';
import { cn } from '../lib/utils';

// ── Password Gate ────────────────────────────────────────────────────────────
const ORGANIZER_PASSWORD = import.meta.env.VITE_ORGANIZER_PASSWORD;

function PasswordGate({ onUnlock }) {
  const [input, setInput] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === ORGANIZER_PASSWORD) {
      onUnlock();
    } else {
      setError(true);
      setInput('');
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto my-16 flex flex-col gap-6"
    >
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary text-inverse flex items-center justify-center mx-auto mb-4 shadow-sketchy transform rotate-3">
          <Lock size={28} />
        </div>
        <h1 className="text-2xl font-bold text-primary font-heading mb-1">
          Organizer Access
        </h1>
        <p className="text-secondary text-sm font-sans">
          Enter the administrative password to manage competition settings.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="surface-card p-6 flex flex-col gap-5 shadow-sketchy border-2 border-border-strong">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-primary font-sans flex items-center gap-2">
            <Lock size={14} className="text-accent" />
            <span>Password</span>
          </label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Enter password..."
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(false); }}
              className="form-input w-full pr-10"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors flex items-center"
              tabIndex={-1}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 text-danger bg-danger-subtle border-2 border-dashed border-danger-subtle p-3 text-sm rounded-sketchy"
          >
            <AlertCircle size={16} />
            <span className="font-bold">Incorrect password.</span>
          </motion.div>
        )}

        <button type="submit" className="btn btn-primary w-full p-3 font-heading font-bold mt-2 hover:rotate-1" disabled={!input.trim()}>
          Unlock Dashboard
        </button>
      </form>
    </motion.div>
  );
}

// ── Single Topic Tab ──────────────────────────────────────────────────────────
function SingleTopicTab({ activeTopic, onUpdateTopic }) {
  const [topicTitle, setTopicTitle] = useState(activeTopic?.topic_title || '');
  const [description, setDescription] = useState(activeTopic?.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topicTitle.trim()) return;
    setIsSaving(true);
    setSuccessMsg(null);
    try {
      await onUpdateTopic(topicTitle, description);
      setSuccessMsg('Active competition topic updated.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to set active topic:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="surface-card p-6 flex flex-col gap-5 border border-border">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-primary font-sans">Active Topic Title *</label>
        <input type="text" placeholder="e.g. Artificial Intelligence for Ocean Conservation" value={topicTitle} onChange={(e) => setTopicTitle(e.target.value)} className="form-input" required />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-primary font-sans">Topic Description & Directives</label>
        <textarea rows={3} placeholder="Provide context or guidelines for contestants and the AI judge..." value={description} onChange={(e) => setDescription(e.target.value)} className="form-input resize-y" />
      </div>
      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-success bg-success-subtle p-3 text-sm rounded-sketchy border border-success-subtle">
          <Check size={16} />
          <span className="font-bold">{successMsg}</span>
        </motion.div>
      )}
      <div>
        <button type="submit" className="btn btn-primary px-6 py-2" disabled={isSaving || !topicTitle.trim()}>
          {isSaving ? 'Updating...' : 'Publish Active Topic'}
        </button>
      </div>
    </form>
  );
}

// ── Topic Pool Tab ────────────────────────────────────────────────────────────
function TopicPoolTab({ topicPool, loadingPool, onAddTopic, onRemoveTopic }) {
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsAdding(true);
    try {
      await onAddTopic(newTitle.trim(), newDesc.trim());
      setNewTitle(''); setNewDesc('');
      setSuccessMsg('Topic added to pool.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) { console.error('Failed to add topic:', err); }
    finally { setIsAdding(false); }
  };

  const handleRemove = async (id) => {
    setDeletingId(id);
    try { await onRemoveTopic(id); } catch (err) { console.error(err); }
    setDeletingId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleAdd} className="surface-card p-6 flex flex-col gap-5 border border-border">
        <h3 className="text-base font-bold text-primary font-heading m-0">Add Topic to Pool</h3>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-primary font-sans">Topic Title *</label>
          <input type="text" placeholder="e.g. AI in Healthcare: Precision Medicine" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="form-input" required />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-primary font-sans">Description</label>
          <input type="text" placeholder="Brief context for contestants and AI judge..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="form-input" />
        </div>
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-success bg-success-subtle p-3 text-sm rounded-sketchy">
            <Check size={16} />
            <span className="font-bold">{successMsg}</span>
          </motion.div>
        )}
        <div>
          <button type="submit" className="btn btn-secondary px-6 py-2 flex items-center gap-2" disabled={isAdding || !newTitle.trim()}>
            <Plus size={16} />
            <span>{isAdding ? 'Adding...' : 'Add to Pool'}</span>
          </button>
        </div>
      </form>

      <div className="surface-card p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-primary font-heading m-0">Configured Pool Topics</h3>
          <span className="badge badge-mono">{topicPool.length} topics</span>
        </div>
        
        {loadingPool ? (
          <p className="text-muted text-sm font-sans italic">Loading pool...</p>
        ) : topicPool.length === 0 ? (
          <div className="text-center p-8 bg-surface-subtle border-2 border-dashed border-border-subtle rounded-sketchy">
            <p className="text-secondary text-sm font-sans m-0">
              No topics in pool. Add topics above to enable multi-topic assignment.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {topicPool.map((t, idx) => (
              <motion.div 
                key={t.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-start justify-between gap-4 p-4 bg-surface-subtle rounded-sketchy border border-border-subtle"
              >
                <div className="flex items-start gap-3">
                  <span className="mono-num text-xs text-dim mt-1 shrink-0">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-primary font-sans">{t.topic_title}</div>
                    {t.description && (
                      <div className="text-xs text-secondary mt-1 font-sans">{t.description}</div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => handleRemove(t.id)} 
                  disabled={deletingId === t.id} 
                  className="text-danger opacity-70 hover:opacity-100 hover:bg-danger-subtle p-2 rounded-full transition-all shrink-0" 
                  title="Remove topic"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Submissions Management Tab ────────────────────────────────────────────────
function SubmissionsTab({ adminPassword, onViewDetails, whitelistedUserIds, onToggleUserWhitelist }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const list = await fetchLeaderboard({ includeHidden: true });
      setSubmissions(list);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);

  const handleToggleVisibility = async (id, isHidden) => {
    await toggleSubmissionVisibility(id, isHidden);
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, is_hidden: isHidden } : s));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteSubmission(deleteTarget.id);
      setSubmissions(prev => prev.filter(s => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) { console.error(err); }
    finally { setIsDeleting(false); }
  };

  const handleReEvaluate = async (newTotalScore) => {
    if (!editTarget) throw new Error('No submission selected');
    const result = await reEvaluateWithNewScore({
      newTotalScore,
      topic: editTarget.topic,
      contestantName: editTarget.contestant_name,
      adminPassword
    });
    return result.evaluation;
  };

  const handleSaveScores = async (newEvaluation) => {
    if (!editTarget) return;
    const previousScores = {
      total_score: editTarget.total_score,
      relevance: editTarget.relevance_to_topic_score,
      hierarchy: editTarget.visual_hierarchy_score,
      typography: editTarget.typography_readability_score,
      composition: editTarget.composition_layout_score,
      creativity: editTarget.creativity_originality_score,
      color: editTarget.color_usage_score,
      communication: editTarget.overall_communication_score,
    };

    await updateSubmissionScores(editTarget.id, newEvaluation, previousScores);
    await loadAll(); 
    setEditTarget(null);
  };

  if (loading) {
    return (
      <div className="surface-card p-12 text-center text-muted font-sans border border-border">
        Loading submissions...
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <AdminSubmissionTable
        submissions={submissions}
        onEditScores={setEditTarget}
        onToggleVisibility={handleToggleVisibility}
        onDelete={setDeleteTarget}
        onViewDetails={onViewDetails}
        whitelistedUserIds={whitelistedUserIds}
        onToggleUserWhitelist={onToggleUserWhitelist}
      />

      {/* Score Edit Modal */}
      {editTarget && (
        <ScoreEditModal
          submission={editTarget}
          onSave={handleSaveScores}
          onReEvaluate={handleReEvaluate}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          submission={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}
    </motion.div>
  );
}

// ── Main Organizer Page ───────────────────────────────────────────────────────
export function TopicManagement({
  activeTopic,
  onUpdateTopic,
  topicPool,
  loadingPool,
  poolMode,
  onChangePoolMode,
  onAddTopic,
  onRemoveTopic,
  leaderboardVisible,
  topicVisible,
  onToggleLeaderboard,
  onToggleTopic,
  onViewDetails,
  isAdmin,
  setIsAdmin,
  whitelistedUserIds,
  onToggleUserWhitelist,
  roundSettings,
  onSaveRoundSettings
}) {
  const [unlocked, setUnlocked] = useState(isAdmin || !ORGANIZER_PASSWORD);
  const [activeTab, setActiveTab] = useState('topics');
  const [adminPassword, setAdminPassword] = useState(isAdmin ? ORGANIZER_PASSWORD : '');

  // Sync unlocked state if isAdmin changes externally
  useEffect(() => {
    if (isAdmin) {
      setUnlocked(true);
      setAdminPassword(ORGANIZER_PASSWORD);
    }
  }, [isAdmin]);

  const handleUnlock = () => {
    setUnlocked(true);
    setAdminPassword(ORGANIZER_PASSWORD);
    if (setIsAdmin) setIsAdmin(true);
  };

  if (!unlocked) return <PasswordGate onUnlock={handleUnlock} />;

  const isPool = poolMode === 'pool';

  const tabs = [
    { id: 'topics', label: 'Topics', icon: FileText },
    { id: 'contestants', label: 'Contestants', icon: Users },
    { id: 'submissions', label: 'Submissions', icon: ListChecks },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto flex flex-col gap-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-primary font-display mb-2 tracking-tight">
          Organizer Panel
        </h1>
        <p className="text-secondary text-base font-sans m-0">
          Manage topics, contestants, submissions, and competition settings.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border pb-4 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={cn("btn px-5 py-2 font-sans font-bold flex items-center gap-2", isActive ? 'btn-primary' : 'btn-ghost')}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Topics Tab ──────────────────────────────────────────────── */}
      {activeTab === 'topics' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
          {/* Assignment Mode Card */}
          <div className="surface-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-border shadow-sm">
            <div>
              <div className="text-lg font-bold text-primary font-heading mb-1">
                Assignment Mode: <span className="text-accent">{isPool ? 'Random Pool' : 'Single Active Topic'}</span>
              </div>
              <div className="text-secondary text-sm font-sans">
                {isPool
                  ? 'Contestants are assigned a topic deterministically from the pool based on their name.'
                  : 'All contestants submit against the single active competition topic.'}
              </div>
            </div>
            <button onClick={() => onChangePoolMode(isPool ? 'single' : 'pool')} className="btn btn-secondary px-4 py-2 flex items-center gap-2 shrink-0 border-2">
              {isPool ? <ToggleRight size={20} className="text-accent" /> : <ToggleLeft size={20} />}
              <span>Switch to {isPool ? 'Single Mode' : 'Pool Mode'}</span>
            </button>
          </div>

          {/* Sub-tabs for single vs pool */}
          <div className="flex gap-3 pb-2 border-b-2 border-dashed border-border">
            <button className={cn("btn px-4 py-2 font-bold", !isPool ? 'btn-primary' : 'btn-ghost')} onClick={() => onChangePoolMode('single')}>
              Single Topic
            </button>
            <button className={cn("btn px-4 py-2 font-bold flex items-center gap-2", isPool ? 'btn-primary' : 'btn-ghost')} onClick={() => onChangePoolMode('pool')}>
              <Shuffle size={16} />
              <span>Topic Pool</span>
              {topicPool.length > 0 && <span className="mono-num opacity-70">({topicPool.length})</span>}
            </button>
          </div>

          {!isPool && <SingleTopicTab activeTopic={activeTopic} onUpdateTopic={onUpdateTopic} />}
          {isPool && <TopicPoolTab topicPool={topicPool} loadingPool={loadingPool} onAddTopic={onAddTopic} onRemoveTopic={onRemoveTopic} />}
        </motion.div>
      )}

      {/* ── Contestants Tab ─────────────────────────────────────────── */}
      {activeTab === 'contestants' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <ContestantManager
            adminPassword={adminPassword}
            onToggleUserWhitelist={onToggleUserWhitelist}
          />
        </motion.div>
      )}

      {/* ── Submissions Tab ─────────────────────────────────────────── */}
      {activeTab === 'submissions' && (
        <SubmissionsTab
          adminPassword={adminPassword}
          onViewDetails={onViewDetails}
          whitelistedUserIds={whitelistedUserIds}
          onToggleUserWhitelist={onToggleUserWhitelist}
        />
      )}

      {/* ── Settings Tab ────────────────────────────────────────────── */}
      {activeTab === 'settings' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <VisibilitySettings
            leaderboardVisible={leaderboardVisible}
            topicVisible={topicVisible}
            onToggleLeaderboard={onToggleLeaderboard}
            onToggleTopic={onToggleTopic}
            roundSettings={roundSettings}
            onSaveRoundSettings={onSaveRoundSettings}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

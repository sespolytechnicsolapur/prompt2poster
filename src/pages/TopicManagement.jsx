import React, { useState, useEffect } from 'react';
import {
  Lock, Eye, EyeOff, AlertCircle, Plus, Trash2, Shuffle,
  Check, ToggleLeft, ToggleRight, Settings, Users, FileText, ListChecks
} from 'lucide-react';
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
    <div style={{ maxWidth: '380px', margin: '3rem auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          Organizer Access
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: 0 }}>
          Enter the administrative password to manage competition settings.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="surface-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">
            <Lock size={13} />
            <span>Password</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Enter password..."
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(false); }}
              className="form-input"
              autoFocus
              style={{ paddingRight: '2.5rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              style={{
                position: 'absolute', right: '0.65rem', top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: 0,
                display: 'flex', alignItems: 'center'
              }}
              tabIndex={-1}
              aria-label={showPw ? 'Hide' : 'Show'}
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            color: 'var(--status-danger)',
            backgroundColor: 'var(--status-danger-subtle)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '0.5rem 0.75rem', fontSize: '0.75rem',
            borderRadius: 'var(--radius-sm)'
          }}>
            <AlertCircle size={14} />
            <span>Incorrect password.</span>
          </div>
        )}

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.55rem' }} disabled={!input.trim()}>
          <span>Unlock</span>
        </button>
      </form>
    </div>
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
    <form onSubmit={handleSubmit} className="surface-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="form-group">
        <label className="form-label"><span>Active Topic Title *</span></label>
        <input type="text" placeholder="e.g. Artificial Intelligence for Ocean Conservation" value={topicTitle} onChange={(e) => setTopicTitle(e.target.value)} className="form-input" required />
      </div>
      <div className="form-group">
        <label className="form-label"><span>Topic Description & Directives</span></label>
        <textarea rows={3} placeholder="Provide context or guidelines for contestants and the AI judge..." value={description} onChange={(e) => setDescription(e.target.value)} className="form-input" style={{ resize: 'vertical' }} />
      </div>
      {successMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-success)', backgroundColor: 'var(--status-success-subtle)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <Check size={14} /><span>{successMsg}</span>
        </div>
      )}
      <div>
        <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving || !topicTitle.trim()}>
          <span>{isSaving ? 'Updating...' : 'Publish Active Topic'}</span>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <form onSubmit={handleAdd} className="surface-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Add Topic to Pool</h3>
        <div className="form-group">
          <label className="form-label"><span>Topic Title *</span></label>
          <input type="text" placeholder="e.g. AI in Healthcare: Precision Medicine" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="form-input" required />
        </div>
        <div className="form-group">
          <label className="form-label"><span>Description</span></label>
          <input type="text" placeholder="Brief context for contestants and AI judge..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="form-input" />
        </div>
        {successMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-success)', backgroundColor: 'var(--status-success-subtle)', padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>
            <Check size={13} /><span>{successMsg}</span>
          </div>
        )}
        <div>
          <button type="submit" className="btn btn-secondary btn-sm" disabled={isAdding || !newTitle.trim()}>
            <Plus size={13} /><span>{isAdding ? 'Adding...' : 'Add to Pool'}</span>
          </button>
        </div>
      </form>

      <div className="surface-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Configured Pool Topics</h3>
          <span className="badge badge-mono">{topicPool.length} topics</span>
        </div>
        {loadingPool ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Loading pool...</p>
        ) : topicPool.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', fontSize: '0.8125rem', textAlign: 'center', margin: '1rem 0' }}>
            No topics in pool. Add topics above to enable multi-topic assignment.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {topicPool.map((t, idx) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <span className="mono-num" style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.1rem' }}>{(idx + 1).toString().padStart(2, '0')}</span>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t.topic_title}</div>
                    {t.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{t.description}</div>}
                  </div>
                </div>
                <button onClick={() => handleRemove(t.id)} disabled={deletingId === t.id} className="btn btn-ghost btn-sm" style={{ color: 'var(--status-danger)', padding: '0.25rem', height: '24px', width: '24px' }} title="Remove topic">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Submissions Management Tab ────────────────────────────────────────────────
function SubmissionsTab({ adminPassword, onViewDetails }) {
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
    await loadAll(); // Refresh data
    setEditTarget(null);
  };

  if (loading) {
    return <div className="surface-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading submissions...</div>;
  }

  return (
    <>
      <AdminSubmissionTable
        submissions={submissions}
        onEditScores={setEditTarget}
        onToggleVisibility={handleToggleVisibility}
        onDelete={setDeleteTarget}
        onViewDetails={onViewDetails}
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
    </>
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
  setIsAdmin
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
    <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          Organizer Panel
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
          Manage topics, contestants, submissions, and competition settings.
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.35rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Topics Tab ──────────────────────────────────────────────── */}
      {activeTab === 'topics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Assignment Mode Card */}
          <div className="surface-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Assignment Mode: {isPool ? 'Random Pool' : 'Single Active Topic'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {isPool
                  ? 'Contestants are assigned a topic deterministically from the pool based on their name.'
                  : 'All contestants submit against the single active competition topic.'}
              </div>
            </div>
            <button onClick={() => onChangePoolMode(isPool ? 'single' : 'pool')} className="btn btn-secondary btn-sm">
              {isPool ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              <span>Switch to {isPool ? 'Single Mode' : 'Pool Mode'}</span>
            </button>
          </div>

          {/* Sub-tabs for single vs pool */}
          <div style={{ display: 'flex', gap: '0.5rem', paddingBottom: '0.25rem' }}>
            <button className={`btn btn-sm ${!isPool ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onChangePoolMode('single')}>Single Topic</button>
            <button className={`btn btn-sm ${isPool ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onChangePoolMode('pool')}>
              <Shuffle size={12} /><span>Topic Pool</span>
              {topicPool.length > 0 && <span className="mono-num" style={{ opacity: 0.7 }}>({topicPool.length})</span>}
            </button>
          </div>

          {!isPool && <SingleTopicTab activeTopic={activeTopic} onUpdateTopic={onUpdateTopic} />}
          {isPool && <TopicPoolTab topicPool={topicPool} loadingPool={loadingPool} onAddTopic={onAddTopic} onRemoveTopic={onRemoveTopic} />}
        </div>
      )}

      {/* ── Contestants Tab ─────────────────────────────────────────── */}
      {activeTab === 'contestants' && (
        <ContestantManager adminPassword={adminPassword} />
      )}

      {/* ── Submissions Tab ─────────────────────────────────────────── */}
      {activeTab === 'submissions' && (
        <SubmissionsTab adminPassword={adminPassword} onViewDetails={onViewDetails} />
      )}

      {/* ── Settings Tab ────────────────────────────────────────────── */}
      {activeTab === 'settings' && (
        <VisibilitySettings
          leaderboardVisible={leaderboardVisible}
          topicVisible={topicVisible}
          onToggleLeaderboard={onToggleLeaderboard}
          onToggleTopic={onToggleTopic}
        />
      )}
    </div>
  );
}

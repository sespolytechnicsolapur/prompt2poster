import React, { useState } from 'react';
import {
  Target, Save, CheckCircle, Settings, Lock, ShieldCheck,
  Eye, EyeOff, AlertCircle, Plus, Trash2, List, Shuffle,
  ToggleLeft, ToggleRight, Hash,
} from 'lucide-react';

// ── Password Gate ────────────────────────────────────────────────────────────
const ORGANIZER_PASSWORD = import.meta.env.VITE_ORGANIZER_PASSWORD;

function PasswordGate({ onUnlock }) {
  const [input, setInput]     = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === ORGANIZER_PASSWORD) {
      onUnlock();
    } else {
      setError(true);
      setShaking(true);
      setInput('');
      setTimeout(() => setShaking(false), 600);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '460px', margin: '4rem auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
      <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(6,182,212,0.15) 100%)', border: '1px solid rgba(99,102,241,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(99,102,241,0.2)' }}>
        <Lock size={32} color="var(--accent-primary)" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div className="badge badge-cyan" style={{ marginBottom: '0.75rem' }}><ShieldCheck size={13} /> Restricted Access</div>
        <h1 style={{ fontSize: '1.9rem', color: '#FFFFFF', marginBottom: '0.5rem' }}>Organizer Area</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>Enter the organizer password to manage competition topics.</p>
      </div>
      <form onSubmit={handleSubmit} className="glass-panel" style={{ width: '100%', padding: '2rem', animation: shaking ? 'shake 0.5s cubic-bezier(.36,.07,.19,.97)' : undefined }}>
        <div className="form-group" style={{ marginBottom: error ? '0.75rem' : '1.5rem' }}>
          <label className="form-label"><Lock size={15} color="var(--accent-primary)" /><span>Organizer Password</span></label>
          <div style={{ position: 'relative' }}>
            <input type={showPw ? 'text' : 'password'} placeholder="Enter password..." value={input} onChange={(e) => { setInput(e.target.value); setError(false); }} className="form-input" autoFocus style={{ paddingRight: '3rem', borderColor: error ? 'var(--accent-rose)' : undefined, boxShadow: error ? '0 0 0 3px rgba(244,63,94,0.2)' : undefined }} />
            <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 0, display: 'flex', alignItems: 'center' }} tabIndex={-1} aria-label={showPw ? 'Hide' : 'Show'}>
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-rose)', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: 'var(--radius-md)', padding: '0.65rem 0.9rem', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            <AlertCircle size={16} /><span>Incorrect password. Please try again.</span>
          </div>
        )}
        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }} disabled={!input.trim()}>
          <ShieldCheck size={18} /><span>Unlock</span>
        </button>
      </form>
      <style>{`@keyframes shake{10%,90%{transform:translateX(-2px)}20%,80%{transform:translateX(4px)}30%,50%,70%{transform:translateX(-6px)}40%,60%{transform:translateX(6px)}}`}</style>
    </div>
  );
}

// ── Single Topic Tab ──────────────────────────────────────────────────────────
function SingleTopicTab({ activeTopic, onUpdateTopic }) {
  const [topicTitle, setTopicTitle] = useState(activeTopic?.topic_title || '');
  const [description, setDescription] = useState(activeTopic?.description || '');
  const [isSaving, setIsSaving]     = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topicTitle.trim()) return;
    setIsSaving(true);
    setSuccessMsg(null);
    try {
      await onUpdateTopic(topicTitle, description);
      setSuccessMsg('Active competition topic updated successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Failed to set active topic:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2.5rem' }}>
      <div className="form-group">
        <label className="form-label"><Target size={16} color="var(--accent-amber)" /><span>Active Competition Topic Title *</span></label>
        <input type="text" placeholder="e.g. Artificial Intelligence for Ocean Conservation & Marine Life" value={topicTitle} onChange={(e) => setTopicTitle(e.target.value)} className="form-input" required />
      </div>
      <div className="form-group">
        <label className="form-label"><span>Topic Description & Judging Directives</span></label>
        <textarea rows={4} placeholder="Provide context or key visual guidelines for contestants..." value={description} onChange={(e) => setDescription(e.target.value)} className="form-input" style={{ resize: 'vertical' }} />
      </div>
      {successMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--accent-emerald)', background: 'rgba(16,185,129,0.12)', padding: '0.85rem 1.125rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16,185,129,0.3)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          <CheckCircle size={18} /><span>{successMsg}</span>
        </div>
      )}
      <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }} disabled={isSaving || !topicTitle.trim()}>
        <Save size={18} /><span>{isSaving ? 'Updating Topic...' : 'Save & Publish Active Topic'}</span>
      </button>
    </form>
  );
}

// ── Topic Pool Tab ────────────────────────────────────────────────────────────
function TopicPoolTab({ topicPool, loadingPool, onAddTopic, onRemoveTopic }) {
  const [newTitle, setNewTitle]       = useState('');
  const [newDesc, setNewDesc]         = useState('');
  const [isAdding, setIsAdding]       = useState(false);
  const [deletingId, setDeletingId]   = useState(null);
  const [successMsg, setSuccessMsg]   = useState(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsAdding(true);
    try {
      await onAddTopic(newTitle.trim(), newDesc.trim());
      setNewTitle('');
      setNewDesc('');
      setSuccessMsg('Topic added to pool!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to add topic:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (id) => {
    setDeletingId(id);
    try { await onRemoveTopic(id); } catch (err) { console.error(err); }
    setDeletingId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Add new topic form */}
      <form onSubmit={handleAdd} className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} color="var(--accent-emerald)" /> Add Topic to Pool
        </h3>
        <div className="form-group">
          <label className="form-label"><Target size={15} color="var(--accent-amber)" /><span>Topic Title *</span></label>
          <input type="text" placeholder="e.g. AI in Healthcare: Diagnostics & Precision Medicine" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="form-input" required />
        </div>
        <div className="form-group">
          <label className="form-label"><span>Description (optional)</span></label>
          <input type="text" placeholder="Brief context for contestants and the AI judge..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="form-input" />
        </div>
        {successMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-md)', padding: '0.65rem 0.9rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
            <CheckCircle size={15} /><span>{successMsg}</span>
          </div>
        )}
        <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }} disabled={isAdding || !newTitle.trim()}>
          <Plus size={16} /><span>{isAdding ? 'Adding...' : 'Add to Pool'}</span>
        </button>
      </form>

      {/* Pool list */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <List size={18} color="var(--accent-cyan)" /> Current Pool
          </h3>
          <span className="badge badge-cyan"><Hash size={12} /> {topicPool.length} topic{topicPool.length !== 1 ? 's' : ''}</span>
        </div>

        {loadingPool ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading pool…</p>
        ) : topicPool.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-dim)' }}>
            <Shuffle size={32} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
            <p style={{ fontSize: '0.9rem' }}>No topics in pool yet. Add some above!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {topicPool.map((t, idx) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: '6px', padding: '0.2rem 0.55rem', minWidth: '2rem', textAlign: 'center', flexShrink: 0, marginTop: '2px' }}>{idx + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', marginBottom: t.description ? '0.25rem' : 0, wordBreak: 'break-word' }}>{t.topic_title}</p>
                  {t.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5, wordBreak: 'break-word' }}>{t.description}</p>}
                </div>
                <button onClick={() => handleRemove(t.id)} disabled={deletingId === t.id} style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.6rem', cursor: 'pointer', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', flexShrink: 0, opacity: deletingId === t.id ? 0.5 : 1 }} title="Remove topic">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function TopicManagement({ activeTopic, onUpdateTopic, topicPool, loadingPool, poolMode, onChangePoolMode, onAddTopic, onRemoveTopic }) {
  const [unlocked, setUnlocked] = useState(!ORGANIZER_PASSWORD);
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'pool'

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />;

  const isPool = poolMode === 'pool';

  const tabStyle = (tab) => ({
    padding: '0.6rem 1.25rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid',
    borderColor: activeTab === tab ? 'rgba(99,102,241,0.5)' : 'var(--border-color)',
    background: activeTab === tab ? 'rgba(99,102,241,0.15)' : 'transparent',
    color: activeTab === tab ? '#818CF8' : 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'all 0.15s ease',
  });

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade-in">
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <div className="badge badge-cyan"><Settings size={13} /> Organizer Control Panel</div>
          <div className="badge badge-emerald"><ShieldCheck size={13} /> Authenticated</div>
        </div>
        <h1 style={{ fontSize: '2.3rem', color: '#FFFFFF' }}>Competition Topic Management</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Set a single active topic, or build a pool of topics for random contestant assignment.
        </p>
      </div>

      {/* Pool Mode Toggle */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff', marginBottom: '0.2rem' }}>Assignment Mode</p>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>
            {isPool
              ? 'Pool mode — contestants receive a random topic from the pool based on their name.'
              : 'Single mode — all contestants see the same active topic.'}
          </p>
        </div>
        <button
          onClick={() => onChangePoolMode(isPool ? 'single' : 'pool')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid', borderColor: isPool ? 'rgba(139,92,246,0.4)' : 'var(--border-color)', background: isPool ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.04)', color: isPool ? '#A78BFA' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', transition: 'all 0.2s ease' }}
        >
          {isPool ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
          {isPool ? 'Pool Mode ON' : 'Single Topic Mode'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button style={tabStyle('single')} onClick={() => setActiveTab('single')}>
          <Target size={15} /> Single Topic
        </button>
        <button style={tabStyle('pool')} onClick={() => setActiveTab('pool')}>
          <Shuffle size={15} /> Topic Pool {topicPool.length > 0 && <span style={{ background: 'rgba(99,102,241,0.2)', borderRadius: '99px', padding: '0 0.45rem', fontSize: '0.78rem' }}>{topicPool.length}</span>}
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'single' && <SingleTopicTab activeTopic={activeTopic} onUpdateTopic={onUpdateTopic} />}
      {activeTab === 'pool'   && <TopicPoolTab topicPool={topicPool} loadingPool={loadingPool} onAddTopic={onAddTopic} onRemoveTopic={onRemoveTopic} />}
    </div>
  );
}

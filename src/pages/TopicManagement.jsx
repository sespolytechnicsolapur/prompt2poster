import React, { useState } from 'react';
import { Target, Save, CheckCircle, Sparkles, Settings } from 'lucide-react';

export function TopicManagement({ activeTopic, onUpdateTopic }) {
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
      setSuccessMsg('Active competition topic updated successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Failed to set active topic:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade-in">
      {/* Page Header */}
      <div>
        <div className="badge badge-cyan" style={{ marginBottom: '0.5rem' }}>
          <Settings size={13} /> Organizer Control Panel
        </div>
        <h1 style={{ fontSize: '2.3rem', color: '#FFFFFF' }}>
          Competition Topic Management
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Set or update the active poster topic given to contestants on-site. The active topic is stored in Supabase and automatically retrieved by contestant forms and AI evaluation engines.
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2.5rem' }}>
        <div className="form-group">
          <label className="form-label">
            <Target size={16} color="var(--accent-gold)" />
            <span>Active Competition Topic Title *</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Artificial Intelligence for Ocean Conservation & Marine Life"
            value={topicTitle}
            onChange={(e) => setTopicTitle(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span>Topic Description & Judging Directives</span>
          </label>
          <textarea
            rows={4}
            placeholder="Provide context or key visual guidelines for contestants..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input"
            style={{ resize: 'vertical' }}
          />
        </div>

        {successMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            color: 'var(--accent-emerald)',
            background: 'rgba(16, 185, 129, 0.12)',
            padding: '0.85rem 1.125rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            <CheckCircle size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }}
          disabled={isSaving || !topicTitle.trim()}
        >
          <Save size={18} />
          <span>{isSaving ? 'Updating Topic...' : 'Save & Publish Active Topic'}</span>
        </button>
      </form>
    </div>
  );
}

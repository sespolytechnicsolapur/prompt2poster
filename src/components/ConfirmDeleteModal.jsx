import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Confirmation dialog for permanently deleting a submission.
 */
export function ConfirmDeleteModal({ submission, onConfirm, onClose, isDeleting }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="surface-card"
        style={{
          width: '100%', maxWidth: '420px',
          padding: '1.5rem',
          display: 'flex', flexDirection: 'column', gap: '1rem'
        }}
      >
        {/* Warning Icon */}
        <div style={{
          width: '40px', height: '40px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--status-danger-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--status-danger)'
        }}>
          <AlertTriangle size={20} />
        </div>

        {/* Message */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Delete Submission
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
            Are you sure you want to permanently delete the submission by{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{submission?.contestant_name}</strong>?
            This action cannot be undone. The entry will be removed from the database and leaderboard.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm" disabled={isDeleting}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-sm"
            disabled={isDeleting}
            style={{
              backgroundColor: 'var(--status-danger)',
              color: '#FFFFFF',
              border: 'none',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.35rem'
            }}
          >
            <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

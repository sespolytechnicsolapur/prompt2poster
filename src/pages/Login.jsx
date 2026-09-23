import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, AlertCircle, User, KeyRound } from 'lucide-react';
import { loginContestant } from '../services/authService';

/**
 * Login page for contestants.
 * Authenticates using User ID + Unique ID credentials
 * imported from the admin Excel upload.
 */
export function Login({ onLoginSuccess }) {
  const [userId, setUserId]       = useState('');
  const [uniqueId, setUniqueId]   = useState('');
  const [showId, setShowId]       = useState(false);
  const [error, setError]         = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!userId.trim() || !uniqueId.trim()) {
      setError('Both User ID and Unique ID are required');
      return;
    }

    setIsLoading(true);
    try {
      const contestant = await loginContestant(userId.trim(), uniqueId.trim());
      if (onLoginSuccess) onLoginSuccess(contestant);
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '48px', height: '48px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--accent-primary-subtle)',
          border: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem auto',
          color: 'var(--accent-primary)'
        }}>
          <LogIn size={22} />
        </div>
        <h1 style={{
          fontSize: '1.5rem', fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '0.35rem',
          letterSpacing: '-0.02em'
        }}>
          Contestant Login
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0, lineHeight: '1.5' }}>
          Enter the User ID and Unique ID provided to you at the competition.
        </p>
      </div>

      {/* Login Form */}
      <form
        onSubmit={handleSubmit}
        className="surface-card"
        style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        {/* User ID */}
        <div className="form-group">
          <label className="form-label">
            <User size={14} />
            <span>User ID</span>
          </label>
          <input
            type="text"
            placeholder="e.g. SES-042"
            value={userId}
            onChange={(e) => { setUserId(e.target.value); setError(null); }}
            className="form-input"
            autoFocus
            autoComplete="username"
          />
        </div>

        {/* Unique ID */}
        <div className="form-group">
          <label className="form-label">
            <KeyRound size={14} />
            <span>Unique ID</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showId ? 'text' : 'password'}
              placeholder="Enter your unique code..."
              value={uniqueId}
              onChange={(e) => { setUniqueId(e.target.value); setError(null); }}
              className="form-input"
              style={{ paddingRight: '2.5rem' }}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowId(v => !v)}
              style={{
                position: 'absolute', right: '0.65rem', top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: 0,
                display: 'flex', alignItems: 'center'
              }}
              tabIndex={-1}
              aria-label={showId ? 'Hide Unique ID' : 'Show Unique ID'}
            >
              {showId ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            color: 'var(--status-danger)',
            backgroundColor: 'var(--status-danger-subtle)',
            padding: '0.6rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            fontSize: '0.8125rem'
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.7rem 1rem' }}
          disabled={isLoading || !userId.trim() || !uniqueId.trim()}
        >
          <LogIn size={16} />
          <span>{isLoading ? 'Verifying...' : 'Login'}</span>
        </button>
      </form>

      {/* Help text */}
      <p style={{
        textAlign: 'center', fontSize: '0.75rem',
        color: 'var(--text-dim)', margin: 0
      }}>
        Your Unique ID was provided at the competition venue. Contact an organizer if you need assistance.
      </p>

      {/* Organizer Access Toggle */}
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button 
          onClick={() => {
            const pwd = prompt("Enter Organizer Password:");
            if (pwd === import.meta.env.VITE_ORGANIZER_PASSWORD) {
              if (onLoginSuccess) onLoginSuccess({ name: 'Admin', user_id: 'ADMIN', isAdmin: true });
            } else if (pwd) {
              alert("Incorrect password.");
            }
          }}
          style={{
            background: 'none', border: 'none', color: 'var(--accent-primary)',
            fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline'
          }}
        >
          Organizer Access
        </button>
      </div>
    </div>
  );
}

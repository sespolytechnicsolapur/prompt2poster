import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, AlertCircle, User, KeyRound, Pencil } from 'lucide-react';
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
    <div style={{
      maxWidth: '420px', margin: '3rem auto',
      display: 'flex', flexDirection: 'column', gap: '1.5rem',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', animation: 'fade-up 0.5s ease-out both' }}>
        <div style={{
          width: '56px', height: '56px',
          borderRadius: '16px',
          backgroundColor: 'var(--text-primary)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
          color: 'var(--text-inverse)'
        }}>
          <LogIn size={24} />
        </div>
        <h1 style={{
          fontSize: '2rem', fontWeight: 800,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-display)',
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em'
        }}>
          Contestant Login
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1rem', margin: 0, lineHeight: '1.6',
          fontFamily: 'var(--font-sans)',
        }}>
          Enter the User ID and Unique ID provided to you at the competition.
        </p>
      </div>

      {/* Login Form */}
      <form
        onSubmit={handleSubmit}
        className="surface-card"
        style={{
          padding: '1.75rem',
          display: 'flex', flexDirection: 'column', gap: '1.25rem',
          animation: 'fade-up 0.6s ease-out both 0.1s'
        }}
      >
        {/* User ID */}
        <div className="form-group">
          <label className="form-label" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem' }}>
            <User size={16} />
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
            style={{ fontFamily: 'var(--font-sans)' }}
          />
        </div>

        {/* Unique ID */}
        <div className="form-group">
          <label className="form-label" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem' }}>
            <KeyRound size={16} />
            <span>Unique ID</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showId ? 'text' : 'password'}
              placeholder="Enter your unique code..."
              value={uniqueId}
              onChange={(e) => { setUniqueId(e.target.value); setError(null); }}
              className="form-input"
              style={{ paddingRight: '2.5rem', fontFamily: 'var(--font-sans)' }}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowId(v => !v)}
              style={{
                position: 'absolute', right: '0.75rem', top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: 0,
                display: 'flex', alignItems: 'center'
              }}
              tabIndex={-1}
              aria-label={showId ? 'Hide Unique ID' : 'Show Unique ID'}
            >
              {showId ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            color: 'var(--status-danger)',
            backgroundColor: 'var(--status-danger-subtle)',
            padding: '0.7rem 0.95rem',
            borderRadius: '15px 225px 15px 255px / 255px 15px 225px 15px',
            border: '2px solid var(--status-danger)',
            fontSize: '0.9rem',
            fontFamily: 'var(--font-sans)',
            animation: 'wiggle 0.5s ease-out'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-accent"
          style={{
            width: '100%', padding: '0.8rem 1rem',
            fontSize: '1.1rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            marginTop: '0.25rem',
            borderRadius: 'var(--radius-sm)'
          }}
          disabled={isLoading || !userId.trim() || !uniqueId.trim()}
        >
          <LogIn size={18} />
          <span>{isLoading ? 'Verifying...' : 'Login →'}</span>
        </button>
      </form>

      {/* Help text */}
      <p style={{
        textAlign: 'center', fontSize: '0.85rem',
        color: 'var(--text-dim)', margin: 0,
        fontFamily: 'var(--font-sans)',
        animation: 'fade-up 0.5s ease-out both 0.3s'
      }}>
        Your Unique ID was provided at the competition venue. Contact an organizer if you need assistance.
      </p>

      {/* Organizer Access Toggle */}
      <div style={{
        textAlign: 'center', marginTop: '0.5rem',
        animation: 'fade-up 0.5s ease-out both 0.4s'
      }}>
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
            background: 'none', border: 'none', color: 'var(--text-muted)',
            fontSize: '0.9rem', cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontWeight: 500,
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          Organizer Access
        </button>
      </div>
    </div>
  );
}

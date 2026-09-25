import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, AlertCircle, User, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { loginContestant } from '../services/authService';
import { cn } from '../lib/utils';

export function Login({ onLoginSuccess }) {
  const [userId, setUserId] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [showId, setShowId] = useState(false);
  const [error, setError] = useState(null);
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
    <div className="max-w-md mx-auto my-12 flex flex-col gap-6 relative">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary text-inverse flex items-center justify-center mx-auto mb-5 shadow-sketchy transform -rotate-3 hover:rotate-3 transition-transform">
          <LogIn size={28} />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary font-display mb-2 tracking-tight">
          Contestant Login
        </h1>
        <p className="text-secondary text-base m-0 leading-relaxed font-sans">
          Enter the User ID and Unique ID provided to you at the competition.
        </p>
      </motion.div>

      {/* Login Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        onSubmit={handleSubmit}
        className="surface-card p-7 flex flex-col gap-6 shadow-sketchy"
      >
        {/* User ID */}
        <div className="flex flex-col gap-2">
          <label className="text-primary font-heading font-bold text-lg flex items-center gap-2">
            <User size={18} className="text-accent" />
            <span>User ID</span>
          </label>
          <input
            type="text"
            placeholder="e.g. SES-042"
            value={userId}
            onChange={(e) => { setUserId(e.target.value); setError(null); }}
            className="form-input text-lg font-mono"
            autoFocus
            autoComplete="username"
          />
        </div>

        {/* Unique ID */}
        <div className="flex flex-col gap-2">
          <label className="text-primary font-heading font-bold text-lg flex items-center gap-2">
            <KeyRound size={18} className="text-accent" />
            <span>Unique ID</span>
          </label>
          <div className="relative">
            <input
              type={showId ? 'text' : 'password'}
              placeholder="Enter your unique code..."
              value={uniqueId}
              onChange={(e) => { setUniqueId(e.target.value); setError(null); }}
              className="form-input text-lg font-mono pr-12 w-full"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowId(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors flex items-center p-1"
              tabIndex={-1}
              aria-label={showId ? 'Hide Unique ID' : 'Show Unique ID'}
            >
              {showId ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 text-danger bg-danger-subtle p-3 rounded-[15px_225px_15px_255px/255px_15px_225px_15px] border-2 border-danger font-sans text-sm"
          >
            <AlertCircle size={18} className="shrink-0" />
            <span className="font-bold">{error}</span>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: (isLoading || !userId.trim() || !uniqueId.trim()) ? 1 : 1.02, rotate: 1 }}
          whileTap={{ scale: (isLoading || !userId.trim() || !uniqueId.trim()) ? 1 : 0.98 }}
          type="submit"
          className="btn btn-accent w-full py-4 text-xl font-heading font-bold mt-2 flex items-center justify-center gap-2"
          disabled={isLoading || !userId.trim() || !uniqueId.trim()}
        >
          <LogIn size={22} />
          <span>{isLoading ? 'Verifying...' : 'Login →'}</span>
        </motion.button>
      </motion.form>

      {/* Help text */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center text-sm text-dim font-sans m-0"
      >
        Your Unique ID was provided at the competition venue. Contact an organizer if you need assistance.
      </motion.p>

      {/* Organizer Access Toggle */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center mt-2"
      >
        <button
          onClick={() => {
            const pwd = prompt("Enter Organizer Password:");
            if (pwd === import.meta.env.VITE_ORGANIZER_PASSWORD) {
              if (onLoginSuccess) onLoginSuccess({ name: 'Admin', user_id: 'ADMIN', isAdmin: true });
            } else if (pwd) {
              alert("Incorrect password.");
            }
          }}
          className="text-muted hover:text-primary transition-colors text-sm font-sans font-semibold underline underline-offset-4 decoration-muted hover:decoration-primary"
        >
          Organizer Access
        </button>
      </motion.div>
    </div>
  );
}

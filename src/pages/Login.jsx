import React, { useState } from 'react';
import {
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  User,
  KeyRound,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  LockKeyhole
} from 'lucide-react';
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
      const contestant = await loginContestant(
        userId.trim(),
        uniqueId.trim()
      );

      if (onLoginSuccess) {
        onLoginSuccess(contestant);
      }
    } catch (err) {
      setError(
        err.message ||
        'Login failed. Check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.08
          }
        }
      }}
      className="login-page"
    >

      {/* Background decoration */}

      <div className="login-page-glow login-page-glow-one" />
      <div className="login-page-glow login-page-glow-two" />

      {/* =====================================================
          HEADER
      ===================================================== */}

      <motion.section
        variants={{
          hidden: {
            opacity: 0,
            y: 20
          },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.55
            }
          }
        }}
        className="login-header"
      >

        {/* Badge */}

        <div className="login-badge">
          <span className="login-badge-dot" />

          <Sparkles size={13} />

          <span>
            PROMPT2POSTER AI
          </span>
        </div>


        {/* Icon */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.8,
            rotate: -8
          }}
          animate={{
            opacity: 1,
            scale: 1,
            rotate: 0
          }}
          transition={{
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="login-icon-wrapper"
        >
          <div className="login-icon">
            <LockKeyhole size={28} />
          </div>

          <span className="login-orbit login-orbit-one" />
          <span className="login-orbit login-orbit-two" />
        </motion.div>


        {/* Heading */}

        <h1>
          Welcome Back
        </h1>

        <p>
          Sign in to access your competition dashboard
          and view your AI evaluation results.
        </p>

      </motion.section>


      {/* =====================================================
          LOGIN CARD
      ===================================================== */}

      <motion.form
        variants={{
          hidden: {
            opacity: 0,
            y: 25
          },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1]
            }
          }
        }}
        onSubmit={handleSubmit}
        className="login-card"
      >

        {/* Card header */}

        <div className="login-card-header">

          <div>
            <h2>
              Contestant Login
            </h2>

            <p>
              Enter your competition credentials below.
            </p>
          </div>

          <div className="login-secure-icon">
            <ShieldCheck size={19} />
          </div>

        </div>


        {/* =================================================
            USER ID
        ================================================= */}

        <div className="login-field">

          <label>
            <span className="login-label-icon">
              <User size={15} />
            </span>

            <span>
              User ID
            </span>
          </label>

          <div
            className={cn(
              'login-input-wrapper',
              userId && 'has-value'
            )}
          >

            <User
              size={18}
              className="login-input-icon"
            />

            <input
              type="text"
              placeholder="Enter your User ID"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                setError(null);
              }}
              autoFocus
              autoComplete="username"
            />

          </div>

          <span className="login-field-hint">
            Example: SES-042
          </span>

        </div>


        {/* =================================================
            UNIQUE ID
        ================================================= */}

        <div className="login-field">

          <label>
            <span className="login-label-icon">
              <KeyRound size={15} />
            </span>

            <span>
              Unique ID
            </span>
          </label>

          <div
            className={cn(
              'login-input-wrapper',
              uniqueId && 'has-value'
            )}
          >

            <KeyRound
              size={18}
              className="login-input-icon"
            />

            <input
              type={
                showId
                  ? 'text'
                  : 'password'
              }
              placeholder="Enter your unique code"
              value={uniqueId}
              onChange={(e) => {
                setUniqueId(e.target.value);
                setError(null);
              }}
              autoComplete="current-password"
            />

            <button
              type="button"
              onClick={() =>
                setShowId((v) => !v)
              }
              className="login-password-toggle"
              tabIndex={-1}
              aria-label={
                showId
                  ? 'Hide Unique ID'
                  : 'Show Unique ID'
              }
            >
              {showId ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>

          </div>

          <span className="login-field-hint">
            Your unique competition code
          </span>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
              y: -5
            }}
            animate={{
              opacity: 1,
              height: 'auto',
              y: 0
            }}
            className="login-error"
          >

            <div className="login-error-icon">
              <AlertCircle size={17} />
            </div>

            <div>
              <strong>
                Login unsuccessful
              </strong>

              <span>
                {error}
              </span>
            </div>

          </motion.div>
        )}


        {/* =================================================
            LOGIN BUTTON
        ================================================= */}

        <motion.button
          whileHover={
            isLoading ||
            !userId.trim() ||
            !uniqueId.trim()
              ? {}
              : {
                  y: -2
                }
          }
          whileTap={
            isLoading ||
            !userId.trim() ||
            !uniqueId.trim()
              ? {}
              : {
                  scale: 0.985
                }
          }
          type="submit"
          disabled={
            isLoading ||
            !userId.trim() ||
            !uniqueId.trim()
          }
          className="login-submit-button"
        >

          {isLoading ? (
            <>
              <span className="login-spinner" />

              <span>
                Verifying Credentials...
              </span>
            </>
          ) : (
            <>
              <LogIn size={19} />

              <span>
                Login to Competition
              </span>

              <span className="login-submit-arrow">
                <ArrowRight size={16} />
              </span>
            </>
          )}

        </motion.button>


        {/* Security note */}

        <div className="login-security-note">

          <ShieldCheck size={15} />

          <span>
            Your competition credentials are securely verified.
          </span>

        </div>

      </motion.form>


      {/* =====================================================
          HELP
      ===================================================== */}

      <motion.div
        variants={{
          hidden: {
            opacity: 0
          },
          visible: {
            opacity: 1,
            transition: {
              duration: 0.5
            }
          }
        }}
        className="login-help"
      >

        <p>
          Don't have your Unique ID?
        </p>

        <span>
          Your Unique ID was provided at the competition
          venue. Contact an organizer if you need assistance.
        </span>

      </motion.div>


      {/* =====================================================
          ORGANIZER ACCESS
      ===================================================== */}

      <motion.div
        variants={{
          hidden: {
            opacity: 0
          },
          visible: {
            opacity: 1
          }
        }}
        className="login-organizer"
      >

        <div className="login-organizer-line">
          <span />
          <span>
            ORGANIZER
          </span>
          <span />
        </div>

        <button
          type="button"
          onClick={() => {
            const pwd = prompt(
              'Enter Organizer Password:'
            );

            if (
              pwd ===
              import.meta.env.VITE_ORGANIZER_PASSWORD
            ) {
              if (onLoginSuccess) {
                onLoginSuccess({
                  name: 'Admin',
                  user_id: 'ADMIN',
                  isAdmin: true
                });
              }
            } else if (pwd) {
              alert('Incorrect password.');
            }
          }}
        >
          Organizer Access
          <ArrowRight size={13} />
        </button>

      </motion.div>


      {/* Bottom branding */}

      <div className="login-footer">
        <span />
        <span>
          PROMPT2POSTER · AI EVALUATION ENGINE
        </span>
        <span />
      </div>

    </motion.div>
  );
}
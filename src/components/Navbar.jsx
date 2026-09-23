import React, { useState } from 'react';
import { Menu, X, Code, Sun, Moon, LogOut, LogIn, User } from 'lucide-react';

/**
 * Main application navigation.
 * Updates conditionally based on authentication, admin state, and visibility rules.
 */
export function Navbar({
  activePage,
  setActivePage,
  activeTopicTitle,
  theme,
  toggleTheme,
  contestant,
  onLogout,
  leaderboardVisible,
  isAdmin
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Close menu when navigating
  const navTo = (page) => {
    setActivePage(page);
    setIsOpen(false);
  };

  // Condition to show leaderboard link
  const showLeaderboardNav = leaderboardVisible || isAdmin;

  return (
    <nav className="navbar">
      <div className="container">
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '4rem'
        }}>
          {/* Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '32px', height: '32px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-primary-hover) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Code size={18} strokeWidth={2.5} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
                Prompt2Poster
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                AI Evaluation Engine
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="nav-desktop">
            <button
              onClick={() => navTo('home')}
              className={`nav-link ${activePage === 'home' ? 'active' : ''}`}
            >
              Overview
            </button>
            {showLeaderboardNav && (
              <button
                onClick={() => navTo('leaderboard')}
                className={`nav-link ${activePage === 'leaderboard' ? 'active' : ''}`}
              >
                Live Leaderboard
              </button>
            )}

            {/* Contestant Actions */}
            {contestant ? (
              <>
                <button
                  onClick={() => navTo('submit')}
                  className="btn btn-primary btn-sm"
                  style={{ marginLeft: '0.5rem', padding: '0.45rem 1rem' }}
                >
                  Submit Poster
                </button>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  marginLeft: '0.75rem', paddingLeft: '0.75rem',
                  borderLeft: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 500 }}>
                    <User size={14} />
                    <span>{contestant.name.split(' ')[0]}</span>
                  </div>
                  <button onClick={onLogout} className="btn btn-ghost btn-sm" style={{ padding: '0.35rem', color: 'var(--text-muted)' }} title="Logout">
                    <LogOut size={14} />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => navTo('login')}
                className="btn btn-secondary btn-sm"
                style={{ marginLeft: '0.5rem', padding: '0.45rem 1rem' }}
              >
                <LogIn size={14} />
                <span>Login to Submit</span>
              </button>
            )}

            <div style={{ width: '1px', height: '1.25rem', backgroundColor: 'var(--border-color)', margin: '0 0.5rem' }} />

            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-sm"
              style={{ padding: '0.4rem', color: 'var(--text-secondary)' }}
              aria-label="Toggle theme"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="nav-mobile" style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }}>
             <button
              onClick={toggleTheme}
              className="btn btn-ghost"
              style={{ padding: '0.4rem', color: 'var(--text-secondary)' }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="btn btn-ghost"
              style={{ padding: '0.4rem', color: 'var(--text-primary)' }}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-color)',
          padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
          zIndex: 50,
          boxShadow: 'var(--shadow-md)'
        }}>
          <button
            onClick={() => navTo('home')}
            className={`nav-link ${activePage === 'home' ? 'active' : ''}`}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem' }}
          >
            Overview
          </button>
          {showLeaderboardNav && (
            <button
              onClick={() => navTo('leaderboard')}
              className={`nav-link ${activePage === 'leaderboard' ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem' }}
            >
              Live Leaderboard
            </button>
          )}

          <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '0.5rem 0' }} />

          {contestant ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <User size={16} />
                <span>Logged in as <strong>{contestant.name}</strong></span>
              </div>
              <button
                onClick={() => navTo('submit')}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
              >
                Submit Poster
              </button>
              <button
                onClick={() => { onLogout(); setIsOpen(false); }}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.75rem' }}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
             <button
              onClick={() => navTo('login')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              <LogIn size={16} />
              <span>Login to Submit</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
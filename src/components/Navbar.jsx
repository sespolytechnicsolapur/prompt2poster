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
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close menu when navigating
  const navTo = (page) => {
    setActivePage(page);
    setMobileOpen(false);
  };

  // Condition to show leaderboard link
  const showLeaderboardNav = leaderboardVisible || isAdmin;

  return (
    <header className="site-navbar">
      <div className="container">
        <div className="navbar-inner">
          {/* LOGO & BRAND */}
          <div className="navbar-brand-group">
            <div className="navbar-logo-symbol">
              <Code size={18} strokeWidth={2.5} />
            </div>
            <div>
              <div className="navbar-brand-name">Prompt2Poster</div>
              <div className="navbar-subtitle">AI Evaluation Engine</div>
            </div>
          </div>

          {/* DESKTOP NAVIGATION */}
          <nav className="desktop-nav">
            <button
              onClick={() => navTo('home')}
              className={`nav-link-btn ${activePage === 'home' ? 'active' : ''}`}
            >
              Overview
            </button>
            {showLeaderboardNav && (
              <button
                onClick={() => navTo('leaderboard')}
                className={`nav-link-btn ${activePage === 'leaderboard' ? 'active' : ''}`}
              >
                Live Leaderboard
              </button>
            )}
            
            <button
              onClick={() => navTo('organizer')}
              className={`nav-link-btn ${activePage === 'organizer' ? 'active' : ''}`}
            >
              Organizer
            </button>

            {/* Contestant Actions */}
            {contestant ? (
              <>
                <button
                  onClick={() => navTo('submit')}
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 1rem', height: '36px', fontSize: '0.875rem' }}
                >
                  Submit Poster
                </button>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  marginLeft: '0.25rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 500 }}>
                    <User size={14} />
                    <span>{contestant.name.split(' ')[0]}</span>
                  </div>
                  <button onClick={onLogout} className="btn btn-ghost" style={{ padding: '0.35rem', color: 'var(--text-muted)' }} title="Logout">
                    <LogOut size={14} />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => navTo('login')}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 1rem', height: '36px', fontSize: '0.875rem' }}
              >
                <LogIn size={14} />
                <span>Login to Submit</span>
              </button>
            )}

            <div className="navbar-divider" />

            {/* THEME */}
            <button
              onClick={toggleTheme}
              className="btn btn-secondary navbar-theme-button"
              aria-label="Toggle theme"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </nav>

          {/* MOBILE CONTROLS */}
          <div className="mobile-nav-controls">
            <button
              onClick={toggleTheme}
              className="mobile-icon-button"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="mobile-icon-button"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="mobile-menu">
          <button
            onClick={() => navTo('home')}
            className={`mobile-menu-item ${activePage === 'home' ? 'mobile-menu-active' : ''}`}
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', fontFamily: 'inherit', fontSize: '0.9375rem', cursor: 'pointer' }}
          >
            Overview
          </button>
          {showLeaderboardNav && (
            <button
              onClick={() => navTo('leaderboard')}
              className={`mobile-menu-item ${activePage === 'leaderboard' ? 'mobile-menu-active' : ''}`}
              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', fontFamily: 'inherit', fontSize: '0.9375rem', cursor: 'pointer' }}
            >
              Live Leaderboard
            </button>
          )}

          <button
            onClick={() => navTo('organizer')}
            className={`mobile-menu-item ${activePage === 'organizer' ? 'mobile-menu-active' : ''}`}
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', fontFamily: 'inherit', fontSize: '0.9375rem', cursor: 'pointer' }}
          >
            Organizer
          </button>

          <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '0.5rem 0' }} />

          {contestant ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <User size={16} />
                <span>Logged in as <strong>{contestant.name}</strong></span>
              </div>
              <button
                onClick={() => navTo('submit')}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', justifyContent: 'center' }}
              >
                Submit Poster
              </button>
              <button
                onClick={() => { onLogout(); setMobileOpen(false); }}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', justifyContent: 'center' }}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
             <button
              onClick={() => navTo('login')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', justifyContent: 'center' }}
            >
              <LogIn size={16} />
              <span>Login to Submit</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
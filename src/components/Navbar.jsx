import React, { useState } from 'react';
import { Menu, X, Triangle, Sun, Moon, LogOut, LogIn, User, Lock } from 'lucide-react';

/**
 * Main application navigation.
 * Hand-drawn style with sketchy borders, handwritten fonts, and playful interactions.
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
  isAdmin,
  setIsAdmin
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
          <div className="navbar-brand-group" onClick={() => navTo('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '32px', height: '32px',
              backgroundColor: 'var(--text-primary)',
              color: 'var(--text-inverse)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Triangle size={16} strokeWidth={3} fill="currentColor" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1 }}>
                Prompt2Poster
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                AI Evaluation Engine
              </div>
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
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <button
                onClick={() => navTo('organizer')}
                className={`nav-link-btn ${activePage === 'organizer' ? 'active' : ''}`}
              >
                Organizer
              </button>
              {isAdmin && (
                <button
                  onClick={() => navTo('whitelist')}
                  className={`nav-link-btn ${activePage === 'whitelist' ? 'active' : ''}`}
                >
                  Whitelist
                </button>
              )}
              {isAdmin && (
                <button 
                  onClick={() => {
                    if (setIsAdmin) setIsAdmin(false);
                    if (activePage === 'organizer') navTo('home');
                  }} 
                  className="btn btn-ghost" 
                  style={{ padding: '0.35rem', color: 'var(--status-danger)' }} 
                  title="Lock Admin Session"
                >
                  <Lock size={14} />
                </button>
              )}
            </div>

            {/* Contestant Actions */}
            {contestant ? (
              <>
                <button
                  onClick={() => navTo('submit')}
                  className="btn btn-accent"
                  style={{
                    padding: '0.45rem 1.1rem',
                    height: '38px',
                    fontSize: '0.95rem',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  Submit Poster
                </button>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  marginLeft: '0.25rem'
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem', fontWeight: 600,
                    fontFamily: 'var(--font-sans)'
                  }}>
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
                style={{
                  padding: '0.45rem 1.1rem',
                  height: '38px',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                }}
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
            onClick={() => { navTo('home'); setMobileOpen(false); }}
            className={`mobile-menu-item ${activePage === 'home' ? 'mobile-menu-active' : ''}`}
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', fontFamily: 'var(--font-sans)', fontSize: '1rem', cursor: 'pointer' }}
          >
            Overview
          </button>
          {showLeaderboardNav && (
            <button
              onClick={() => { navTo('leaderboard'); setMobileOpen(false); }}
              className={`mobile-menu-item ${activePage === 'leaderboard' ? 'mobile-menu-active' : ''}`}
              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', fontFamily: 'var(--font-sans)', fontSize: '1rem', cursor: 'pointer' }}
            >
              Live Leaderboard
            </button>
          )}

          <button
            onClick={() => { navTo('organizer'); setMobileOpen(false); }}
            className={`mobile-menu-item ${activePage === 'organizer' ? 'mobile-menu-active' : ''}`}
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', fontFamily: 'var(--font-sans)', fontSize: '1rem', cursor: 'pointer' }}
          >
            Organizer
          </button>

          {isAdmin && (
            <button
              onClick={() => { navTo('whitelist'); setMobileOpen(false); }}
              className={`mobile-menu-item ${activePage === 'whitelist' ? 'mobile-menu-active' : ''}`}
              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', fontFamily: 'var(--font-sans)', fontSize: '1rem', cursor: 'pointer' }}
            >
              Whitelist
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => {
                if (setIsAdmin) setIsAdmin(false);
                if (activePage === 'organizer') navTo('home');
                setMobileOpen(false);
              }}
              className="mobile-menu-item"
              style={{ 
                width: '100%', textAlign: 'left', background: 'none', 
                border: 'none', fontFamily: 'var(--font-sans)', 
                fontSize: '1rem', cursor: 'pointer', color: 'var(--status-danger)',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              <Lock size={16} /> Lock Admin Session
            </button>
          )}

          <div style={{
            height: '1px', 
            backgroundColor: 'var(--border-color)', 
            margin: '0.75rem 0',
          }} />

          {contestant ? (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem',
                color: 'var(--text-secondary)',
                fontSize: '0.95rem',
                fontFamily: 'var(--font-sans)'
              }}>
                <User size={16} />
                <span>Logged in as <strong style={{ fontFamily: 'var(--font-heading)' }}>{contestant.name}</strong></span>
              </div>
              <button
                onClick={() => { navTo('submit'); setMobileOpen(false); }}
                className="btn btn-accent"
                style={{
                  width: '100%', padding: '0.8rem',
                  marginTop: '0.5rem', justifyContent: 'center',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1.05rem',
                  fontWeight: 600,
                }}
              >
                Submit Poster
              </button>
              <button
                onClick={() => { onLogout(); setMobileOpen(false); }}
                className="btn btn-secondary"
                style={{
                  width: '100%', padding: '0.8rem',
                  marginTop: '0.5rem', justifyContent: 'center',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1rem',
                }}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
             <button
              onClick={() => navTo('login')}
              className="btn btn-primary"
              style={{
                width: '100%', padding: '0.8rem', justifyContent: 'center',
                fontFamily: 'var(--font-heading)',
                fontSize: '1.05rem',
                fontWeight: 700,
              }}
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
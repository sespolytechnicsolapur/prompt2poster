import React, { useState } from 'react';
import {
  Upload,
  Trophy,
  Layers,
  Sun,
  Moon,
  Menu,
  X,
  Settings
} from 'lucide-react';

export function Navbar({
  activePage,
  setActivePage,
  activeTopicTitle,
  theme,
  toggleTheme
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Overview', icon: Layers },
    { id: 'submit', label: 'Submit Poster', icon: Upload },
    { id: 'leaderboard', label: 'Live Leaderboard', icon: Trophy },
    { id: 'organizer', label: 'Organizer Topics', icon: Settings }
  ];

  const handleNavigation = (page) => {
    setActivePage(page);
    setMobileOpen(false);
  };

  return (
    <header className="site-navbar">
      <div className="container">
        <div className="navbar-inner">

          {/* BRAND */}
          <div
            className="navbar-brand-group"
            onClick={() => handleNavigation('home')}
          >
            <div className="navbar-logo-symbol">
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)'
                }}
              >
                P2P
              </span>
            </div>

            <div className="navbar-subtitle">
              AI Evaluation Platform
            </div>
          </div>

          {/* DESKTOP NAVIGATION */}
          <nav className="desktop-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`btn ${
                    isActive ? 'btn-primary' : 'btn-secondary'
                  } navbar-nav-button`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="navbar-divider" />

            {/* THEME */}
            <button
              onClick={toggleTheme}
              className="btn btn-secondary navbar-theme-button"
              aria-label="Toggle theme"
              title={`Switch to ${
                theme === 'dark' ? 'light' : 'dark'
              } mode`}
            >
              {theme === 'dark' ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
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
              {theme === 'dark' ? (
                <Sun size={19} />
              ) : (
                <Moon size={19} />
              )}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="mobile-icon-button"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>

          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="mobile-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`mobile-menu-item ${
                  isActive ? 'mobile-menu-active' : ''
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
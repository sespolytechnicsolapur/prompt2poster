import React, { useState } from 'react';
import {
  Upload,
  Trophy,
  Sliders,
  Layers,
  Sun,
  Moon,
  Menu,
  X
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
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'organizer', label: 'Topics', icon: Sliders },
  ];

  const handleNav = (page) => {
    setActivePage(page);
    setMobileOpen(false);
  };

  return (
    <header className="site-navbar">
      <div className="container">
        <div className="navbar-inner">

          {/* Brand Mark */}
          <div className="navbar-brand-group" onClick={() => handleNav('home')}>
            <div className="navbar-logo-symbol">
              <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>P2P</span>
            </div>
            <span className="navbar-brand-name">Prompt2Poster</span>
            <span className="badge badge-mono" style={{ fontSize: '10px', padding: '0.15rem 0.4rem' }}>v1.0</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="desktop-nav navbar-nav-links">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`nav-link-btn ${isActive ? 'active' : ''}`}
                >
                  <Icon size={14} strokeWidth={1.75} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-color)', margin: '0 0.5rem' }} />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-sm"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              style={{ width: '30px', height: '30px', padding: 0 }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={15} strokeWidth={1.75} /> : <Moon size={15} strokeWidth={1.75} />}
            </button>
          </nav>

          {/* Mobile Actions */}
          <div className="mobile-toggle-btn" style={{ alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-sm"
              style={{ width: '32px', height: '32px', padding: 0 }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="btn btn-secondary btn-sm"
              style={{ width: '32px', height: '32px', padding: 0 }}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="mobile-drawer">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`mobile-drawer-btn ${isActive ? 'active' : ''}`}
              >
                <Icon size={15} strokeWidth={1.75} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}

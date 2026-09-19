import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  Trophy,
  Settings,
  LayoutDashboard,
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
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'submit', label: 'Submit Poster', icon: Upload },
    { id: 'leaderboard', label: 'Live Leaderboard', icon: Trophy },
    { id: 'organizer', label: 'Organizer Topics', icon: Settings },
  ];

  const handleNavigation = (page) => {
    setActivePage(page);
    setMenuOpen(false);
  };

  return (
    <header className="site-navbar">
      <div className="container navbar-container">

        {/* LOGO */}
        <div
          className="navbar-brand"
          onClick={() => handleNavigation('home')}
        >
          <div className="navbar-logo">
            <Sparkles size={22} color="#FFFFFF" />
          </div>

          <div className="navbar-brand-text">
            <div className="navbar-title">
              Prompt2Poster
            </div>

            <div className="navbar-subtitle">
              AI Evaluation Platform
            </div>
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

          <button
            onClick={toggleTheme}
            className="btn btn-secondary navbar-theme-button"
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

          {/* Theme */}
          <button
            onClick={toggleTheme}
            className="mobile-icon-button"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun size={19} />
            ) : (
              <Moon size={19} />
            )}
          </button>

          {/* Menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="mobile-icon-button"
            aria-label="Open menu"
          >
            {menuOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
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
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}

        </div>
      )}
    </header>
  );
}

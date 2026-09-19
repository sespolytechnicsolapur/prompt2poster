import React from 'react';
import { Award, Sparkles, Upload, Trophy, Settings, LayoutDashboard, Sun, Moon } from 'lucide-react';

export function Navbar({ activePage, setActivePage, activeTopicTitle, theme, toggleTheme }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'submit', label: 'Submit Poster', icon: Upload },
    { id: 'leaderboard', label: 'Live Leaderboard', icon: Trophy },
    { id: 'organizer', label: 'Organizer Topics', icon: Settings },
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'var(--bg-card)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px'
      }}>
        {/* Logo Branding */}
        <div
          onClick={() => setActivePage('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            background: 'var(--accent-primary)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px 0 rgba(14, 165, 233, 0.39)'
          }}>
            <Sparkles size={22} color="#FFFFFF" />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.35rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-main)'
            }}>
              Prompt2Poster
            </div>
            <div style={{
              fontSize: '0.72rem',
              color: 'var(--accent-primary)',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              AI Evaluation Platform
            </div>
          </div>
        </div>

        {/* Navigation Actions */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  padding: '0.55rem 1.125rem',
                  fontSize: '0.88rem',
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 0.5rem' }} />

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="btn btn-secondary"
            style={{
              padding: '0.65rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>
      </div>
    </header>
  );
}

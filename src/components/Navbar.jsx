import React from 'react';
import { Award, Sparkles, Upload, Trophy, Settings, LayoutDashboard } from 'lucide-react';

export function Navbar({ activePage, setActivePage, activeTopicTitle }) {
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
      background: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '76px'
      }}>
        {/* Logo Branding */}
        <div 
          onClick={() => setActivePage('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
          }}>
            <Sparkles size={24} color="#FFFFFF" />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.35rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #CBD5E1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Prompt2Poster
            </div>
            <div style={{
              fontSize: '0.72rem',
              color: 'var(--accent-cyan)',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              AI Evaluation Platform
            </div>
          </div>
        </div>

        {/* Active Topic Mini Pill */}
        {activeTopicTitle && (
          <div className="badge badge-cyan" style={{
            display: 'none',
            maxWidth: '340px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            padding: '0.4rem 0.85rem'
          }}>
            <span style={{ color: 'var(--text-muted)' }}>Topic:</span>
            <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{activeTopicTitle}</span>
          </div>
        )}

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
                  borderRadius: 'var(--radius-md)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

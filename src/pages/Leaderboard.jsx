import React from 'react';
import { LeaderboardTable } from '../components/LeaderboardTable';
import { Trophy, Award, RefreshCw } from 'lucide-react';

export function Leaderboard({ leaderboard, loading, onSelectSubmission, onRefresh }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade-in">
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <div className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
            <Trophy size={13} /> Official Judging Standings
          </div>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--text-main)', letterSpacing: '-0.04em' }}>
            Live Competition Leaderboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Real-time contestant rankings calculated automatically from transparent 7-criteria AI evaluation.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="btn btn-secondary"
          style={{ fontSize: '0.88rem' }}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-pulse-glow' : ''} />
          <span>Refresh Standings</span>
        </button>
      </div>

      {/* Leaderboard Table Container */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading real-time Supabase leaderboard records...
        </div>
      ) : (
        <LeaderboardTable
          submissions={leaderboard}
          onSelectSubmission={onSelectSubmission}
        />
      )}
    </div>
  );
}

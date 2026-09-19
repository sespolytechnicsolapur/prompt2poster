import React from 'react';
import { LeaderboardTable } from '../components/LeaderboardTable';
import { RotateCw } from 'lucide-react';

export function Leaderboard({ leaderboard, loading, onSelectSubmission, onRefresh }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Leaderboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            Real-time contestant standings compiled across the 7 evaluation benchmarks.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          disabled={loading}
        >
          <RotateCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Leaderboard Table Container */}
      {loading ? (
        <div className="surface-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Loading standings...
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

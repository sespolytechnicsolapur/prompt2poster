import React from 'react';
import { Trophy, Search, Loader2, ArrowRight, RefreshCw, EyeOff } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export function Leaderboard({
  leaderboard,
  loading,
  onSelectSubmission,
  onRefresh,
  leaderboardVisible,
  isAdmin
}) {
  const [searchTerm, setSearchTerm] = React.useState('');

  // ── Visibility Guard ──────────────────────────────────────────────────────
  if (!leaderboardVisible && !isAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{
          width: '64px', height: '64px',
          borderRadius: '50%', backgroundColor: 'var(--bg-surface-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem auto', color: 'var(--text-muted)'
        }}>
          <EyeOff size={28} />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          Leaderboard Hidden
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '400px', margin: '0 auto' }}>
          The competition organizers have temporarily hidden the leaderboard. Check back later for results!
        </p>
      </div>
    );
  }

  // ── Render Leaderboard ────────────────────────────────────────────────────
  const filtered = leaderboard.filter((item) =>
    item.contestant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.topic?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Trophy size={28} style={{ color: 'var(--accent-primary)' }} />
            Live Leaderboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>
            Real-time rankings based on AI evaluation scores.
            {isAdmin && !leaderboardVisible && (
              <span style={{ display: 'block', color: 'var(--status-danger)', fontSize: '0.8125rem', marginTop: '0.25rem', fontWeight: 600 }}>
                (Currently hidden from contestants)
              </span>
            )}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search contestants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>
          <button
            onClick={onRefresh}
            className="btn btn-ghost"
            style={{ padding: '0.65rem' }}
            title="Refresh Leaderboard"
            disabled={loading}
          >
            <RefreshCw size={18} style={{ color: 'var(--text-secondary)', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      <div className="surface-card" style={{ overflow: 'hidden' }}>
        {loading && leaderboard.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
            <p>Loading rankings...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="ledger-table">
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>Rank</th>
                  <th>Contestant</th>
                  <th>Topic</th>
                  <th style={{ textAlign: 'right' }}>Score</th>
                  <th style={{ width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((item, index) => (
                    <tr
                      key={item.id}
                      onClick={() => onSelectSubmission(item.id, item)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ textAlign: 'center' }}>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '50%', margin: '0 auto',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          backgroundColor: index === 0 ? 'var(--status-warning-subtle)' : index === 1 ? 'rgba(156, 163, 175, 0.2)' : index === 2 ? 'rgba(180, 83, 9, 0.2)' : 'transparent',
                          color: index === 0 ? 'var(--status-warning)' : index === 1 ? '#9CA3AF' : index === 2 ? '#B45309' : 'var(--text-dim)',
                          fontWeight: 700, fontSize: '0.875rem'
                        }}>
                          {index + 1}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.contestant_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(item.created_at)}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item.topic}</div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="mono-num" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                          {item.total_score}
                        </span>
                        <span className="mono-num" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>/100</span>
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--border-strong)' }}>
                        <ArrowRight size={16} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No submissions found matching "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

import React from 'react';
import { Trophy, Search, Loader2, ArrowRight, RefreshCw, EyeOff, Pencil } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export function Leaderboard({
  leaderboard,
  loading,
  onSelectSubmission,
  onRefresh,
  leaderboardVisible,
  isAdmin,
  whitelistEnabled,
  onToggleWhitelistEnabled,
  whitelistedUserIds,
  onToggleUserWhitelist
}) {
  const [searchTerm, setSearchTerm] = React.useState('');

  // ── Visibility Guard ──────────────────────────────────────────────────────
  if (!leaderboardVisible && !isAdmin) {
    return (
      <div style={{
        textAlign: 'center', padding: '4rem 2rem',
        animation: 'fade-up 0.5s var(--transition-normal) both'
      }}>
        <div style={{
          width: '72px', height: '72px',
          borderRadius: '16px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem auto',
          color: 'var(--text-muted)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <EyeOff size={30} />
        </div>
        <h1 style={{
          fontSize: '2rem', fontWeight: 800,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-display)',
          marginBottom: '0.75rem',
          letterSpacing: '-0.02em'
        }}>
          Leaderboard Hidden
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1.05rem', maxWidth: '420px', margin: '0 auto',
          fontFamily: 'var(--font-sans)',
          lineHeight: '1.6'
        }}>
          The competition organizers have temporarily hidden the leaderboard. Check back later for results.
        </p>
      </div>
    );
  }

  // ── Render Leaderboard ────────────────────────────────────────────────────
  const filtered = leaderboard.filter((item) =>
    (item.contestant_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.topic || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '2.2rem', fontWeight: 800,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display)',
            margin: '0 0 0.5rem 0',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            letterSpacing: '-0.02em'
          }}>
            <Trophy size={28} style={{ color: 'var(--accent-primary)' }} />
            Live Leaderboard
          </h1>
          <div style={{
            color: 'var(--text-secondary)',
            fontSize: '1.05rem', margin: 0,
            fontFamily: 'var(--font-sans)',
          }}>
            Real-time rankings based on AI evaluation scores.
            {isAdmin && !leaderboardVisible && (
              <span className="badge badge-rose" style={{ marginLeft: '0.5rem' }}>
                Hidden from Contestants
              </span>
            )}
            {isAdmin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Login Whitelist:</span>
                <button
                  onClick={() => onToggleWhitelistEnabled(!whitelistEnabled)}
                  className={`btn btn-sm ${whitelistEnabled ? 'btn-primary' : 'btn-ghost'}`}
                  style={{
                    backgroundColor: whitelistEnabled ? 'var(--status-success)' : 'transparent',
                    borderColor: whitelistEnabled ? 'var(--status-success)' : 'var(--border-color)',
                  }}
                >
                  {whitelistEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '250px' }}>
            <Search size={16} style={{
              position: 'absolute', left: '0.85rem', top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} />
            <input
              type="text"
              placeholder="Search contestants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <button
            onClick={onRefresh}
            className="btn btn-ghost"
            style={{ padding: '0.65rem' }}
            title="Refresh Leaderboard"
            disabled={loading}
          >
            <RefreshCw size={18} style={{
              color: 'var(--accent-primary)',
              animation: loading ? 'spin 1s linear infinite' : 'none'
            }} />
          </button>
        </div>
      </div>

      <div className="surface-card" style={{ overflowX: 'auto', overflowY: 'hidden' }}>
        {loading && leaderboard.length === 0 ? (
          <div style={{
            padding: '4rem', textAlign: 'center',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-sans)'
          }}>
            <Loader2 size={36} style={{
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem auto',
              color: 'var(--accent-primary)'
            }} />
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
                  {isAdmin && <th style={{ textAlign: 'center', width: '140px' }}>Whitelist</th>}
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
                          width: '32px', height: '32px',
                          borderRadius: '50%',
                          margin: '0 auto',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          backgroundColor: index < 3
                            ? (index === 0 ? 'var(--status-warning-subtle)' : index === 1 ? 'rgba(156, 163, 175, 0.2)' : 'rgba(180, 83, 9, 0.2)')
                            : 'transparent',
                          border: index < 3 ? '2px solid' : 'none',
                          borderColor: index === 0 ? 'var(--status-warning)' : index === 1 ? '#9CA3AF' : index === 2 ? '#B45309' : 'transparent',
                          fontWeight: 700,
                          fontSize: index < 3 ? '1rem' : '0.95rem',
                          fontFamily: 'var(--font-heading)',
                          color: index === 0 ? 'var(--status-warning)' : index === 1 ? '#9CA3AF' : index === 2 ? '#B45309' : 'var(--text-dim)',
                        }}>
                          {index + 1}
                        </div>
                      </td>
                      <td>
                        <div style={{
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          fontFamily: 'var(--font-heading)',
                          fontSize: '1.05rem'
                        }}>
                          {item.contestant_name}
                        </div>
                        <div style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          fontFamily: 'var(--font-sans)'
                        }}>
                          {formatDate(item.created_at)}
                        </div>
                      </td>
                      <td>
                        <div style={{
                          fontSize: '0.95rem',
                          color: 'var(--text-secondary)',
                          fontFamily: 'var(--font-sans)',
                          fontStyle: 'italic'
                        }}>
                          {item.topic}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="mono-num" style={{
                          fontSize: '1.4rem', fontWeight: 800,
                          color: 'var(--text-primary)',
                          fontFamily: 'var(--font-display)',
                        }}>
                          {item.total_score}
                        </span>
                        <span className="mono-num" style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-dim)',
                          fontFamily: 'var(--font-sans)'
                        }}>/100</span>
                      </td>
                      {isAdmin && (
                        <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onToggleUserWhitelist(item.submitted_by_user_id, !whitelistedUserIds.has(item.submitted_by_user_id))}
                            className={`btn btn-sm ${whitelistedUserIds.has(item.submitted_by_user_id) ? 'btn-ghost' : 'btn-secondary'}`}
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                          >
                            {whitelistedUserIds.has(item.submitted_by_user_id) ? 'Remove' : 'Add'}
                          </button>
                        </td>
                      )}
                      <td style={{ textAlign: 'right', color: 'var(--accent-primary)' }}>
                        <ArrowRight size={16} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{
                      textAlign: 'center', padding: '3rem',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-sans)',
                    }}>
                      No submissions found matching "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

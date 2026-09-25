import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Search, ShieldOff } from 'lucide-react';
import { fetchWhitelistedContestants } from '../services/submissionService';

export function Whitelist({
  whitelistedUserIds,
  onToggleUserWhitelist,
  isAdmin,
  whitelistEnabled,
  onToggleWhitelistEnabled,
}) {
  const [contestants, setContestants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const list = await fetchWhitelistedContestants(import.meta.env.VITE_ORGANIZER_PASSWORD);
      setContestants(list);
    } catch (err) {
      console.error('Failed to fetch whitelisted contestants', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin, whitelistedUserIds]); // reload if the Set changes

  if (!isAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h1 style={{ color: 'var(--text-primary)' }}>Unauthorized</h1>
      </div>
    );
  }

  const filtered = contestants.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
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
            <ShieldCheck size={28} style={{ color: 'var(--accent-primary)' }} />
            Whitelist Management
          </h1>
          <div style={{
            color: 'var(--text-secondary)',
            fontSize: '1.05rem', margin: 0,
            fontFamily: 'var(--font-sans)',
          }}>
            Manage contestants allowed to log in.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
          
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} style={{
              position: 'absolute', left: '0.75rem', top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>
        </div>
      </div>

      <div className="surface-card" style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No whitelisted contestants found.
          </div>
        ) : (
          <table className="ledger-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>College</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <span className="mono-num" style={{ fontSize: '0.85rem' }}>{c.user_id}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.college_name || '—'}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => onToggleUserWhitelist(c.user_id, false)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--status-danger)', fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    >
                      <ShieldOff size={14} style={{ marginRight: '4px' }} />
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

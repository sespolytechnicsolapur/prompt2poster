import React, { useState } from 'react';
import { LeaderboardRow } from './LeaderboardRow';
import { Search } from 'lucide-react';

export function LeaderboardTable({ submissions = [], onSelectSubmission }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = submissions.filter((item) =>
    (item.contestant_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.topic || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!submissions || submissions.length === 0) {
    return (
      <div className="surface-card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          No Submissions Yet
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', maxWidth: '360px', margin: '0 auto' }}>
          When contestants submit their poster designs, scores will be automatically compiled into this live leaderboard.
        </p>
      </div>
    );
  }

  return (
    <div className="surface-card" style={{ overflowX: 'auto', overflowY: 'hidden' }}>
      {/* Table Controls */}
      <div style={{
        padding: '0.85rem 1.25rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Standings
          </h3>
          <span className="badge badge-mono" style={{ fontSize: '0.6875rem' }}>
            {submissions.length} entries
          </span>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '220px' }}>
          <Search size={13} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search contestant or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '1.85rem', paddingTop: '0.35rem', paddingBottom: '0.35rem', fontSize: '0.8125rem' }}
          />
        </div>
      </div>

      {/* Table Ledger */}
      <div style={{ overflowX: 'auto' }}>
        <table className="ledger-table">
          <thead>
            <tr>
              <th style={{ width: '56px' }}>Rank</th>
              <th>Contestant</th>
              <th>Topic</th>
              <th style={{ textAlign: 'right' }}>Score</th>
              <th style={{ width: '36px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((sub, index) => (
                <LeaderboardRow
                  key={sub.id}
                  submission={sub}
                  rank={index + 1}
                  onSelect={onSelectSubmission}
                />
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  No submissions matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

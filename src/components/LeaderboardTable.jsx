import React, { useState } from 'react';
import { LeaderboardRow } from './LeaderboardRow';
import { Search, Trophy, Layers } from 'lucide-react';

export function LeaderboardTable({ submissions = [], onSelectSubmission }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = submissions.filter((item) =>
    item.contestant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!submissions || submissions.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto'
        }}>
          <Trophy size={32} color="var(--accent-primary)" />
        </div>
        <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF', marginBottom: '0.5rem' }}>
          No Submissions Yet
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
          Be the first contestant to submit your poster to the AI evaluation system!
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ overflow: 'hidden' }}>
      {/* Table Header Filter */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Trophy size={20} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF' }}>Live Contestant Rankings</h3>
          <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
            {submissions.length} Contestants
          </span>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search contestant or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.5rem', paddingTop: '0.55rem', paddingBottom: '0.55rem', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Table Structure */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{
              background: 'rgba(15, 23, 42, 0.8)',
              color: 'var(--text-dim)',
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <th style={{ padding: '0.85rem 1.25rem' }}>Rank</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Contestant</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Competition Topic</th>
              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Total Score</th>
              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, index) => (
              <LeaderboardRow
                key={item.id}
                submission={item}
                rank={index + 1}
                onSelect={onSelectSubmission}
              />
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .leaderboard-row-hover:hover {
          background: rgba(99, 102, 241, 0.08) !important;
        }
      `}</style>
    </div>
  );
}

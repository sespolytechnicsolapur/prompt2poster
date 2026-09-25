import React, { useState } from 'react';
import { Search, Eye, EyeOff, Trash2, Edit3, ChevronRight } from 'lucide-react';
import { formatDate } from '../utils/formatters';

/**
 * Admin-only submission table showing all entries (including hidden ones).
 * Provides per-row actions: edit scores, hide/unhide, delete.
 */
export function AdminSubmissionTable({
  submissions = [],
  onEditScores,
  onToggleVisibility,
  onDelete,
  onViewDetails,
  whitelistedUserIds,
  onToggleUserWhitelist
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = submissions.filter((item) =>
    (item.contestant_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.topic || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.college_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (submissions.length === 0) {
    return (
      <div className="surface-card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          No Submissions
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', maxWidth: '360px', margin: '0 auto' }}>
          Submissions will appear here as contestants submit their poster designs.
        </p>
      </div>
    );
  }

  return (
    <div className="surface-card" style={{ overflowX: 'auto', overflowY: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '0.85rem 1.25rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            All Submissions
          </h3>
          <span className="badge badge-mono" style={{ fontSize: '0.6875rem' }}>
            {submissions.length} total
          </span>
          {submissions.filter(s => s.is_hidden).length > 0 && (
            <span className="badge badge-mono" style={{ fontSize: '0.6875rem', color: 'var(--status-warning)' }}>
              {submissions.filter(s => s.is_hidden).length} hidden
            </span>
          )}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '220px' }}>
          <Search size={13} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search contestant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '1.85rem', paddingTop: '0.35rem', paddingBottom: '0.35rem', fontSize: '0.8125rem' }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="ledger-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
              <th>Contestant</th>
              <th>College</th>
              <th style={{ textAlign: 'right' }}>Score</th>
              <th style={{ width: '60px', textAlign: 'center' }}>Status</th>
              <th style={{ width: '80px', textAlign: 'center' }}>Whitelist</th>
              <th style={{ width: '160px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((sub, index) => (
                <tr
                  key={sub.id}
                  style={{ opacity: sub.is_hidden ? 0.5 : 1 }}
                >
                  {/* Row Number */}
                  <td>
                    <span className="mono-num" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                  </td>

                  {/* Contestant */}
                  <td>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                        {sub.contestant_name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {formatDate(sub.created_at)}
                      </div>
                    </div>
                  </td>

                  {/* College */}
                  <td>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {sub.college_name || '—'}
                    </div>
                  </td>

                  {/* Score */}
                  <td style={{ textAlign: 'right' }}>
                    <span className="mono-num" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {sub.total_score}
                    </span>
                    <span className="mono-num" style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>/100</span>
                    {sub.score_edit_log && sub.score_edit_log.length > 0 && (
                      <span style={{
                        display: 'inline-block', marginLeft: '0.4rem',
                        fontSize: '0.625rem', color: 'var(--status-warning)',
                        fontWeight: 600
                      }}>
                        (edited)
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge badge-mono ${sub.is_hidden ? '' : 'badge-success'}`}
                      style={{ fontSize: '0.625rem' }}>
                      {sub.is_hidden ? 'Hidden' : 'Visible'}
                    </span>
                  </td>

                  {/* Whitelist */}
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleUserWhitelist(sub.submitted_by_user_id, !whitelistedUserIds.has(sub.submitted_by_user_id));
                      }}
                      className={`btn btn-sm ${whitelistedUserIds?.has(sub.submitted_by_user_id) ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem', height: '24px' }}
                      title={whitelistedUserIds?.has(sub.submitted_by_user_id) ? 'Remove from whitelist' : 'Add to whitelist'}
                    >
                      {whitelistedUserIds?.has(sub.submitted_by_user_id) ? 'ON' : 'OFF'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                      {/* Edit Scores */}
                      <button
                        onClick={(e) => { e.stopPropagation(); onEditScores(sub); }}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0.2rem 0.4rem', height: '26px' }}
                        title="Edit scores"
                      >
                        <Edit3 size={13} />
                      </button>

                      {/* Toggle Visibility */}
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleVisibility(sub.id, !sub.is_hidden); }}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0.2rem 0.4rem', height: '26px' }}
                        title={sub.is_hidden ? 'Unhide from leaderboard' : 'Hide from leaderboard'}
                      >
                        {sub.is_hidden ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(sub); }}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0.2rem 0.4rem', height: '26px', color: 'var(--status-danger)' }}
                        title="Delete submission"
                      >
                        <Trash2 size={13} />
                      </button>

                      {/* View Details */}
                      <button
                        onClick={(e) => { e.stopPropagation(); onViewDetails(sub.id); }}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0.2rem 0.4rem', height: '26px' }}
                        title="View details"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
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

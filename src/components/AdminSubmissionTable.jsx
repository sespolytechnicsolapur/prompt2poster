import React, { useState } from 'react';
import { Search, Eye, EyeOff, Trash2, Edit3, ChevronRight } from 'lucide-react';
import { formatDate } from '../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

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
      <div className="surface-card p-12 text-center shadow-sketchy">
        <h3 className="text-xl font-bold text-primary font-heading mb-2">
          No Submissions
        </h3>
        <p className="text-secondary font-sans text-sm max-w-sm mx-auto">
          Submissions will appear here as contestants submit their poster designs.
        </p>
      </div>
    );
  }

  return (
    <div className="surface-card overflow-hidden shadow-sketchy">
      {/* Header */}
      <div className="p-5 border-b-2 border-dashed border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-subtle">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-primary font-heading m-0">
            All Submissions
          </h3>
          <span className="badge badge-mono shadow-sm">
            {submissions.length} total
          </span>
          {submissions.filter(s => s.is_hidden).length > 0 && (
            <span className="badge badge-mono bg-warning-subtle text-warning border-warning shadow-sm">
              {submissions.filter(s => s.is_hidden).length} hidden
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search contestant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-9 py-2 text-sm w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="ledger-table w-full">
          <thead>
            <tr>
              <th className="w-12 text-center font-heading text-xs text-secondary">#</th>
              <th className="font-heading text-xs text-secondary text-left">Contestant</th>
              <th className="font-heading text-xs text-secondary text-left">College</th>
              <th className="text-right font-heading text-xs text-secondary">Score</th>
              <th className="w-20 text-center font-heading text-xs text-secondary">Status</th>
              <th className="w-24 text-center font-heading text-xs text-secondary">Whitelist</th>
              <th className="w-40 text-right font-heading text-xs text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filtered.length > 0 ? (
                filtered.map((sub, index) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: sub.is_hidden ? 0.5 : 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    key={sub.id}
                    className="group hover:bg-surface-hover transition-colors"
                  >
                    {/* Row Number */}
                    <td className="text-center align-middle">
                      <span className="mono-num text-sm text-dim">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                    </td>

                    {/* Contestant */}
                    <td className="align-middle">
                      <div>
                        <div className="font-bold text-primary text-sm font-sans">
                          {sub.contestant_name}
                        </div>
                        <div className="text-xs text-muted font-sans mt-0.5">
                          {formatDate(sub.created_at)}
                        </div>
                      </div>
                    </td>

                    {/* College */}
                    <td className="align-middle">
                      <div className="text-sm text-secondary font-sans truncate max-w-[150px]">
                        {sub.college_name || '—'}
                      </div>
                    </td>

                    {/* Score */}
                    <td className="text-right align-middle">
                      <span className="mono-num text-lg font-bold text-primary mr-0.5">
                        {sub.total_score}
                      </span>
                      <span className="mono-num text-xs text-dim">/100</span>
                      {sub.score_edit_log && sub.score_edit_log.length > 0 && (
                        <span className="inline-block ml-2 text-[10px] text-warning font-bold uppercase tracking-wider font-sans">
                          (edited)
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="text-center align-middle">
                      <span className={cn(
                        "badge badge-mono text-[10px] uppercase tracking-wider py-1",
                        sub.is_hidden ? 'opacity-70' : 'bg-success-subtle text-success border-success'
                      )}>
                        {sub.is_hidden ? 'Hidden' : 'Visible'}
                      </span>
                    </td>

                    {/* Whitelist */}
                    <td className="text-center align-middle">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleUserWhitelist(sub.submitted_by_user_id, !whitelistedUserIds.has(sub.submitted_by_user_id));
                        }}
                        className={cn(
                          "btn btn-sm text-xs px-2 py-1 font-bold",
                          whitelistedUserIds?.has(sub.submitted_by_user_id) ? 'btn-ghost text-success hover:bg-success-subtle' : 'btn-secondary'
                        )}
                        title={whitelistedUserIds?.has(sub.submitted_by_user_id) ? 'Remove from whitelist' : 'Add to whitelist'}
                      >
                        {whitelistedUserIds?.has(sub.submitted_by_user_id) ? 'ON' : 'OFF'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="text-right align-middle">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); onEditScores(sub); }}
                          className="p-1.5 text-muted hover:text-accent hover:bg-accent-subtle rounded-md transition-colors"
                          title="Edit scores"
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleVisibility(sub.id, !sub.is_hidden); }}
                          className="p-1.5 text-muted hover:text-accent hover:bg-accent-subtle rounded-md transition-colors"
                          title={sub.is_hidden ? 'Unhide from leaderboard' : 'Hide from leaderboard'}
                        >
                          {sub.is_hidden ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete(sub); }}
                          className="p-1.5 text-muted hover:text-danger hover:bg-danger-subtle rounded-md transition-colors"
                          title="Delete submission"
                        >
                          <Trash2 size={16} />
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); onViewDetails(sub.id); }}
                          className="p-1.5 text-muted hover:text-primary hover:bg-surface-hover rounded-md transition-colors ml-1 border border-transparent hover:border-border"
                          title="View details"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted font-sans text-sm">
                    No submissions matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}

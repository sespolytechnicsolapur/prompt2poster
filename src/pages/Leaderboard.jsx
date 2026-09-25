import React, { useState } from 'react';
import { Trophy, Search, Loader2, ArrowRight, RefreshCw, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '../utils/formatters';
import { cn } from '../lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

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
  const [searchTerm, setSearchTerm] = useState('');

  // ── Visibility Guard ──────────────────────────────────────────────────────
  if (!leaderboardVisible && !isAdmin) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center py-16 px-8"
      >
        <div className="w-20 h-20 rounded-2xl bg-surface border border-border flex items-center justify-center mx-auto mb-6 text-muted shadow-sm shadow-sketchy transform -rotate-2">
          <EyeOff size={32} />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary font-display mb-3 tracking-tight">
          Leaderboard Hidden
        </h1>
        <p className="text-secondary text-lg max-w-md mx-auto font-sans leading-relaxed">
          The competition organizers have temporarily hidden the leaderboard. Check back later for results.
        </p>
      </motion.div>
    );
  }

  // ── Render Leaderboard ────────────────────────────────────────────────────
  const filtered = leaderboard.filter((item) =>
    (item.contestant_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.topic || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col gap-8"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary font-display mb-2 flex items-center gap-3 tracking-tight">
            <Trophy size={32} className="text-accent" />
            Live Leaderboard
          </h1>
          <div className="text-secondary text-lg font-sans flex flex-wrap items-center gap-2">
            Real-time rankings based on AI evaluation scores.
            {isAdmin && !leaderboardVisible && (
              <span className="badge badge-rose ml-2 text-sm font-semibold">
                Hidden from Contestants
              </span>
            )}
          </div>
          {isAdmin && (
            <div className="flex items-center gap-3 mt-4">
              <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Login Whitelist:</span>
              <button
                onClick={() => onToggleWhitelistEnabled(!whitelistEnabled)}
                className={cn("btn btn-sm transition-colors", whitelistEnabled ? 'btn-primary bg-success border-success' : 'btn-ghost')}
              >
                {whitelistEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3 items-center w-full md:w-auto mt-4 md:mt-0">
          <div className="relative w-full md:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search contestants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10 w-full"
            />
          </div>
          <button
            onClick={onRefresh}
            className="btn btn-ghost p-3 shrink-0"
            title="Refresh Leaderboard"
            disabled={loading}
          >
            <RefreshCw size={20} className={cn("text-accent", loading && "animate-spin")} />
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="surface-card overflow-x-auto overflow-y-hidden shadow-sketchy">
        {loading && leaderboard.length === 0 ? (
          <div className="py-24 text-center text-muted font-sans flex flex-col items-center">
            <Loader2 size={40} className="animate-spin mb-4 text-accent" />
            <p className="text-lg font-medium">Loading rankings...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="ledger-table w-full">
              <thead>
                <tr>
                  <th className="w-16 text-center font-heading text-sm text-secondary">Rank</th>
                  <th className="font-heading text-sm text-secondary text-left">Contestant</th>
                  <th className="font-heading text-sm text-secondary text-left">Topic</th>
                  <th className="text-right font-heading text-sm text-secondary">Score</th>
                  {isAdmin && <th className="text-center w-36 font-heading text-sm text-secondary">Whitelist</th>}
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.length > 0 ? (
                    filtered.map((item, index) => {
                      const isFirst = index === 0;
                      const isSecond = index === 1;
                      const isThird = index === 2;
                      const isTop3 = index < 3;
                      
                      const rankClasses = isFirst ? 'bg-warning-subtle border-warning text-warning' 
                                        : isSecond ? 'bg-gray-400/20 border-gray-400 text-gray-500' 
                                        : isThird ? 'bg-amber-700/20 border-amber-700 text-amber-700'
                                        : 'bg-transparent border-transparent text-dim';

                      return (
                        <motion.tr
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          key={item.id}
                          onClick={() => onSelectSubmission(item.id, item)}
                          className="cursor-pointer group hover:bg-surface-hover transition-colors"
                        >
                          <td className="text-center align-middle">
                            <div className={cn(
                              "w-9 h-9 rounded-full mx-auto flex items-center justify-center font-heading font-bold transition-transform group-hover:scale-110",
                              isTop3 ? "border-2 text-base" : "text-sm",
                              rankClasses
                            )}>
                              {index + 1}
                            </div>
                          </td>
                          <td className="align-middle">
                            <div className="font-bold text-primary font-heading text-lg mb-0.5 group-hover:text-accent transition-colors">
                              {item.contestant_name}
                            </div>
                            <div className="text-xs text-muted font-sans font-medium uppercase tracking-wider">
                              {formatDate(item.created_at)}
                            </div>
                          </td>
                          <td className="align-middle">
                            <div className="text-sm text-secondary font-sans italic line-clamp-1 max-w-[200px] md:max-w-xs">
                              {item.topic}
                            </div>
                          </td>
                          <td className="text-right align-middle">
                            <span className="mono-num text-2xl font-extrabold text-primary font-display mr-1">
                              {item.total_score}
                            </span>
                            <span className="mono-num text-xs text-dim font-sans font-bold">/100</span>
                          </td>
                          {isAdmin && (
                            <td className="text-center align-middle" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => onToggleUserWhitelist(item.submitted_by_user_id, !whitelistedUserIds.has(item.submitted_by_user_id))}
                                className={cn(
                                  "btn btn-sm text-xs px-3 py-1.5 transition-all",
                                  whitelistedUserIds.has(item.submitted_by_user_id) ? 'btn-ghost text-success hover:bg-success-subtle' : 'btn-secondary'
                                )}
                              >
                                {whitelistedUserIds.has(item.submitted_by_user_id) ? 'Remove' : 'Add'}
                              </button>
                            </td>
                          )}
                          <td className="text-right align-middle text-accent opacity-50 group-hover:opacity-100 transition-opacity pr-6">
                            <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={isAdmin ? 6 : 5} className="text-center py-16 text-muted font-sans text-lg border-b-0">
                        No submissions found matching "{searchTerm}"
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

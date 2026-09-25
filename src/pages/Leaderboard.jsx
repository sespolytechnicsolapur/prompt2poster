import React, { useState, useMemo } from 'react';
import { Trophy, Search, Loader2, ArrowRight, RefreshCw, EyeOff, Target, Flag, AlertCircle } from 'lucide-react';
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
  onToggleUserWhitelist,
  roundSettings,
  onToggleQualificationOverride
}) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Tabs State
  const [activeMainTab, setActiveMainTab] = useState(1); // 1 or 2
  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all', 'qualified', 'not_qualified'

  // Settings from DB (fallback to defaults if undefined)
  const currentRoundSetting = roundSettings?.current_round || 1;
  const cutoffScore = roundSettings?.qualification_cutoff || 60;
  const showQualification = roundSettings?.show_qualification || false;
  const showRound2 = roundSettings?.show_round_2 || false;

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

  // ── Data Processing ────────────────────────────────────────────────────────
  const processedLeaderboard = useMemo(() => {
    // Basic search filtering
    const searchFiltered = leaderboard.filter((item) =>
      (item.contestant_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.topic || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter by Active Main Tab (Round 1 vs Round 2)
    const roundFiltered = searchFiltered.filter((item) => {
      const itemRound = item.round_number || 1;
      return itemRound === activeMainTab;
    });

    // Filter by Active Sub Tab (if on Round 1 and qualification is visible)
    if (activeMainTab === 1 && (showQualification || isAdmin)) {
      if (activeSubTab === 'qualified') {
        return roundFiltered.filter(item => {
          if (item.qualification_override === 'qualified') return true;
          if (item.qualification_override === 'disqualified') return false;
          return item.total_score >= cutoffScore;
        });
      } else if (activeSubTab === 'not_qualified') {
        return roundFiltered.filter(item => {
          if (item.qualification_override === 'disqualified') return true;
          if (item.qualification_override === 'qualified') return false;
          return item.total_score < cutoffScore;
        });
      }
    }

    return roundFiltered;
  }, [leaderboard, searchTerm, activeMainTab, activeSubTab, cutoffScore, showQualification]);

  // Handle tab switching logic
  const handleMainTabSwitch = (tab) => {
    setActiveMainTab(tab);
    if (tab !== 1) {
      setActiveSubTab('all'); // Reset sub-tab if leaving round 1
    }
  };

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

      {/* ── Round Tabs ── */}
      {(showRound2 || isAdmin) && (
        <motion.div variants={itemVariants} className="flex flex-wrap gap-3 border-b-2 border-border pb-1">
          <button
            onClick={() => handleMainTabSwitch(1)}
            className={cn(
              "px-6 py-2.5 rounded-t-sketchy font-heading font-bold text-lg flex items-center gap-2 transition-all border-2 border-b-0",
              activeMainTab === 1 
                ? "bg-surface text-primary border-border" 
                : "bg-surface-subtle text-muted border-transparent hover:text-primary hover:bg-surface-hover"
            )}
            style={{ marginBottom: activeMainTab === 1 ? '-2px' : '0' }}
          >
            <Flag size={18} className={activeMainTab === 1 ? 'text-accent' : ''} />
            <span>Round 1</span>
          </button>
          
          <button
            onClick={() => handleMainTabSwitch(2)}
            className={cn(
              "px-6 py-2.5 rounded-t-sketchy font-heading font-bold text-lg flex items-center gap-2 transition-all border-2 border-b-0",
              activeMainTab === 2 
                ? "bg-surface text-primary border-border" 
                : "bg-surface-subtle text-muted border-transparent hover:text-primary hover:bg-surface-hover"
            )}
            style={{ marginBottom: activeMainTab === 2 ? '-2px' : '0' }}
          >
            <Trophy size={18} className={activeMainTab === 2 ? 'text-accent' : ''} />
            <span>Round 2</span>
            {isAdmin && !showRound2 && (
              <EyeOff size={14} className="text-danger ml-1" title="Hidden from public" />
            )}
          </button>
        </motion.div>
      )}

      {/* ── Qualification Sub-Tabs (Only Round 1) ── */}
      {activeMainTab === 1 && (showQualification || isAdmin) && (
        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2 -mt-4">
          <span className="text-sm font-bold text-secondary mr-2">Filter:</span>
          
          <button
            onClick={() => setActiveSubTab('all')}
            className={cn("badge px-4 py-1.5 cursor-pointer hover:scale-105 transition-transform", activeSubTab === 'all' ? 'bg-primary text-inverse border-primary' : 'badge-mono')}
          >
            All Submissions
          </button>
          
          <button
            onClick={() => setActiveSubTab('qualified')}
            className={cn("badge px-4 py-1.5 cursor-pointer hover:scale-105 transition-transform flex items-center gap-1.5", activeSubTab === 'qualified' ? 'bg-success text-white border-success' : 'badge-mono')}
          >
            <Target size={14} />
            <span>Qualified (≥{cutoffScore})</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab('not_qualified')}
            className={cn("badge px-4 py-1.5 cursor-pointer hover:scale-105 transition-transform flex items-center gap-1.5", activeSubTab === 'not_qualified' ? 'bg-danger text-white border-danger' : 'badge-mono')}
          >
            <AlertCircle size={14} />
            <span>Not Qualified</span>
          </button>
          
          {isAdmin && !showQualification && (
            <span className="text-xs text-danger font-bold italic ml-2 flex items-center gap-1">
              <EyeOff size={12} /> Hidden from public
            </span>
          )}
        </motion.div>
      )}

      {/* ── Table ── */}
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
                  
                  {/* Qualification Column (Only in Round 1 if visible) */}
                  {activeMainTab === 1 && (showQualification || isAdmin) && (
                    <th className="text-center font-heading text-sm text-secondary">Status</th>
                  )}
                  
                  {isAdmin && <th className="text-center w-36 font-heading text-sm text-secondary">Whitelist</th>}
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {processedLeaderboard.length > 0 ? (
                    processedLeaderboard.map((item, index) => {
                      const isFirst = index === 0;
                      const isSecond = index === 1;
                      const isThird = index === 2;
                      const isTop3 = index < 3;
                      
                      const rankClasses = isFirst ? 'bg-warning-subtle border-warning text-warning' 
                                        : isSecond ? 'bg-gray-400/20 border-gray-400 text-gray-500' 
                                        : isThird ? 'bg-amber-700/20 border-amber-700 text-amber-700'
                                        : 'bg-transparent border-transparent text-dim';

                      let isQualified = item.total_score >= cutoffScore;
                      if (item.qualification_override === 'qualified') isQualified = true;
                      if (item.qualification_override === 'disqualified') isQualified = false;

                      let rowClasses = "cursor-pointer group transition-all duration-300 ";
                      if (activeMainTab === 1 && (showQualification || isAdmin)) {
                        if (isQualified) {
                          rowClasses += "bg-success-subtle/30 hover:bg-success-subtle/60";
                        } else {
                          rowClasses += "bg-danger-subtle/20 hover:bg-danger-subtle/40 opacity-90";
                        }
                      } else {
                        rowClasses += "hover:bg-surface-hover";
                      }

                      return (
                        <motion.tr
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          key={item.id}
                          onClick={() => onSelectSubmission(item.id, item)}
                          className={rowClasses}
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
                            <div className="text-xs text-muted font-sans font-medium uppercase tracking-wider flex items-center gap-2">
                              <span>{formatDate(item.created_at)}</span>
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
                          
                          {/* Qualification Status */}
                          {activeMainTab === 1 && (showQualification || isAdmin) && (
                            <td className="text-center align-middle" onClick={(e) => {
                              if (isAdmin) e.stopPropagation();
                            }}>
                              <div className="flex flex-col items-center gap-1">
                                <span className={cn(
                                  "badge px-2 py-1 text-xs",
                                  isQualified ? "bg-success-subtle text-success border-success" : "bg-danger-subtle text-danger border-danger",
                                  item.qualification_override !== 'auto' && "border-dashed"
                                )}>
                                  {isQualified ? 'Qualified' : 'Not Qualified'}
                                </span>
                                {isAdmin && (
                                  <div className="flex gap-1 mt-1">
                                    <button 
                                      onClick={() => onToggleQualificationOverride(item.id, item.qualification_override === 'qualified' ? 'auto' : 'qualified')}
                                      className={cn("text-[10px] px-1.5 py-0.5 rounded border transition-colors", item.qualification_override === 'qualified' ? "bg-success text-white border-success" : "bg-surface text-secondary border-border hover:bg-surface-hover")}
                                      title="Force Qualify"
                                    >
                                      ✓
                                    </button>
                                    <button 
                                      onClick={() => onToggleQualificationOverride(item.id, item.qualification_override === 'disqualified' ? 'auto' : 'disqualified')}
                                      className={cn("text-[10px] px-1.5 py-0.5 rounded border transition-colors", item.qualification_override === 'disqualified' ? "bg-danger text-white border-danger" : "bg-surface text-secondary border-border hover:bg-surface-hover")}
                                      title="Force Disqualify"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          )}

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
                      <td colSpan={isAdmin ? (activeMainTab === 1 && (showQualification || isAdmin) ? 7 : 6) : (activeMainTab === 1 && showQualification ? 6 : 5)} className="text-center py-16 text-muted font-sans text-lg border-b-0">
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

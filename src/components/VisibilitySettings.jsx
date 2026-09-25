import React, { useState } from 'react';
import { Eye, EyeOff, Trophy, FileText, Target, Settings2, ShieldCheck, Flag } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export function VisibilitySettings({
  leaderboardVisible,
  topicVisible,
  onToggleLeaderboard,
  onToggleTopic,
  roundSettings,
  onSaveRoundSettings,
  isUpdating
}) {
  const [localCutoff, setLocalCutoff] = useState(roundSettings?.qualification_cutoff || 60);

  const handleCutoffChange = (e) => {
    setLocalCutoff(Number(e.target.value));
  };

  const saveCutoff = () => {
    if (onSaveRoundSettings) {
      onSaveRoundSettings({ ...roundSettings, qualification_cutoff: localCutoff });
    }
  };

  const toggleRound = (roundNum) => {
    if (onSaveRoundSettings) {
      onSaveRoundSettings({ ...roundSettings, current_round: roundNum });
    }
  };

  const toggleShowQualification = () => {
    if (onSaveRoundSettings) {
      onSaveRoundSettings({ ...roundSettings, show_qualification: !roundSettings?.show_qualification });
    }
  };

  const toggleShowRound2 = () => {
    if (onSaveRoundSettings) {
      onSaveRoundSettings({ ...roundSettings, show_round_2: !roundSettings?.show_round_2 });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Competition Rounds & Qualification ── */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="surface-card p-6 flex flex-col gap-5 border-2 border-accent shadow-sm"
      >
        <div className="flex items-center gap-3 border-b-2 border-dashed border-border pb-3">
          <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent flex items-center justify-center transform -rotate-3">
            <Target size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-primary font-heading m-0">
              Rounds & Qualification
            </h3>
            <p className="text-sm text-secondary font-sans m-0">
              Manage competition stages and qualification thresholds.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Round Control */}
          <div className="bg-surface-subtle p-4 rounded-sketchy border border-border flex flex-col gap-3">
            <div className="flex items-center gap-2 text-primary font-bold font-sans">
              <Flag size={16} className="text-accent" />
              <span>Current Active Round</span>
            </div>
            <p className="text-xs text-secondary leading-relaxed">
              New submissions will automatically be assigned to the active round.
            </p>
            <div className="flex gap-2 mt-auto">
              <button
                onClick={() => toggleRound(1)}
                className={cn("btn flex-1 py-2 font-bold", roundSettings?.current_round === 1 ? 'btn-primary' : 'btn-secondary')}
              >
                Round 1
              </button>
              <button
                onClick={() => toggleRound(2)}
                className={cn("btn flex-1 py-2 font-bold", roundSettings?.current_round === 2 ? 'btn-primary' : 'btn-secondary')}
              >
                Round 2
              </button>
            </div>
          </div>

          {/* Qualification Cutoff Control */}
          <div className="bg-surface-subtle p-4 rounded-sketchy border border-border flex flex-col gap-3">
            <div className="flex items-center gap-2 text-primary font-bold font-sans">
              <Settings2 size={16} className="text-accent" />
              <span>Qualification Cutoff Score</span>
            </div>
            <p className="text-xs text-secondary leading-relaxed">
              Minimum Round 1 score required to qualify for Round 2.
            </p>
            <div className="flex items-center gap-3 mt-auto">
              <input
                type="range"
                min="0"
                max="100"
                value={localCutoff}
                onChange={handleCutoffChange}
                onMouseUp={saveCutoff}
                onTouchEnd={saveCutoff}
                className="flex-1 accent-accent"
              />
              <div className="bg-surface-hover border-2 border-border font-mono font-bold text-primary px-3 py-1 rounded-sketchy w-16 text-center shadow-inner">
                {localCutoff}
              </div>
            </div>
          </div>
        </div>

        {/* Public Visibility Toggles for Rounds */}
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex items-center justify-between bg-surface-subtle p-3 rounded-sketchy border border-border hover:border-border-strong transition-colors">
            <div className="flex flex-col">
              <span className="font-bold text-primary font-sans">Show Qualification Status</span>
              <span className="text-xs text-secondary">Displays 'Qualified' / 'Not Qualified' tabs on Round 1 leaderboard.</span>
            </div>
            <button
              onClick={toggleShowQualification}
              className={cn("btn px-4 py-1.5 font-bold flex items-center gap-2 shrink-0 border-2", roundSettings?.show_qualification ? 'btn-secondary' : 'btn-primary')}
            >
              {roundSettings?.show_qualification ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>{roundSettings?.show_qualification ? 'Hide' : 'Show'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between bg-surface-subtle p-3 rounded-sketchy border border-border hover:border-border-strong transition-colors">
            <div className="flex flex-col">
              <span className="font-bold text-primary font-sans">Show Round 2 Leaderboard</span>
              <span className="text-xs text-secondary">Reveals the Round 2 tab on the public leaderboard.</span>
            </div>
            <button
              onClick={toggleShowRound2}
              className={cn("btn px-4 py-1.5 font-bold flex items-center gap-2 shrink-0 border-2", roundSettings?.show_round_2 ? 'btn-secondary' : 'btn-primary')}
            >
              {roundSettings?.show_round_2 ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>{roundSettings?.show_round_2 ? 'Hide' : 'Show'}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Basic Visibility (Leaderboard & Topic) ── */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="surface-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 border border-border shadow-sm"
      >
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transform -rotate-3 transition-colors",
            leaderboardVisible ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"
          )}>
            <Trophy size={20} />
          </div>
          <div>
            <div className="text-base font-bold text-primary font-heading mb-1">
              Leaderboard Visibility
            </div>
            <div className="text-sm text-secondary font-sans leading-relaxed">
              {leaderboardVisible
                ? 'Contestants can see the live leaderboard and rankings.'
                : 'Leaderboard is hidden from all contestants. Only admins can view it.'}
            </div>
          </div>
        </div>

        <button
          onClick={() => onToggleLeaderboard(!leaderboardVisible)}
          className={cn(
            "btn px-5 py-2 font-bold flex items-center gap-2 shrink-0 border-2",
            leaderboardVisible ? 'btn-secondary' : 'btn-primary'
          )}
          disabled={isUpdating}
        >
          {leaderboardVisible ? <EyeOff size={16} /> : <Eye size={16} />}
          <span>{leaderboardVisible ? 'Hide Leaderboard' : 'Show Leaderboard'}</span>
        </button>
      </motion.div>

      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="surface-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 border border-border shadow-sm"
      >
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transform rotate-3 transition-colors",
            topicVisible ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"
          )}>
            <FileText size={20} />
          </div>
          <div>
            <div className="text-base font-bold text-primary font-heading mb-1">
              Topic Visibility
            </div>
            <div className="text-sm text-secondary font-sans leading-relaxed">
              {topicVisible
                ? 'Contestants can see the competition topic.'
                : 'Topic is hidden. Contestants see a "Topic will be revealed shortly" message.'}
            </div>
          </div>
        </div>

        <button
          onClick={() => onToggleTopic(!topicVisible)}
          className={cn(
            "btn px-5 py-2 font-bold flex items-center gap-2 shrink-0 border-2",
            topicVisible ? 'btn-secondary' : 'btn-primary'
          )}
          disabled={isUpdating}
        >
          {topicVisible ? <EyeOff size={16} /> : <Eye size={16} />}
          <span>{topicVisible ? 'Hide Topic' : 'Reveal Topic'}</span>
        </button>
      </motion.div>

      {/* Status Summary */}
      <div className="flex flex-wrap gap-2 text-xs text-dim font-bold font-sans">
        <span className={cn("badge badge-mono px-3 py-1", leaderboardVisible && 'bg-success-subtle text-success border-success')}>
          Leaderboard: {leaderboardVisible ? 'VISIBLE' : 'HIDDEN'}
        </span>
        <span className={cn("badge badge-mono px-3 py-1", topicVisible && 'bg-success-subtle text-success border-success')}>
          Topic: {topicVisible ? 'VISIBLE' : 'HIDDEN'}
        </span>
        <span className={cn("badge badge-mono px-3 py-1 bg-accent-subtle text-accent border-accent")}>
          Round: {roundSettings?.current_round || 1}
        </span>
      </div>
    </div>
  );
}

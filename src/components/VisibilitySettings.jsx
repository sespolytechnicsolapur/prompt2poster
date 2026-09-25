import React from 'react';
import { Eye, EyeOff, Trophy, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export function VisibilitySettings({
  leaderboardVisible,
  topicVisible,
  onToggleLeaderboard,
  onToggleTopic,
  isUpdating
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Leaderboard Visibility */}
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

      {/* Topic Visibility */}
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
      </div>
    </div>
  );
}

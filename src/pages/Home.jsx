import React from 'react';
import { ArrowRight, TrendingUp, Trophy, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { TopicBanner } from '../components/TopicBanner';
import { cn } from '../lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export function Home({
  activeTopic,
  leaderboard,
  onNavigate,
  onSelectSubmission,
  leaderboardVisible,
  topicVisible,
  isAdmin
}) {
  const topSubmissions = leaderboard.slice(0, 3);
  const showTop3 = leaderboardVisible || isAdmin;

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col gap-10"
    >
      {/* ── Hero Section ── */}
      <motion.section variants={itemVariants} className="text-center my-16 flex flex-col items-center relative">
        <div className="w-14 h-14 rounded-2xl bg-primary text-inverse flex items-center justify-center mx-auto mb-6 shadow-md shadow-sketchy transform -rotate-3 hover:rotate-3 transition-transform duration-300">
          <Sparkles size={28} />
        </div>

        <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-extrabold text-primary font-display tracking-tight leading-[1.1] mb-5 max-w-[900px] relative">
          AI-Powered Evaluation for{' '}
          <span className="text-primary relative inline-block">
            Visual Design
            <span className="absolute -bottom-1 left-0 w-full h-1 bg-underline-color rounded-full -rotate-1"></span>
          </span>{' '}
          Competitions
        </h1>

        <p className="text-secondary text-lg max-w-[650px] mx-auto mb-10 leading-relaxed font-sans">
          Submit your AI-generated poster and receive instant, objective scoring across 7 critical design criteria from our multimodal AI judge.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('submit')}
            className="btn btn-accent px-8 py-3 text-lg rounded-full"
          >
            Submit Poster <ArrowRight size={18} />
          </motion.button>
          {showTop3 && (
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('leaderboard')}
              className="btn btn-secondary px-8 py-3 text-lg rounded-full"
            >
              View Leaderboard
            </motion.button>
          )}
        </div>
      </motion.section>

      {/* Current Topic Banner */}
      <motion.div variants={itemVariants}>
        <TopicBanner
          topicTitle={activeTopic?.topic_title}
          description={activeTopic?.description}
          topicVisible={topicVisible}
          isAdmin={isAdmin}
        />
      </motion.div>

      {/* ── Top 3 Leaderboard Snapshot ── */}
      {showTop3 && (
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-extrabold text-primary font-display flex items-center gap-2 tracking-tight">
              <Trophy size={22} className="text-primary" />
              Current Top 3
            </h2>
            <button
              onClick={() => onNavigate('leaderboard')}
              className="btn btn-ghost btn-sm text-accent font-sans flex items-center gap-1"
            >
              See all <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topSubmissions.length > 0 ? (
              topSubmissions.map((sub, index) => {
                const rankColors = [
                  'bg-warning border-warning',
                  'bg-gray-400 border-gray-400',
                  'bg-amber-700 border-amber-700'
                ];
                const rankColor = rankColors[index] || 'bg-gray-300 border-gray-300';

                return (
                  <motion.div
                    key={sub.id}
                    variants={itemVariants}
                    whileHover={{ y: -4, scale: 1.02 }}
                    onClick={() => onSelectSubmission(sub.id, sub)}
                    className="surface-card p-5 cursor-pointer relative overflow-hidden group flex flex-col justify-between"
                  >
                    {/* Decorative left accent stripe */}
                    <div className={cn("absolute top-0 left-0 bottom-0 w-1.5 rounded-r-sm", rankColor.split(' ')[0])} />

                    <div className="pl-3 flex flex-col gap-3 h-full">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-primary font-heading mb-1 group-hover:text-accent transition-colors">
                            {sub.contestant_name}
                          </h3>
                          <div className="text-sm text-muted flex items-center gap-1 font-sans">
                            Rank #{index + 1}
                          </div>
                        </div>
                        <div className="mono-num text-2xl font-extrabold text-primary font-display">
                          {sub.total_score}
                        </div>
                      </div>
                      
                      {sub.overall_evaluation && (
                        <p className="text-sm text-secondary italic font-sans line-clamp-2 mt-auto">
                          "{sub.overall_evaluation}"
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div 
                variants={itemVariants}
                className="surface-card p-12 text-center col-span-full border-dashed border-2 flex flex-col items-center"
              >
                <TrendingUp size={36} className="text-border-strong mb-4 opacity-50" />
                <h3 className="text-xl font-extrabold text-primary font-display mb-2">
                  Leaderboard is empty
                </h3>
                <p className="text-secondary font-sans">
                  Be the first to submit a poster and claim the top spot!
                </p>
              </motion.div>
            )}
          </div>
        </motion.section>
      )}
    </motion.div>
  );
}
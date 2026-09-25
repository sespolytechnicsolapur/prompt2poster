import React from 'react';
import {
  ArrowRight,
  TrendingUp,
  Trophy,
  Sparkles,
  Zap,
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { TopicBanner } from '../components/TopicBanner';
import { cn } from '../lib/utils';

const containerVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 24
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 25
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
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
      className="home-page"
    >

      {/* =====================================================
          HERO
      ===================================================== */}

      <motion.section
        variants={itemVariants}
        className="home-hero"
      >

        {/* Decorative background */}
        <div className="home-hero-glow home-hero-glow-one" />
        <div className="home-hero-glow home-hero-glow-two" />

        {/* Small badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="home-hero-badge"
        >
          <span className="home-hero-badge-dot" />
          <Sparkles size={14} />
          <span>AI EVALUATION ENGINE</span>
        </motion.div>

        {/* Icon */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.8,
            rotate: -8
          }}
          animate={{
            opacity: 1,
            scale: 1,
            rotate: 0
          }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="home-hero-icon"
        >
          <div className="home-hero-icon-inner">
            <Sparkles size={30} />
          </div>

          <span className="home-icon-orbit orbit-one" />
          <span className="home-icon-orbit orbit-two" />
        </motion.div>

        {/* Heading */}
        <h1 className="home-hero-title">
          AI-Powered Evaluation
          <br />

          <span className="home-hero-title-accent">
            for Visual Design
          </span>

          <br />

          Competitions
        </h1>

        {/* Description */}
        <p className="home-hero-description">
          Submit your AI-generated poster and receive instant,
          structured evaluation across critical visual design
          criteria from our multimodal AI judge.
        </p>

        {/* CTA */}
        <div className="home-hero-actions">

          <motion.button
            whileHover={{
              y: -3,
              scale: 1.015
            }}
            whileTap={{
              scale: 0.98
            }}
            onClick={() => onNavigate('submit')}
            className="home-primary-cta"
          >
            <span>Submit Your Poster</span>

            <span className="home-primary-cta-icon">
              <ArrowRight size={18} />
            </span>
          </motion.button>

          {showTop3 && (
            <motion.button
              whileHover={{
                y: -3,
                scale: 1.015
              }}
              whileTap={{
                scale: 0.98
              }}
              onClick={() => onNavigate('leaderboard')}
              className="home-secondary-cta"
            >
              <Trophy size={18} />
              <span>View Leaderboard</span>
            </motion.button>
          )}

        </div>

        {/* Feature indicators */}
        <div className="home-feature-row">

          <div className="home-feature-item">
            <span className="home-feature-icon">
              <Zap size={15} />
            </span>

            <span>Instant Evaluation</span>
          </div>

          <div className="home-feature-divider" />

          <div className="home-feature-item">
            <span className="home-feature-icon">
              <BarChart3 size={15} />
            </span>

            <span>Structured Scoring</span>
          </div>

          <div className="home-feature-divider" />

          <div className="home-feature-item">
            <span className="home-feature-icon">
              <ShieldCheck size={15} />
            </span>

            <span>AI-Powered Judging</span>
          </div>

        </div>
      </motion.section>


      {/* =====================================================
          CURRENT TOPIC
      ===================================================== */}

      <motion.section
        variants={itemVariants}
        className="home-topic-section"
      >
        <div className="home-section-label">
          <span className="home-section-label-line" />
          <span>CURRENT COMPETITION TOPIC</span>
          <span className="home-section-label-line" />
        </div>

        <TopicBanner
          topicTitle={activeTopic?.topic_title}
          description={activeTopic?.description}
          topicVisible={topicVisible}
          isAdmin={isAdmin}
        />
      </motion.section>


      {/* =====================================================
          TOP 3
      ===================================================== */}

      {showTop3 && (
        <motion.section
          variants={itemVariants}
          className="home-leaderboard-section"
        >

          {/* Section heading */}
          <div className="home-section-header">

            <div>
              <div className="home-section-eyebrow">
                <span className="home-live-dot" />
                LIVE RANKINGS
              </div>

              <h2 className="home-section-title">
                Current Top 3
              </h2>

              <p className="home-section-description">
                Leading submissions based on AI evaluation scores.
              </p>
            </div>

            <motion.button
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate('leaderboard')}
              className="home-see-all"
            >
              <span>See all rankings</span>
              <ArrowRight size={16} />
            </motion.button>

          </div>


          {/* Cards */}
          <div className="home-top-grid">

            {topSubmissions.length > 0 ? (

              topSubmissions.map((sub, index) => {

                const rankData = [
                  {
                    label: '1ST',
                    className: 'home-rank-gold',
                    icon: '01'
                  },
                  {
                    label: '2ND',
                    className: 'home-rank-silver',
                    icon: '02'
                  },
                  {
                    label: '3RD',
                    className: 'home-rank-bronze',
                    icon: '03'
                  }
                ];

                const rank = rankData[index] || {
                  label: `#${index + 1}`,
                  className: 'home-rank-default',
                  icon: String(index + 1).padStart(2, '0')
                };

                return (
                  <motion.div
                    key={sub.id}
                    variants={cardVariants}
                    whileHover={{
                      y: -8
                    }}
                    onClick={() =>
                      onSelectSubmission(sub.id, sub)
                    }
                    className={cn(
                      'home-ranking-card',
                      rank.className
                    )}
                  >

                    {/* Top glow */}
                    <div className="home-card-glow" />

                    {/* Rank */}
                    <div className="home-ranking-top">

                      <div className="home-rank-badge">
                        <Trophy size={15} />
                        <span>{rank.label}</span>
                      </div>

                      <span className="home-ranking-number">
                        {rank.icon}
                      </span>

                    </div>


                    {/* Contestant */}
                    <div className="home-contestant">

                      <div className="home-avatar">
                        {(sub.contestant_name || '?')
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="home-contestant-info">

                        <h3>
                          {sub.contestant_name}
                        </h3>

                        <span>
                          Rank #{index + 1}
                        </span>

                      </div>

                    </div>


                    {/* Score */}
                    <div className="home-score-block">

                      <div className="home-score-label">
                        AI SCORE
                      </div>

                      <div className="home-score">
                        <span>
                          {sub.total_score}
                        </span>

                        <small>/100</small>
                      </div>

                    </div>


                    {/* Evaluation */}
                    {sub.overall_evaluation && (
                      <div className="home-evaluation">

                        <div className="home-evaluation-icon">
                          <Sparkles size={13} />
                        </div>

                        <p>
                          {sub.overall_evaluation}
                        </p>

                      </div>
                    )}


                    {/* Bottom */}
                    <div className="home-card-footer">

                      <span>
                        View submission
                      </span>

                      <span className="home-card-arrow">
                        <ArrowRight size={15} />
                      </span>

                    </div>

                  </motion.div>
                );
              })

            ) : (

              <motion.div
                variants={cardVariants}
                className="home-empty-state"
              >

                <div className="home-empty-icon">
                  <TrendingUp size={28} />
                </div>

                <h3>
                  Leaderboard is empty
                </h3>

                <p>
                  Be the first to submit a poster and
                  claim the top spot.
                </p>

                <button
                  onClick={() => onNavigate('submit')}
                  className="home-empty-button"
                >
                  Submit First Poster
                  <ArrowRight size={16} />
                </button>

              </motion.div>

            )}

          </div>

        </motion.section>
      )}


      {/* =====================================================
          BOTTOM BRANDING
      ===================================================== */}

      <motion.div
        variants={itemVariants}
        className="home-bottom-line"
      >
        <span />
        <span>POWERED BY PROMPT2POSTER AI</span>
        <span />
      </motion.div>

    </motion.div>
  );
}
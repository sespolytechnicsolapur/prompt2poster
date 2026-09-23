import React from 'react';
import { ArrowRight, Star, TrendingUp, Trophy } from 'lucide-react';
import { TopicBanner } from '../components/TopicBanner';

/**
 * Landing page Overview.
 * Displays the current topic and a top-3 leaderboard snapshot
 * (if the leaderboard is set to visible or if the user is an admin).
 */
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

      {/* Hero Section */}
      <section style={{ textAlign: 'center', margin: '2rem 0 1rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{
          fontSize: '2.5rem', fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.04em',
          lineHeight: '1.1',
          marginBottom: '1rem',
          maxWidth: '800px'
        }}>
          AI-Powered Evaluation for <br />
          <span style={{ color: 'var(--accent-primary)' }}>Visual Design</span> Competitions
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 0 2rem 0', lineHeight: '1.6' }}>
          Submit your AI-generated poster and receive instant, objective scoring across 7 critical design criteria from our multimodal AI judge.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => onNavigate('submit')}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
          >
            Submit Poster <ArrowRight size={18} style={{ marginLeft: '0.25rem' }} />
          </button>
          {showTop3 && (
            <button
              onClick={() => onNavigate('leaderboard')}
              className="btn btn-secondary"
              style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
            >
              View Leaderboard
            </button>
          )}
        </div>
      </section>

      {/* Current Topic Banner */}
      <TopicBanner
        topicTitle={activeTopic?.topic_title}
        description={activeTopic?.description}
        topicVisible={topicVisible}
        isAdmin={isAdmin}
      />

      {/* Top 3 Leaderboard Snapshot */}
      {showTop3 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trophy size={20} style={{ color: 'var(--accent-primary)' }} />
              Current Top 3
            </h2>
            <button
              onClick={() => onNavigate('leaderboard')}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--accent-primary)' }}
            >
              See all <ArrowRight size={14} style={{ marginLeft: '0.25rem' }} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {topSubmissions.length > 0 ? (
              topSubmissions.map((sub, index) => (
                <div
                  key={sub.id}
                  onClick={() => onSelectSubmission(sub.id, sub)}
                  className="surface-card"
                  style={{
                    padding: '1.25rem', cursor: 'pointer', transition: 'transform var(--transition-fast)',
                    position: 'relative', overflow: 'hidden'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{
                    position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px',
                    backgroundColor: index === 0 ? 'var(--status-warning)' : index === 1 ? '#9CA3AF' : '#B45309'
                  }} />
                  <div style={{ paddingLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
                          {sub.contestant_name}
                        </h3>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Star size={12} /> Rank #{index + 1}
                        </div>
                      </div>
                      <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                        {sub.total_score}
                      </div>
                    </div>
                    {sub.overall_evaluation && (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        "{sub.overall_evaluation}"
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="surface-card" style={{ padding: '3rem', textAlign: 'center', gridColumn: '1 / -1' }}>
                <TrendingUp size={32} style={{ color: 'var(--border-strong)', margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
                  Leaderboard is empty
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                  Be the first to submit a poster and claim the top spot!
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
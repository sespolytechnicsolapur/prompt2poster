import React from 'react';
import { ArrowRight, Star, TrendingUp, Trophy, Sparkles, Pencil } from 'lucide-react';
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
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

      {/* ── Hero Section — Modern & Professional ── */}
      <section style={{
        textAlign: 'center',
        margin: '4rem 0 3rem 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        animation: 'fade-up 0.8s var(--transition-normal) both'
      }}>

        <div style={{
          width: '56px', height: '56px',
          borderRadius: '16px',
          background: 'var(--text-primary)',
          color: 'var(--text-inverse)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem auto',
          boxShadow: 'var(--shadow-md)',
        }}>
          <Sparkles size={28} />
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: 800,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-display)',
          letterSpacing: '-0.03em',
          lineHeight: '1.1',
          marginBottom: '1.25rem',
          maxWidth: '900px',
          position: 'relative'
        }}>
          AI-Powered Evaluation for{' '}
          <span style={{ color: 'var(--text-primary)' }}>
            Visual Design
          </span>{' '}
          Competitions
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1.15rem',
          maxWidth: '650px',
          margin: '0 0 2.5rem 0',
          lineHeight: '1.7',
          fontFamily: 'var(--font-sans)',
        }}>
          Submit your AI-generated poster and receive instant, objective scoring across 7 critical design criteria from our multimodal AI judge.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => onNavigate('submit')}
            className="btn btn-accent"
            style={{
              padding: '0.85rem 2rem',
              fontSize: '1.05rem',
              fontFamily: 'var(--font-sans)',
              borderRadius: '999px',
            }}
          >
            Submit Poster <ArrowRight size={18} />
          </button>
          {showTop3 && (
            <button
              onClick={() => onNavigate('leaderboard')}
              className="btn btn-secondary"
              style={{
                padding: '0.85rem 2rem',
                fontSize: '1.05rem',
                fontFamily: 'var(--font-sans)',
                borderRadius: '999px',
              }}
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

      {/* ── Top 3 Leaderboard Snapshot — Sketchy cards ── */}
      {showTop3 && (
        <section>
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: '1.25rem'
          }}>
            <h2 style={{
              fontSize: '1.6rem', fontWeight: 800,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              letterSpacing: '-0.02em'
            }}>
              <Trophy size={22} style={{ color: 'var(--text-primary)' }} />
              Current Top 3
            </h2>
            <button
              onClick={() => onNavigate('leaderboard')}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-sans)' }}
            >
              See all →
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem'
          }}>
            {topSubmissions.length > 0 ? (
              topSubmissions.map((sub, index) => (
                <div
                  key={sub.id}
                  onClick={() => onSelectSubmission(sub.id, sub)}
                  className="surface-card"
                  style={{
                    padding: '1.25rem',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    animationDelay: `${index * 0.1}s`,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  {/* Decorative left accent stripe */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, bottom: 0, width: '6px',
                    backgroundColor: index === 0 ? 'var(--status-warning)' : index === 1 ? '#9CA3AF' : '#B45309',
                    borderRadius: '0 4px 4px 0'
                  }} />

                  <div style={{ paddingLeft: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{
                          fontSize: '1.1rem', fontWeight: 700,
                          color: 'var(--text-primary)',
                          fontFamily: 'var(--font-heading)',
                          margin: '0 0 0.25rem 0'
                        }}>
                          {sub.contestant_name}
                        </h3>
                        <div style={{
                          fontSize: '0.85rem',
                          color: 'var(--text-muted)',
                          display: 'flex', alignItems: 'center', gap: '0.35rem',
                          fontFamily: 'var(--font-sans)'
                        }}>
                          Rank #{index + 1}
                        </div>
                      </div>
                      <div className="mono-num" style={{
                        fontSize: '1.5rem', fontWeight: 800,
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-display)',
                      }}>
                        {sub.total_score}
                      </div>
                    </div>
                    {sub.overall_evaluation && (
                      <p style={{
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)',
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontStyle: 'italic',
                        fontFamily: 'var(--font-sans)'
                      }}>
                        "{sub.overall_evaluation}"
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="surface-card" style={{
                padding: '3rem',
                textAlign: 'center',
                gridColumn: '1 / -1'
              }}>
                <TrendingUp size={36} style={{
                  color: 'var(--border-strong)',
                  margin: '0 auto 1rem auto',
                  animation: 'float 3s ease-in-out infinite'
                }} />
                <h3 style={{
                  fontSize: '1.15rem', fontWeight: 800,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-display)',
                  margin: '0 0 0.5rem 0',
                  letterSpacing: '-0.01em'
                }}>
                  Leaderboard is empty
                </h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '1rem', margin: 0,
                  fontFamily: 'var(--font-sans)',
                }}>
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
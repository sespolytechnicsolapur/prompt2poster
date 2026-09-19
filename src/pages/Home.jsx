import React from 'react';
import { TopicBanner } from '../components/TopicBanner';
import { SubmissionCard } from '../components/SubmissionCard';
import { CRITERIA_DEFINITIONS } from '../utils/scoreValidation';
import {
  Sparkles,
  Upload,
  Trophy,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export function Home({
  activeTopic,
  loadingTopic,
  leaderboard,
  onNavigate,
  onSelectSubmission
}) {
  const topThree = leaderboard.slice(0, 3);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '3.5rem',
        paddingBottom: '3rem'
      }}
      className="animate-fade-in"
    >
      {/* Hero Section */}
      <section
        style={{
          textAlign: 'center',
          paddingTop: '2.5rem',
          paddingBottom: '1rem'
        }}
      >
        <div
          className="badge badge-primary"
          style={{
            marginBottom: '1.25rem',
            padding: '0.45rem 1rem'
          }}
        >
          <Sparkles size={14} />
          <span>College AI Poster Making Challenge</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.2rem, 6vw, 3.5rem)',
            fontWeight: 800,
            lineHeight: '1.1',
            marginBottom: '1.25rem',
            letterSpacing: '-0.04em',
            color: 'var(--text-main)',
            maxWidth: '900px',
            margin: '0 auto 1.25rem auto'
          }}
        >
          Objective, Transparent AI Evaluation for Poster Design
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--text-muted)',
            maxWidth: '720px',
            margin: '0 auto 2.25rem auto',
            lineHeight: '1.6'
          }}
        >
          Prompt2Poster judges on-site contestant posters using Groq AI and
          Qwen 3.8 vision models. Evaluates relevance, visual hierarchy,
          typography, composition, creativity, color, and overall
          communication.
        </p>

        {/* Hero CTAs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <button
            onClick={() => onNavigate('submit')}
            className="btn btn-primary"
            style={{
              fontSize: '1.05rem',
              padding: '0.85rem 2rem'
            }}
          >
            <Upload size={20} />
            <span>Submit Your Poster</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={() => onNavigate('leaderboard')}
            className="btn btn-secondary"
            style={{
              fontSize: '1.05rem',
              padding: '0.85rem 2rem'
            }}
          >
            <Trophy
              size={20}
              color="var(--accent-amber)"
            />
            <span>View Live Leaderboard</span>
          </button>
        </div>
      </section>

      {/* Active Competition Topic Section */}
      <section>
        <TopicBanner
          topic={activeTopic}
          loading={loadingTopic}
          onManageClick={() => onNavigate('organizer')}
        />
      </section>

      {/* Official 7 Criteria Grid */}
      <section>
        <div
          style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}
        >
          <div
            className="badge badge-cyan"
            style={{ marginBottom: '0.5rem' }}
          >
            <ShieldCheck size={14} />
            Official Standard
          </div>

          <h2
            style={{
              fontSize: '2.5rem',
              color: 'var(--text-main)',
              letterSpacing: '-0.04em'
            }}
          >
            The 7 Official AI Judging Criteria
          </h2>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.95rem',
              marginTop: '0.4rem'
            }}
          >
            Every poster is evaluated mathematically against these exact 7
            weightings totaling 100 points.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {CRITERIA_DEFINITIONS.map((crit) => (
            <div
              key={crit.key}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.75rem',
                    gap: '0.75rem'
                  }}
                >
                  <h4
                    style={{
                      fontSize: '1.1rem',
                      color: 'var(--text-main)',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {crit.label}
                  </h4>

                  <span
                    className="badge badge-emerald"
                    style={{
                      fontSize: '0.78rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Max {crit.maxScore} Pts
                  </span>
                </div>

                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    lineHeight: '1.5'
                  }}
                >
                  {crit.key === 'relevance_to_topic' &&
                    'Evaluates how directly and effectively the poster addresses the assigned topic.'}

                  {crit.key === 'visual_hierarchy' &&
                    'Evaluates focal point clarity and guided attention across visual elements.'}

                  {crit.key === 'typography_readability' &&
                    'Evaluates font legibility, sizing, spacing, contrast, and reading flow.'}

                  {crit.key === 'composition_layout' &&
                    'Evaluates spatial balance, alignment, margins, and structural grid.'}

                  {crit.key === 'creativity_originality' &&
                    'Evaluates artistic concept novelty and distinctive visual presentation.'}

                  {crit.key === 'color_usage' &&
                    'Evaluates color harmony, contrast, consistency, and visual tone.'}

                  {crit.key === 'overall_communication' &&
                    'Evaluates how effectively the poster conveys its intended message.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Leaderboard Preview */}
      {topThree.length > 0 && (
        <section>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div>
              <div
                className="badge badge-gold"
                style={{ marginBottom: '0.35rem' }}
              >
                <Trophy size={13} />
                Top Contestants
              </div>

              <h2
                style={{
                  fontSize: '2.5rem',
                  color: 'var(--text-main)',
                  letterSpacing: '-0.04em'
                }}
              >
                Leading Competition Entries
              </h2>
            </div>

            <button
              onClick={() => onNavigate('leaderboard')}
              className="btn btn-secondary"
              style={{ fontSize: '0.88rem' }}
            >
              <span>
                View Full Leaderboard ({leaderboard.length})
              </span>

              <ArrowRight size={16} />
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {topThree.map((item, index) => (
              <SubmissionCard
                key={item.id}
                submission={item}
                rank={index + 1}
                onSelect={onSelectSubmission}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
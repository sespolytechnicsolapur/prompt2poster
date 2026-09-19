import React from 'react';
import { TopicBanner } from '../components/TopicBanner';
import { SubmissionCard } from '../components/SubmissionCard';
import { CRITERIA_DEFINITIONS } from '../utils/scoreValidation';
import { Upload, Trophy, ArrowRight } from 'lucide-react';

export function Home({ activeTopic, loadingTopic, leaderboard, onNavigate, onSelectSubmission }) {
  const topThree = leaderboard.slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Intro Header */}
      <section style={{ maxWidth: '780px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span className="badge badge-mono">College AI Poster Making Challenge</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Automated Judging Engine</span>
        </div>

        <h1 style={{
          fontSize: '2rem',
          fontWeight: 600,
          lineHeight: '1.2',
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
          marginBottom: '0.75rem'
        }}>
          Objective, Transparent AI Evaluation for Poster Design
        </h1>

        <p style={{
          fontSize: '0.9375rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.6',
          marginBottom: '1.5rem'
        }}>
          Prompt2Poster benchmarks competition submissions against 7 standardized design criteria using advanced multimodal vision models. Every score is mathematically verified and published with full audit transparency.
        </p>

        {/* Primary Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('submit')}
            className="btn btn-primary"
          >
            <Upload size={15} />
            <span>Submit Poster</span>
            <ArrowRight size={14} />
          </button>

          <button
            onClick={() => onNavigate('leaderboard')}
            className="btn btn-secondary"
          >
            <Trophy size={15} />
            <span>Live Leaderboard</span>
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

      {/* Official 7 Criteria Matrix */}
      <section>
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Evaluation Benchmark Matrix
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            Posters are scored strictly against these 7 weighted criteria totaling 100 points.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '0.75rem'
        }}>
          {CRITERIA_DEFINITIONS.map((crit) => (
            <div
              key={crit.key}
              className="surface-card"
              style={{
                padding: '1rem 1.125rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{crit.label}</h4>
                  <span className="badge badge-mono" style={{ fontSize: '0.6875rem' }}>
                    {crit.maxScore} pts
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.45', margin: 0 }}>
                  {crit.key === 'relevance_to_topic' && 'Directness and fidelity in visualizing the assigned prompt.'}
                  {crit.key === 'visual_hierarchy' && 'Focal point distinction and natural guided eye flow.'}
                  {crit.key === 'typography_readability' && 'Font legibility, sizing hierarchy, and foreground contrast.'}
                  {crit.key === 'composition_layout' && 'Spatial balance, grid alignment, and margin distribution.'}
                  {crit.key === 'creativity_originality' && 'Artistic concept novelty and visual interpretation.'}
                  {crit.key === 'color_usage' && 'Palette harmony, contrast consistency, and tonal control.'}
                  {crit.key === 'overall_communication' && 'Clarity and efficacy in conveying the core message.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Leaderboard Preview */}
      {topThree.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                Leading Submissions
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', margin: 0 }}>
                Top entries currently ranked on the verified leaderboard
              </p>
            </div>
            <button
              onClick={() => onNavigate('leaderboard')}
              className="btn btn-secondary btn-sm"
            >
              <span>Full Leaderboard ({leaderboard.length})</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem'
          }}>
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

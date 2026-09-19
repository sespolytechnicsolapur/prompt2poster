import React, { useState, useEffect } from 'react';
import { fetchSubmissionById } from '../services/submissionService';
import { PosterPreview } from '../components/PosterPreview';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { IssueList } from '../components/IssueList';
import { formatDate } from '../utils/formatters';
import { ArrowLeft } from 'lucide-react';

export function SubmissionDetails({ submissionId, onBack, initialRecord }) {
  const [submission, setSubmission] = useState(initialRecord || null);
  const [loading, setLoading] = useState(!initialRecord);

  useEffect(() => {
    if (!initialRecord && submissionId) {
      setLoading(true);
      fetchSubmissionById(submissionId)
        .then((res) => {
          setSubmission(res);
        })
        .finally(() => setLoading(false));
    }
  }, [submissionId, initialRecord]);

  if (loading) {
    return (
      <div className="surface-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading submission audit details...
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="surface-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.15rem' }}>Submission Not Found</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>The requested record could not be retrieved from the database.</p>
        <button onClick={onBack} className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} />
          <span>Return to Leaderboard</span>
        </button>
      </div>
    );
  }

  const evaluation = submission.evaluation_reasoning || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Back Button */}
      <div>
        <button
          onClick={onBack}
          className="btn btn-ghost btn-sm"
          style={{ paddingLeft: 0 }}
        >
          <ArrowLeft size={14} />
          <span>Back to Leaderboard</span>
        </button>
      </div>

      {/* Contestant Header Bar */}
      <div className="surface-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-mono">Contestant Audit</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {formatDate(submission.created_at)}
              </span>
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              {submission.contestant_name}
            </h1>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Topic: <strong style={{ color: 'var(--text-primary)' }}>{submission.topic}</strong>
            </div>
          </div>

          {/* Score Badge */}
          <div style={{
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.25rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Verified Score
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
              <span className="mono-num" style={{
                fontSize: '2rem',
                fontWeight: 700,
                lineHeight: 1,
                color: 'var(--text-primary)'
              }}>
                {submission.total_score}
              </span>
              <span className="mono-num" style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>
                / 100
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split-View Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        {/* Left Column: Poster Image & Identified Issues */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Poster Image
            </div>
            <PosterPreview
              src={submission.poster_url}
              alt={submission.contestant_name}
              contestantName={submission.contestant_name}
            />
          </div>

          {/* Identified Issues */}
          <IssueList issues={submission.issues || []} />
        </div>

        {/* Right Column: AI Executive Summary & Criteria Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Executive Summary */}
          {submission.overall_evaluation && (
            <div className="surface-card" style={{ padding: '1.25rem 1.5rem' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Judge Executive Summary
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.55', margin: 0 }}>
                {submission.overall_evaluation}
              </p>
            </div>
          )}

          {/* 7 Criteria Ledger */}
          <ScoreBreakdown
            evaluation={evaluation}
            totalScore={submission.total_score}
          />
        </div>
      </div>
    </div>
  );
}

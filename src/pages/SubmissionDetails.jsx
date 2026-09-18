import React, { useState, useEffect } from 'react';
import { fetchSubmissionById } from '../services/submissionService';
import { PosterPreview } from '../components/PosterPreview';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { IssueList } from '../components/IssueList';
import { formatDate, getScoreColor } from '../utils/formatters';
import { ArrowLeft, User, Target, Calendar, Award, Cpu, ShieldCheck } from 'lucide-react';

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
      <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading transparent score breakdown details...
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <h3 style={{ color: '#FFFFFF', marginBottom: '1rem' }}>Submission Not Found</h3>
        <button onClick={onBack} className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Return to Leaderboard</span>
        </button>
      </div>
    );
  }

  const evaluation = submission.evaluation_reasoning || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }} className="animate-fade-in">
      {/* Top Navigation */}
      <div>
        <button
          onClick={onBack}
          className="btn btn-secondary"
          style={{ fontSize: '0.88rem', marginBottom: '1.25rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Leaderboard</span>
        </button>

        {/* Contestant Header Bar */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-primary">
                  <User size={13} /> Contestant Submission
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={13} /> {formatDate(submission.created_at)}
                </span>
              </div>

              <h1 style={{ fontSize: '2.3rem', color: '#FFFFFF', marginBottom: '0.35rem' }}>
                {submission.contestant_name}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                <Target size={16} color="var(--accent-cyan)" />
                <span>Topic: <strong style={{ color: '#FFFFFF' }}>{submission.topic}</strong></span>
              </div>
            </div>

            {/* Score Highlight Box */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(6, 182, 212, 0.25) 100%)',
              border: '1px solid var(--border-color-glow)',
              padding: '1rem 2rem',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Total Verified Score
              </div>
              <div style={{
                fontSize: '3rem',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                lineHeight: '1',
                color: getScoreColor(submission.total_score),
                margin: '0.25rem 0'
              }}>
                {submission.total_score}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>out of 100 Points</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Poster Image & Score Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Left Column: Poster Image Display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF', marginBottom: '0.75rem' }}>
              Submitted Competition Poster
            </h3>
            <PosterPreview
              src={submission.poster_url}
              alt={submission.contestant_name}
              contestantName={submission.contestant_name}
            />
          </div>

          {/* AI Identified Issues List */}
          <IssueList issues={submission.issues || []} />
        </div>

        {/* Right Column: Complete Transparent Score Breakdown & Overall Evaluation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Overall AI Summary Card */}
          {submission.overall_evaluation && (
            <div className="glass-panel" style={{ padding: '1.75rem', background: 'rgba(99, 102, 241, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <Cpu size={20} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF' }}>AI Judge Executive Summary</h3>
              </div>
              <p style={{ fontSize: '0.94rem', color: '#CBD5E1', lineHeight: '1.65' }}>
                {submission.overall_evaluation}
              </p>
            </div>
          )}

          {/* 7 Official Criteria Breakdown */}
          <ScoreBreakdown
            evaluation={evaluation}
            totalScore={submission.total_score}
          />
        </div>
      </div>
    </div>
  );
}

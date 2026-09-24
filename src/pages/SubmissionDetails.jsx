import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Maximize2, X, Download, ShieldAlert, FileText, History, Image as ImageIcon, AlertCircle, Pencil } from 'lucide-react';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { fetchSubmissionById } from '../services/submissionService';
import { formatDate } from '../utils/formatters';

export function SubmissionDetails({ submissionId, initialRecord, onBack, isAdmin }) {
  const [submission, setSubmission] = useState(initialRecord);
  const [loading, setLoading]       = useState(!initialRecord);
  const [error, setError]           = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (initialRecord && initialRecord.id === submissionId) {
      setSubmission(initialRecord);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const loadSubmission = async () => {
      setLoading(true);
      try {
        const data = await fetchSubmissionById(submissionId);
        if (isMounted) {
          if (data) {
            setSubmission(data);
          } else {
            setError('Submission not found.');
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load submission details:', err);
          setError('An error occurred while loading details.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadSubmission();
    return () => { isMounted = false; };
  }, [submissionId, initialRecord]);

  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '4rem 2rem', gap: '1rem',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-sans)',
        animation: 'wobble-in 0.5s ease-out both'
      }}>
        <Loader2 size={36} style={{
          animation: 'spin 1s linear infinite',
          color: 'var(--accent-primary)'
        }} />
        <p style={{ fontFamily: 'var(--font-sans)' }}>Loading submission details...</p>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div style={{
        textAlign: 'center', padding: '4rem 2rem',
        animation: 'wobble-in 0.5s ease-out both'
      }}>
        <h2 style={{
          fontSize: '1.4rem',
          color: 'var(--status-danger)',
          fontFamily: 'var(--font-heading)',
          marginBottom: '1rem'
        }}>
          {error || 'Submission not found'} 😕
        </h2>
        <button onClick={onBack} className="btn btn-secondary" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
          <ArrowLeft size={16} />
          <span>Back to Leaderboard</span>
        </button>
      </div>
    );
  }

  const { evaluation_reasoning: evalData } = submission;
  const isEdited = submission.score_edit_log && submission.score_edit_log.length > 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} className="btn btn-ghost" style={{
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-sans)',
          fontWeight: 600
        }}>
          <ArrowLeft size={16} />
          <span>← Back</span>
        </button>

        {isEdited && isAdmin && (
          <div className="badge badge-mono" style={{
            color: 'var(--status-warning)',
            borderColor: 'var(--status-warning)',
            backgroundColor: 'var(--status-warning-subtle)',
            fontFamily: 'var(--font-sans)',
            animation: 'wiggle 3s ease-in-out infinite'
          }}>
            <ShieldAlert size={13} />
            <span>Scores Edited by Admin ⚠️</span>
          </div>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Left Column: Poster Image */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '5rem' }}>
          <div
            className="surface-card"
            style={{
              position: 'relative', overflow: 'hidden',
              padding: '1rem',
              display: 'flex', flexDirection: 'column', gap: '1rem'
            }}
          >
            {/* Image Container */}
            <div style={{
              position: 'relative',
              borderRadius: '12px 4px 12px 4px / 4px 12px 4px 12px',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-app)',
              border: '2px solid var(--border-subtle)'
            }}>
              <img
                src={submission.poster_url || '/placeholder.svg?height=600&width=400'}
                alt={`Poster by ${submission.contestant_name}`}
                style={{
                  width: '100%', height: 'auto',
                  objectFit: 'contain', display: 'block', maxHeight: '70vh'
                }}
              />

              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsFullscreen(true)}
                className="btn btn-primary"
                style={{
                  position: 'absolute', top: '1rem', right: '1rem',
                  padding: '0.5rem', width: '38px', height: '38px',
                  borderRadius: '50%',
                  boxShadow: 'var(--shadow-md)'
                }}
                title="View Fullscreen"
              >
                <Maximize2 size={16} />
              </button>
            </div>

            {/* Poster Info Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                display: 'flex', gap: '0.5rem',
                fontFamily: 'var(--font-sans)'
              }}>
                <span className="badge badge-mono">ID: {submission.id.substring(0, 8)}</span>
              </div>
              <a
                href={submission.poster_url}
                download={`poster-${submission.contestant_name.replace(/\s+/g, '-').toLowerCase()}.png`}
                className="btn btn-ghost btn-sm"
                target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                <Download size={14} />
                <span>Download</span>
              </a>
            </div>
          </div>

          {/* AI Prompt Used (if available) */}
          {submission.ai_prompt_used && (
            <div className="surface-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Pencil size={16} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{
                  fontSize: '1.05rem', fontWeight: 700,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-heading)',
                  margin: 0
                }}>
                  AI Prompt Used
                </h3>
              </div>
              <div style={{
                backgroundColor: 'var(--bg-surface-subtle)',
                padding: '1rem',
                borderRadius: '12px 4px 12px 4px / 4px 12px 4px 12px',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                border: '2px dashed var(--border-subtle)'
              }}>
                {submission.ai_prompt_used}
              </div>
            </div>
          )}

          {/* AI Chat Screenshot (if available) */}
          {submission.chat_screenshot_url && (
            <div className="surface-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <ImageIcon size={16} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{
                  fontSize: '1.05rem', fontWeight: 700,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-heading)',
                  margin: 0
                }}>
                  AI Chat Screenshot
                </h3>
              </div>
              <div style={{
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface-subtle)',
              }}>
                <a href={submission.chat_screenshot_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                  <img
                    src={submission.chat_screenshot_url}
                    alt="AI Chat Screenshot"
                    style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', display: 'block', transition: 'opacity 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                  />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Details & Evaluation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Header Info */}
          <div className="surface-card" style={{ padding: '1.5rem' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', marginBottom: '1.25rem'
            }}>
              <div>
                <h1 style={{
                  fontSize: '1.8rem', fontWeight: 700,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-heading)',
                  margin: '0 0 0.5rem 0',
                  letterSpacing: '0.01em'
                }}>
                  {submission.contestant_name}
                </h1>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    color: 'var(--text-secondary)',
                    fontSize: '0.95rem',
                    fontFamily: 'var(--font-sans)',
                    fontStyle: 'italic'
                  }}>
                    <FileText size={14} />
                    <span>{submission.topic}</span>
                  </div>
                  {isAdmin && submission.college_name && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      color: 'var(--text-muted)',
                      fontSize: '0.9rem',
                      fontFamily: 'var(--font-sans)',
                    }}>
                      <span className="badge badge-mono">🎓 {submission.college_name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Total Score Circle */}
              <div style={{
                width: '70px', height: '70px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-primary)',
                border: '3px solid var(--text-primary)',
                boxShadow: '4px 4px 0 var(--text-primary)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                color: 'white', flexShrink: 0,
                animation: 'float 4s ease-in-out infinite'
              }}>
                <span className="mono-num" style={{
                  fontSize: '1.6rem', fontWeight: 800, lineHeight: 1,
                  fontFamily: 'var(--font-display)'
                }}>
                  {submission.total_score}
                </span>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 700, opacity: 0.9,
                  fontFamily: 'var(--font-sans)'
                }}>/100</span>
              </div>
            </div>

            <div style={{
              fontSize: '0.85rem',
              color: 'var(--text-dim)',
              paddingTop: '1rem',
              borderTop: '2px dashed var(--border-color)',
              fontFamily: 'var(--font-sans)',
              fontStyle: 'italic'
            }}>
              Submitted on {formatDate(submission.created_at)}
            </div>
          </div>

          {/* Overall Evaluation Summary */}
          {evalData?.overall_evaluation && (
            <div className="surface-card" style={{
              padding: '1.5rem',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-color)',
            }}>
              <h3 style={{
                fontSize: '1.05rem', fontWeight: 700,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-heading)',
                margin: '0 0 0.75rem 0',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Overall AI Assessment 🤖
              </h3>
              <p style={{
                fontSize: '1rem',
                color: 'var(--text-primary)',
                lineHeight: 1.7, margin: 0,
                fontFamily: 'var(--font-sans)',
                fontStyle: 'italic'
              }}>
                {evalData.overall_evaluation}
              </p>
            </div>
          )}

          {/* Identified Issues */}
          {submission.issues && submission.issues.length > 0 && (
            <div className="surface-card" style={{
              padding: '1.5rem',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <AlertCircle size={18} style={{ color: 'var(--status-warning)' }} />
                <h3 style={{
                  fontSize: '1.05rem', fontWeight: 700,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-heading)',
                  margin: 0
                }}>
                  Areas for Improvement
                </h3>
              </div>
              <ul style={{
                margin: 0, paddingLeft: '1.5rem',
                display: 'flex', flexDirection: 'column', gap: '0.75rem',
                color: 'var(--text-secondary)',
                fontSize: '0.95rem',
                fontFamily: 'var(--font-sans)',
              }}>
                {submission.issues.map((issue, idx) => (
                  <li key={idx} style={{ lineHeight: 1.6 }}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Score Breakdown */}
          <div className="surface-card" style={{ padding: '1.5rem' }}>
            <h3 style={{
              fontSize: '1.3rem', fontWeight: 700,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-heading)',
              margin: '0 0 1.5rem 0'
            }}>
              Detailed Score Breakdown 📊
            </h3>
            <ScoreBreakdown evaluation={evalData} />
          </div>

          {/* Admin Score Edit Log */}
          {isAdmin && isEdited && (
            <div className="surface-card" style={{
              padding: '1.5rem',
              borderLeft: '6px solid var(--status-danger)',
              transform: 'rotate(0.2deg)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <History size={16} style={{ color: 'var(--status-danger)' }} />
                <h3 style={{
                  fontSize: '1.05rem', fontWeight: 700,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-heading)',
                  margin: 0
                }}>
                  Admin Score Edit Log ⚠️
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[...submission.score_edit_log].reverse().map((log, idx) => (
                  <div key={idx} style={{
                    backgroundColor: 'var(--bg-surface-subtle)',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px 4px 12px 4px / 4px 12px 4px 12px',
                    fontSize: '0.9rem',
                    border: '2px dashed var(--border-subtle)',
                    fontFamily: 'var(--font-sans)'
                  }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      marginBottom: '0.3rem'
                    }}>
                      <span style={{
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-heading)'
                      }}>AI Re-evaluation Triggered</span>
                      <span style={{
                        color: 'var(--text-dim)',
                        fontStyle: 'italic'
                      }}>{formatDate(log.timestamp)}</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      Total changed from <strong className="mono-num" style={{ fontFamily: 'var(--font-display)', color: 'var(--status-danger)' }}>{log.previous_total}</strong> to <strong className="mono-num" style={{ fontFamily: 'var(--font-display)', color: 'var(--status-success)' }}>{log.new_total}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Fullscreen Image Viewer Modal */}
      {isFullscreen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem'
          }}
          onClick={() => setIsFullscreen(false)}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            style={{
              position: 'absolute', top: '1.5rem', right: '1.5rem',
              background: 'none', border: '2px solid rgba(255,255,255,0.3)',
              color: '#fff',
              cursor: 'pointer', padding: '0.5rem',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              width: '44px', height: '44px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 200ms ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'rotate(-5deg) scale(1.1)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'rotate(0) scale(1)'}
          >
            <X size={24} />
          </button>
          <img
            src={submission.poster_url || '/placeholder.svg?height=1200&width=800'}
            alt="Fullscreen Poster"
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', cursor: 'zoom-out' }}
            onClick={(e) => e.stopPropagation()} // Prevent click through to background
          />
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Sparkles, ShieldCheck, Cpu, Database } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{
      marginTop: 'auto',
      borderTop: '1px solid var(--border-color)',
      background: 'var(--bg-card-solid)',
      padding: '3rem 0 2rem 0',
      color: 'var(--text-muted)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <Sparkles size={20} color="var(--accent-primary)" />
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.2rem',
                fontWeight: 800,
                color: 'var(--text-main)'
              }}>
                Prompt2Poster
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
              Official full-stack AI evaluation platform for college poster challenges. Providing transparent, objective, structured AI scoring powered by Groq and Supabase.
            </p>
          </div>

          {/* Tech Architecture Stack */}
          <div>
            <h4 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '0.95rem' }}>Technology Stack</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={14} color="var(--accent-cyan)" />
                <span>AI Judge: Groq API (Qwen 2.5 / Vision)</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={14} color="var(--accent-primary)" />
                <span>Database & Storage: Supabase DB + Cloud Storage</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={14} color="var(--accent-emerald)" />
                <span>Score Integrity: 7-Criteria Validation Engine</span>
              </li>
            </ul>
          </div>

          {/* Criteria Breakdown Summary */}
          <div>
            <h4 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '0.95rem' }}>Official Evaluation Criteria</h4>
            <div style={{ fontSize: '0.82rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', color: 'var(--text-dim)' }}>
              <div>• Relevance (20 pts)</div>
              <div>• Visual Hierarchy (15 pts)</div>
              <div>• Typography (15 pts)</div>
              <div>• Composition (15 pts)</div>
              <div>• Creativity (15 pts)</div>
              <div>• Color Usage (10 pts)</div>
              <div>• Communication (10 pts)</div>
              <div style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>Total: 100 Points</div>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.82rem',
          color: 'var(--text-dim)'
        }}>
          <div>© {new Date().getFullYear()} Prompt2Poster — AI Poster Making Challenge Judging System</div>
          <div>College Technical Event Platform</div>
        </div>
      </div>
    </footer>
  );
}

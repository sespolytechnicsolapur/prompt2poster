import React from 'react';
import { ShieldCheck, Cpu, Database } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{
      marginTop: 'auto',
      borderTop: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-surface)',
      padding: '2rem 0 1.5rem 0',
      color: 'var(--text-muted)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Prompt2Poster
              </span>
              <span className="badge badge-mono">Workbench</span>
            </div>
            <p style={{ fontSize: '0.8125rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
              Automated visual design evaluation platform for collegiate poster competitions. Multimodal analysis across 7 standardized criteria.
            </p>
          </div>

          {/* Architecture */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.65rem', fontSize: '0.8125rem', fontWeight: 600 }}>Architecture</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Cpu size={13} />
                <span>Groq Vision Engine (qwen3.8-27b)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Database size={13} />
                <span>Supabase PostgreSQL & Cloud Storage</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={13} />
                <span>Deterministic 100-Point Arithmetic Ledger</span>
              </div>
            </div>
          </div>

          {/* Criteria Grid */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.65rem', fontSize: '0.8125rem', fontWeight: 600 }}>Score Distribution</h4>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', color: 'var(--text-muted)' }}>
              <span>Topic: 20 pts</span>
              <span>Hierarchy: 15 pts</span>
              <span>Typography: 15 pts</span>
              <span>Composition: 15 pts</span>
              <span>Creativity: 15 pts</span>
              <span>Color: 10 pts</span>
              <span>Comms: 10 pts</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Total: 100 pts</span>
            </div>
          </div>
        </div>

        <div style={{
          paddingTop: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.75rem',
          color: 'var(--text-dim)'
        }}>
          <div>Prompt2Poster — Technical Poster Evaluation Benchmark</div>
          <div className="mono-num">SES Polytechnic Solapur</div>
        </div>
      </div>
    </footer>
  );
}

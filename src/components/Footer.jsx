import React from 'react';
import { ShieldCheck, Cpu, Database, Triangle, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{
      marginTop: 'auto',
      borderTop: '3px solid var(--border-color)',
      backgroundColor: 'var(--bg-surface)',
      padding: '2rem 0 1.5rem 0',
      color: 'var(--text-muted)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative scribble */}
      <div style={{
        position: 'absolute', top: '-1px', left: 0, right: 0,
        height: '3px',
        backgroundImage: 'repeating-linear-gradient(90deg, var(--border-color) 0px, var(--border-color) 8px, transparent 8px, transparent 12px)',
      }} />

      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '2px dashed var(--border-subtle)'
        }}>
          {/* Brand Info */}
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem'
            }}>
              <Triangle size={16} style={{ color: 'var(--text-primary)', fill: 'var(--text-primary)' }} />
              <span style={{
                fontSize: '1.1rem', fontWeight: 800,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.02em'
              }}>
                Prompt2Poster
              </span>
              <span className="badge badge-mono">Workbench</span>
            </div>
            <p style={{
              fontSize: '0.9rem', lineHeight: '1.6',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-sans)',
            }}>
              Automated visual design evaluation platform for collegiate poster competitions. Multimodal analysis across 7 standardized criteria.
            </p>
          </div>

          {/* Architecture */}
          <div>
            <h4 style={{
              color: 'var(--text-primary)', marginBottom: '0.75rem',
              fontSize: '1.05rem', fontWeight: 700,
              fontFamily: 'var(--font-heading)'
            }}>Architecture</h4>
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '0.45rem',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-sans)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={14} />
                <span>Multimodal Vision Evaluation Engine</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={14} />
                <span>Cloud Storage & Competition Database</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={14} />
                <span>Deterministic 100-Point Arithmetic Ledger</span>
              </div>
            </div>
          </div>

          {/* Criteria Grid */}
          <div>
            <h4 style={{
              color: 'var(--text-primary)', marginBottom: '0.75rem',
              fontSize: '1.05rem', fontWeight: 700,
              fontFamily: 'var(--font-heading)'
            }}>Score Distribution</h4>
            <div style={{
              fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)',
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: '0.3rem',
              color: 'var(--text-muted)'
            }}>
              <span>Topic: 20 pts</span>
              <span>Hierarchy: 15 pts</span>
              <span>Typography: 15 pts</span>
              <span>Composition: 15 pts</span>
              <span>Creativity: 15 pts</span>
              <span>Color: 10 pts</span>
              <span>Comms: 10 pts</span>
              <span style={{
                color: 'var(--accent-primary)',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                fontSize: '0.95rem'
              }}>Total: 100 pts</span>
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
          fontSize: '0.85rem',
          color: 'var(--text-dim)',
          fontFamily: 'var(--font-sans)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Prompt2Poster — Technical Poster Evaluation Benchmark
            <Heart size={12} style={{ color: 'var(--accent-primary)', animation: 'float 2s ease-in-out infinite' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>SES Polytechnic Solapur</div>
        </div>
      </div>
    </footer>
  );
}

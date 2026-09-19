import React, { useState } from 'react';
import { Maximize2, Image as ImageIcon } from 'lucide-react';

export function PosterPreview({ src, alt, contestantName }) {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      <div 
        className="glass-panel"
        style={{
          padding: '0.75rem',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer'
        }}
        onClick={() => setIsZoomed(true)}
      >
        <div style={{
          position: 'relative',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          background: '#EEEEEE',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          maxHeight: '520px'
        }}>
          <img
            src={src}
            alt={alt || 'Submitted Poster'}
            style={{
              maxWidth: '100%',
              maxHeight: '520px',
              objectFit: 'contain',
              display: 'block'
            }}
          />

          <div style={{
            position: 'absolute',
            bottom: '1rem',
            right: '1rem',
            background: '#000000',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.4rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.78rem',
            color: '#FFFFFF'
          }}>
            <Maximize2 size={13} />
            <span>Click to Expand</span>
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div 
          onClick={() => setIsZoomed(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'var(--bg-card)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
        >
          <div style={{ maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }}>
            <img
              src={src}
              alt={alt}
              style={{
                maxWidth: '90vw',
                maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
              }}
            />
            <div style={{
              textAlign: 'center',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              marginTop: '0.75rem'
            }}>
              Poster Submission by <strong style={{ color: 'var(--text-main)' }}>{contestantName}</strong> (Click anywhere to close)
            </div>
          </div>
        </div>
      )}
    </>
  );
}

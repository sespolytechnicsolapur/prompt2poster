import React, { useState } from 'react';
import { Maximize2, X } from 'lucide-react';

export function PosterPreview({ src, alt, contestantName }) {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      <div 
        className="surface-card"
        style={{
          padding: '0.5rem',
          position: 'relative',
          cursor: 'pointer'
        }}
        onClick={() => setIsZoomed(true)}
      >
        <div style={{
          position: 'relative',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-surface-subtle)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          maxHeight: '480px'
        }}>
          <img
            src={src}
            alt={alt || 'Submitted Poster'}
            style={{
              maxWidth: '100%',
              maxHeight: '480px',
              objectFit: 'contain',
              display: 'block'
            }}
          />

          <div style={{
            position: 'absolute',
            bottom: '0.75rem',
            right: '0.75rem',
            backgroundColor: 'rgba(9, 9, 11, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.25rem 0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.6875rem',
            color: '#FFFFFF'
          }}>
            <Maximize2 size={11} />
            <span>Expand</span>
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
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '92vw',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
              color: '#FFFFFF'
            }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                {contestantName ? `${contestantName} — Poster View` : 'Poster Full View'}
              </span>
              <button
                onClick={() => setIsZoomed(false)}
                className="btn btn-ghost btn-sm"
                style={{ color: '#FFFFFF', padding: '0.25rem 0.5rem' }}
                aria-label="Close full view"
              >
                <X size={16} />
              </button>
            </div>

            <img
              src={src}
              alt={alt || 'Full size poster'}
              style={{
                maxWidth: '90vw',
                maxHeight: '84vh',
                objectFit: 'contain',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-overlay)'
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

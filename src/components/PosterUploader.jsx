import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, CheckCircle, AlertTriangle, FileText, X } from 'lucide-react';
import { validatePosterFile } from '../utils/validation';

export function PosterUploader({ selectedFile, setSelectedFile, previewUrl, setPreviewUrl }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (file) => {
    setError(null);
    if (!file) return;

    const validation = validatePosterFile(file);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        style={{ display: 'none' }}
        onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
      />

      {!previewUrl ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          style={{
            border: `2px dashed ${isDragging ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            background: isDragging ? 'rgba(6, 182, 212, 0.08)' : 'rgba(15, 23, 42, 0.5)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}>
            <UploadCloud size={32} color="var(--accent-primary)" />
          </div>

          <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF', marginBottom: '0.5rem' }}>
            Click to upload poster image
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1rem' }}>
            or drag and drop your poster file here
          </p>

          <div style={{
            display: 'inline-flex',
            gap: '1rem',
            fontSize: '0.78rem',
            color: 'var(--text-dim)',
            background: 'rgba(255,255,255,0.03)',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            border: '1px solid var(--border-color)'
          }}>
            <span>PNG, JPG, WEBP</span>
            <span>•</span>
            <span>Max 15 MB</span>
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '1.25rem', position: 'relative' }}>
          <button
            onClick={clearFile}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 2
            }}
            title="Remove poster"
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{
              width: '120px',
              height: '150px',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              background: '#000000',
              border: '1px solid var(--border-color)',
              flexShrink: 0
            }}>
              <img
                src={previewUrl}
                alt="Poster Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)', marginBottom: '0.35rem' }}>
                <CheckCircle size={16} />
                <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Poster Selected Ready for AI Judging</span>
              </div>
              <h4 style={{ color: '#FFFFFF', fontSize: '1rem', marginBottom: '0.25rem' }}>
                {selectedFile?.name || 'Uploaded Poster'}
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <button
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
              >
                Change Image
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--accent-rose)',
          fontSize: '0.88rem',
          background: 'rgba(244, 63, 94, 0.1)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(244, 63, 94, 0.2)'
        }}>
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

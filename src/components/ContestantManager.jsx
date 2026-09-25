import React, { useState, useRef } from 'react';
import { Upload, Trash2, AlertCircle, Check, FileSpreadsheet, Users } from 'lucide-react';
import { uploadContestantExcel, fetchContestants, clearContestants, deleteContestant } from '../services/contestantService';

/**
 * Admin component for managing contestants via Excel file upload.
 * Excel format: Column A = Name, Column B = User ID, Column C = Unique ID, Column D = College Name
 */
export function ContestantManager({ adminPassword, onToggleUserWhitelist }) {
  const [contestants, setContestants]   = useState([]);
  const [isUploading, setIsUploading]   = useState(false);
  const [isClearing, setIsClearing]     = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [successMsg, setSuccessMsg]     = useState(null);
  const [error, setError]               = useState(null);
  const [isDeletingUserId, setIsDeletingUserId] = useState(null);
  const fileInputRef = useRef(null);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Load contestants from server
  const loadContestants = async () => {
    setIsLoading(true);
    try {
      const data = await fetchContestants(adminPassword);
      setContestants(data.contestants || []);
    } catch (err) {
      console.error('Failed to load contestants:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Upload Excel file
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/octet-stream'
    ];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!validTypes.includes(file.type) && ext !== 'xlsx' && ext !== 'xls') {
      setError('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadContestantExcel(file, adminPassword);
      setContestants(result.contestants || []);
      showSuccess(`Successfully imported ${result.count} contestants`);
    } catch (err) {
      setError(err.message || 'Failed to upload contestant file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Clear all contestants
  const handleClear = async () => {
    if (!confirm('Clear all imported contestants? This cannot be undone.')) return;

    setIsClearing(true);
    setError(null);
    try {
      await clearContestants(adminPassword);
      setContestants([]);
      showSuccess('All contestants cleared');
    } catch (err) {
      setError(err.message || 'Failed to clear contestants');
    } finally {
      setIsClearing(false);
    }
  };

  const handleDeleteIndividual = async (userId) => {
    if (!confirm('Delete this contestant?')) return;
    setIsDeletingUserId(userId);
    setError(null);
    try {
      await deleteContestant(userId, adminPassword);
      setContestants(prev => prev.filter(c => c.user_id !== userId));
      showSuccess('Contestant deleted');
    } catch (err) {
      setError(err.message || 'Failed to delete contestant');
    } finally {
      setIsDeletingUserId(null);
    }
  };

  const handleToggleWhitelist = async (userId, currentStatus) => {
    if (!onToggleUserWhitelist) return;
    try {
      await onToggleUserWhitelist(userId, !currentStatus);
      setContestants(prev => prev.map(c => c.user_id === userId ? { ...c, is_whitelisted: !currentStatus } : c));
    } catch (err) {
      setError(err.message || 'Failed to toggle whitelist');
    }
  };

  // Load on first render
  React.useEffect(() => {
    loadContestants();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Upload Section */}
      <div className="surface-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileSpreadsheet size={16} style={{ color: 'var(--accent-primary)' }} />
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Import Contestants from Excel
          </h3>
        </div>

        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
          Upload an Excel file with columns: <strong>Name</strong> | <strong>User ID</strong> | <strong>Unique ID</strong> | <strong>College Name</strong>.
          This will <strong>replace</strong> all existing contestants.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-primary btn-sm"
            disabled={isUploading}
          >
            <Upload size={13} />
            <span>{isUploading ? 'Importing...' : 'Upload Excel File'}</span>
          </button>

          {contestants.length > 0 && (
            <button
              onClick={handleClear}
              className="btn btn-ghost btn-sm"
              disabled={isClearing}
              style={{ color: 'var(--status-danger)' }}
            >
              <Trash2 size={13} />
              <span>{isClearing ? 'Clearing...' : 'Clear All'}</span>
            </button>
          )}
        </div>

        {/* Messages */}
        {successMsg && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            color: 'var(--status-success)',
            backgroundColor: 'var(--status-success-subtle)',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8125rem'
          }}>
            <Check size={14} />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            color: 'var(--status-danger)',
            backgroundColor: 'var(--status-danger-subtle)',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8125rem',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Contestant List */}
      <div className="surface-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={14} style={{ color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Registered Contestants
            </h3>
          </div>
          <span className="badge badge-mono">{contestants.length} imported</span>
        </div>

        {isLoading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Loading contestants...</p>
        ) : contestants.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', fontSize: '0.8125rem', textAlign: 'center', margin: '1rem 0' }}>
            No contestants imported. Upload an Excel file to get started.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="ledger-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th>Name</th>
                  <th>User ID</th>
                  <th>Unique ID</th>
                  <th style={{ textAlign: 'center' }}>Whitelist</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contestants.map((c, idx) => (
                  <tr key={c.user_id || idx}>
                    <td>
                      <span className="mono-num" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                      {c.name}
                    </td>
                    <td>
                      <span className="mono-num" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {c.user_id}
                      </span>
                    </td>
                    <td>
                      <span className="mono-num" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {c.unique_id}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          id={`whitelist-toggle-${c.user_id}`}
                          checked={c.is_whitelisted || false}
                          onChange={() => handleToggleWhitelist(c.user_id, c.is_whitelisted)}
                          className="toggle-checkbox"
                        />
                        <label className="toggle-label" htmlFor={`whitelist-toggle-${c.user_id}`}></label>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteIndividual(c.user_id)}
                        disabled={isDeletingUserId === c.user_id}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--status-danger)', padding: '0.35rem' }}
                        title="Delete contestant"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

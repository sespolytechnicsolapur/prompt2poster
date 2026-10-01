import React, { useState, useRef } from 'react';
import { Upload, Trash2, AlertCircle, Check, FileSpreadsheet, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadContestantExcel, fetchContestants, clearContestants, deleteContestant } from '../services/contestantService';
import { cn } from '../lib/utils';

export function ContestantManager({ adminPassword, onToggleUserWhitelist }) {
  const [contestants, setContestants]   = useState([]);
  const [isUploading, setIsUploading]   = useState(false);
  const [isClearing, setIsClearing]     = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [successMsg, setSuccessMsg]     = useState(null);
  const [error, setError]               = useState(null);
  const [isDeletingUserId, setIsDeletingUserId] = useState(null);
  const [appendMode, setAppendMode]     = useState(false);
  const fileInputRef = useRef(null);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

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
      const result = await uploadContestantExcel(file, adminPassword, appendMode);
      if (appendMode) {
        // Merge into existing list without duplicates
        setContestants(prev => {
          const existingIds = new Set(prev.map(c => c.user_id));
          const newOnes = (result.contestants || []).filter(c => !existingIds.has(c.user_id));
          return [...prev, ...newOnes];
        });
        showSuccess(`Added ${result.count} contestants (append mode — leaderboard preserved)`);
      } else {
        setContestants(result.contestants || []);
        showSuccess(`Successfully imported ${result.count} contestants (previous data wiped)`);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload contestant file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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

  React.useEffect(() => {
    loadContestants();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Upload Section */}
      <div className="surface-card p-6 flex flex-col gap-5 border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent flex items-center justify-center transform -rotate-3">
            <FileSpreadsheet size={20} />
          </div>
          <h3 className="text-lg font-bold text-primary font-heading m-0">
            Import Contestants from Excel
          </h3>
        </div>

        <p className="text-sm text-secondary font-sans m-0 leading-relaxed max-w-2xl">
          Upload an Excel file with columns: <strong className="text-primary font-bold">Name</strong> | <strong className="text-primary font-bold">User ID</strong> | <strong className="text-primary font-bold">Unique ID</strong> | <strong className="text-primary font-bold">College Name</strong>.
          {appendMode
            ? <span className="text-success font-bold"> Append mode ON — new contestants will be added without touching existing scores.</span>
            : <span className="text-danger font-bold"> This will <u>replace</u> all existing contestants and wipe the leaderboard.</span>
          }
        </p>

        {/* Append Mode Toggle */}
        <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface-subtle">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={appendMode}
              onChange={e => setAppendMode(e.target.checked)}
              className="w-4 h-4 accent-success cursor-pointer"
            />
            <span className="text-sm font-bold text-primary font-sans">Append Mode</span>
          </label>
          <span className="text-xs text-secondary font-sans">
            {appendMode
              ? '✅ Safe — adds new contestants on top of existing ones. Leaderboard stays intact.'
              : '⚠️ Off — uploading will wipe ALL existing contestants and scores.'}
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileUpload}
        />

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-primary px-5 py-2 font-bold flex items-center gap-2"
            disabled={isUploading}
          >
            <Upload size={16} />
            <span>{isUploading ? 'Importing...' : 'Upload Excel File'}</span>
          </button>

          {contestants.length > 0 && (
            <button
              onClick={handleClear}
              className="btn btn-secondary px-5 py-2 font-bold flex items-center gap-2 text-danger border-danger hover:bg-danger-subtle"
              disabled={isClearing}
            >
              <Trash2 size={16} />
              <span>{isClearing ? 'Wiping...' : 'Wipe All Data'}</span>
            </button>
          )}
        </div>

        {/* Messages */}
        <AnimatePresence>
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 text-success bg-success-subtle p-3 rounded-sketchy border border-success-subtle text-sm font-bold font-sans"
            >
              <Check size={16} />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 text-danger bg-danger-subtle p-3 rounded-sketchy border-2 border-dashed border-danger text-sm font-bold font-sans"
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contestant List */}
      <div className="surface-card p-6 border border-border shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-muted" />
            <h3 className="text-lg font-bold text-primary font-heading m-0">
              Registered Contestants
            </h3>
          </div>
          <span className="badge badge-mono">{contestants.length} imported</span>
        </div>

        {isLoading ? (
          <p className="text-muted text-sm font-sans italic p-4 text-center">Loading contestants...</p>
        ) : contestants.length === 0 ? (
          <div className="text-center p-8 bg-surface-subtle border-2 border-dashed border-border-subtle rounded-sketchy">
            <p className="text-secondary text-sm font-sans m-0">
              No contestants imported. Upload an Excel file to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="ledger-table w-full">
              <thead>
                <tr>
                  <th className="w-10 text-center font-heading text-xs text-secondary">#</th>
                  <th className="font-heading text-xs text-secondary text-left">Name</th>
                  <th className="font-heading text-xs text-secondary text-left">User ID</th>
                  <th className="font-heading text-xs text-secondary text-left">Unique ID</th>
                  <th className="font-heading text-xs text-secondary text-left">College Name</th>
                  <th className="text-center font-heading text-xs text-secondary w-24">Whitelist</th>
                  <th className="text-right font-heading text-xs text-secondary w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {contestants.map((c, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      key={c.user_id || idx}
                      className="group hover:bg-surface-hover transition-colors"
                    >
                      <td className="text-center align-middle">
                        <span className="mono-num text-xs text-dim">
                          {(idx + 1).toString().padStart(2, '0')}
                        </span>
                      </td>
                      <td className="font-bold text-primary text-sm font-sans align-middle">
                        {c.name}
                      </td>
                      <td className="align-middle">
                        <span className="mono-num text-sm text-secondary">
                          {c.user_id}
                        </span>
                      </td>
                      <td className="align-middle">
                        <span className="mono-num text-sm text-muted">
                          {c.unique_id}
                        </span>
                      </td>
                      <td className="align-middle">
                        <span className="text-sm text-secondary font-sans font-medium">
                          {c.college_name || '-'}
                        </span>
                      </td>
                      <td className="text-center align-middle">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleToggleWhitelist(c.user_id, c.is_whitelisted)}
                            className={cn(
                              "btn btn-sm text-xs px-2 py-1 font-bold",
                              c.is_whitelisted ? 'btn-ghost text-success hover:bg-success-subtle' : 'btn-secondary'
                            )}
                            title={c.is_whitelisted ? 'Remove from whitelist' : 'Add to whitelist'}
                          >
                            {c.is_whitelisted ? 'ON' : 'OFF'}
                          </button>
                        </div>
                      </td>
                      <td className="text-right align-middle">
                        <button
                          onClick={() => handleDeleteIndividual(c.user_id)}
                          disabled={isDeletingUserId === c.user_id}
                          className="p-1.5 text-muted hover:text-danger hover:bg-danger-subtle rounded-md transition-colors"
                          title="Delete contestant"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

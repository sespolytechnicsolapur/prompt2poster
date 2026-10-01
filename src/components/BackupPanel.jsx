import React, { useState } from 'react';
import { Download, FileSpreadsheet, ImageDown, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { exportAllDataAsExcel, exportAllPostersAsZip } from '../services/backupService';

export function BackupPanel() {
  const [excelState, setExcelState]   = useState('idle'); // idle | loading | done | error
  const [postersState, setPostersState] = useState('idle');
  const [posterProgress, setPosterProgress] = useState({ downloaded: 0, total: 0, percent: 0 });
  const [excelResult, setExcelResult] = useState(null);
  const [postersResult, setPostersResult] = useState(null);
  const [excelError, setExcelError]   = useState(null);
  const [postersError, setPostersError] = useState(null);

  const handleExcelExport = async () => {
    setExcelState('loading');
    setExcelError(null);
    setExcelResult(null);
    try {
      const result = await exportAllDataAsExcel();
      setExcelResult(result);
      setExcelState('done');
    } catch (err) {
      setExcelError(err.message);
      setExcelState('error');
    }
  };

  const handlePostersExport = async () => {
    setPostersState('loading');
    setPostersError(null);
    setPostersResult(null);
    setPosterProgress({ downloaded: 0, total: 0, percent: 0 });
    try {
      const result = await exportAllPostersAsZip((prog) => setPosterProgress(prog));
      setPostersResult(result);
      setPostersState('done');
    } catch (err) {
      setPostersError(err.message);
      setPostersState('error');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-primary font-heading m-0 mb-1 flex items-center gap-2">
          <Download size={22} className="text-accent" />
          Backup &amp; Export
        </h2>
        <p className="text-sm text-secondary font-sans m-0">
          Download everything stored in Supabase to your local machine.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>

        {/* ── Excel Export ─────────────────────────────────── */}
        <div className="surface-card p-6 flex flex-col gap-4 border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent flex items-center justify-center">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h3 className="font-bold text-primary font-heading m-0 text-base">All Data → Excel</h3>
              <p className="text-xs text-secondary font-sans m-0">Submissions, Leaderboard, Contestants, Topics</p>
            </div>
          </div>

          <ul className="text-xs text-secondary font-sans m-0 pl-4 flex flex-col gap-1" style={{ listStyle: 'disc' }}>
            <li>Every score + AI reasoning for all submissions</li>
            <li>Full leaderboard ranked sheet</li>
            <li>All contestant records</li>
            <li>Topic configuration</li>
          </ul>

          <button
            onClick={handleExcelExport}
            disabled={excelState === 'loading'}
            className="btn btn-primary flex items-center gap-2 justify-center font-bold"
          >
            {excelState === 'loading'
              ? <><Loader size={16} className="animate-spin" /> Exporting...</>
              : <><FileSpreadsheet size={16} /> Download Excel (.xlsx)</>
            }
          </button>

          <AnimatePresence>
            {excelState === 'done' && excelResult && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-success bg-success-subtle p-3 rounded-lg text-xs font-bold font-sans"
              >
                <CheckCircle size={14} />
                Downloaded! {excelResult.submissionsCount} submissions, {excelResult.contestantsCount} contestants.
              </motion.div>
            )}
            {excelState === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-danger bg-danger-subtle p-3 rounded-lg text-xs font-bold font-sans"
              >
                <AlertCircle size={14} /> {excelError}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Posters ZIP Export ───────────────────────────── */}
        <div className="surface-card p-6 flex flex-col gap-4 border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent flex items-center justify-center">
              <ImageDown size={20} />
            </div>
            <div>
              <h3 className="font-bold text-primary font-heading m-0 text-base">All Posters → ZIP</h3>
              <p className="text-xs text-secondary font-sans m-0">Every submitted poster image, ranked &amp; named</p>
            </div>
          </div>

          <ul className="text-xs text-secondary font-sans m-0 pl-4 flex flex-col gap-1" style={{ listStyle: 'disc' }}>
            <li>All poster images in one .zip file</li>
            <li>Files named: <code className="bg-surface-subtle px-1 rounded">001_Name_85pts_abc12345.png</code></li>
            <li>Sorted by score (rank 001 = highest)</li>
            <li>Downloads in batches — may take a minute</li>
          </ul>

          <button
            onClick={handlePostersExport}
            disabled={postersState === 'loading'}
            className="btn btn-primary flex items-center gap-2 justify-center font-bold"
          >
            {postersState === 'loading'
              ? <><Loader size={16} className="animate-spin" /> Downloading...</>
              : <><ImageDown size={16} /> Download All Posters (.zip)</>
            }
          </button>

          {/* Progress bar */}
          <AnimatePresence>
            {postersState === 'loading' && posterProgress.total > 0 && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col gap-1"
              >
                <div className="w-full bg-surface-subtle rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-2 rounded-full bg-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${posterProgress.percent}%` }}
                    transition={{ ease: 'linear' }}
                  />
                </div>
                <span className="text-xs text-secondary font-sans text-right">
                  {posterProgress.downloaded} / {posterProgress.total} posters ({posterProgress.percent}%)
                </span>
              </motion.div>
            )}
            {postersState === 'done' && postersResult && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-success bg-success-subtle p-3 rounded-lg text-xs font-bold font-sans"
              >
                <CheckCircle size={14} />
                ZIP downloaded! {postersResult.downloaded} of {postersResult.total} posters.
              </motion.div>
            )}
            {postersState === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-danger bg-danger-subtle p-3 rounded-lg text-xs font-bold font-sans"
              >
                <AlertCircle size={14} /> {postersError}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

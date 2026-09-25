import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ConfirmDeleteModal({ submission, onConfirm, onClose, isDeleting }) {
  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[999] bg-black/70 flex items-center justify-center p-6 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="surface-card w-full max-w-md p-6 flex flex-col gap-5 shadow-2xl relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-muted hover:text-primary transition-colors rounded-full hover:bg-surface-hover"
          >
            <X size={20} />
          </button>

          {/* Warning Icon */}
          <div className="w-12 h-12 rounded-xl bg-danger-subtle text-danger flex items-center justify-center transform -rotate-6">
            <AlertTriangle size={24} />
          </div>

          {/* Message */}
          <div>
            <h3 className="text-xl font-bold text-primary font-heading mb-2">
              Delete Submission
            </h3>
            <p className="text-secondary text-[0.95rem] leading-relaxed font-sans m-0">
              Are you sure you want to permanently delete the submission by{' '}
              <strong className="text-primary font-bold">{submission?.contestant_name}</strong>?
              This action cannot be undone. The entry will be removed from the database and leaderboard.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
            <button 
              onClick={onClose} 
              className="btn btn-secondary px-5 font-bold" 
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="btn btn-primary bg-danger border-danger text-white hover:-translate-y-1 hover:shadow-lg shadow-danger/20 font-bold px-6 flex items-center gap-2"
              disabled={isDeleting}
            >
              <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

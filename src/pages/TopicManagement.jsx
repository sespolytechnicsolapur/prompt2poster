import React, { useState, useEffect } from 'react';

import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Plus,
  Trash2,
  Shuffle,
  Check,
  ToggleLeft,
  ToggleRight,
  Settings,
  Users,
  FileText,
  ListChecks,
  ShieldCheck,
  Sparkles,
  Database,
  Trophy,
  LayoutDashboard,
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

import { AdminSubmissionTable } from '../components/AdminSubmissionTable';
import { ScoreEditModal } from '../components/ScoreEditModal';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { ContestantManager } from '../components/ContestantManager';
import { VisibilitySettings } from '../components/VisibilitySettings';

import { reEvaluateWithNewScore } from '../services/evaluationService';

import {
  fetchLeaderboard,
  deleteSubmission,
  toggleSubmissionVisibility,
  updateSubmissionScores,
} from '../services/submissionService';

import { cn } from '../lib/utils';


/* =========================================================
   ORGANIZER PASSWORD
========================================================= */

const ORGANIZER_PASSWORD =
  import.meta.env.VITE_ORGANIZER_PASSWORD;


/* =========================================================
   PASSWORD GATE
========================================================= */

function PasswordGate({ onUnlock }) {
  const [input, setInput] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (input === ORGANIZER_PASSWORD) {
      onUnlock();
    } else {
      setError(true);
      setInput('');

      setTimeout(() => {
        setError(false);
      }, 3000);
    }
  };

  return (
    <div className="organizer-login-page">

      {/* Background decoration */}
      <div className="organizer-login-glow organizer-login-glow-one" />
      <div className="organizer-login-glow organizer-login-glow-two" />

      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="organizer-login-card"
      >

        {/* Logo */}
        <div className="organizer-login-logo">
          <div className="organizer-login-logo-icon">
            <Lock size={25} />
          </div>

          <div>
            <span>PROMPT2POSTER</span>
            <strong>ADMIN</strong>
          </div>
        </div>

        {/* Heading */}
        <div className="organizer-login-heading">
          <div className="organizer-login-badge">
            <ShieldCheck size={13} />
            Secure Organizer Access
          </div>

          <h1>Welcome back.</h1>

          <p>
            Enter your administrative password to manage
            your competition.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="organizer-login-form"
        >

          <div className="organizer-login-field">

            <label>
              <Lock size={14} />
              Administrator Password
            </label>

            <div
              className={cn(
                'organizer-password-input',
                error && 'error'
              )}
            >

              <Lock size={17} />

              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Enter password..."
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError(false);
                }}
                autoFocus
              />

              <button
                type="button"
                onClick={() =>
                  setShowPw((value) => !value)
                }
                tabIndex={-1}
              >
                {showPw ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>

            </div>

          </div>


          <AnimatePresence>
            {error && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -6,
                }}
                className="organizer-login-error"
              >
                <AlertCircle size={17} />

                <div>
                  <strong>Access denied</strong>
                  <span>
                    The password you entered is incorrect.
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>


          <button
            type="submit"
            disabled={!input.trim()}
            className="organizer-login-button"
          >
            <Lock size={17} />
            Unlock Organizer Dashboard
          </button>

        </form>


        {/* Footer */}
        <div className="organizer-login-footer">

          <ShieldCheck size={15} />

          <span>
            Authorized organizer access only
          </span>

        </div>

      </motion.div>
    </div>
  );
}


/* =========================================================
   SINGLE TOPIC TAB
========================================================= */

function SingleTopicTab({
  activeTopic,
  onUpdateTopic,
}) {
  const [topicTitle, setTopicTitle] = useState(
    activeTopic?.topic_title || ''
  );

  const [description, setDescription] = useState(
    activeTopic?.description || ''
  );

  const [isSaving, setIsSaving] = useState(false);

  const [successMsg, setSuccessMsg] =
    useState(null);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!topicTitle.trim()) return;

    setIsSaving(true);
    setSuccessMsg(null);

    try {
      await onUpdateTopic(
        topicTitle,
        description
      );

      setSuccessMsg(
        'Active competition topic updated.'
      );

      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);

    } catch (err) {
      console.error(
        'Failed to set active topic:',
        err
      );

    } finally {
      setIsSaving(false);
    }
  };


  return (
    <form
      onSubmit={handleSubmit}
      className="organizer-form-card"
    >

      <div className="organizer-form-header">

        <div className="organizer-form-icon">
          <Sparkles size={19} />
        </div>

        <div>
          <h3>Active Competition Topic</h3>

          <p>
            Configure the topic all contestants will
            use for the competition.
          </p>
        </div>

      </div>


      <div className="organizer-form-fields">

        <div className="organizer-form-field">

          <label>
            Active Topic Title
            <span>Required</span>
          </label>

          <input
            type="text"
            placeholder="e.g. Artificial Intelligence for Ocean Conservation"
            value={topicTitle}
            onChange={(e) =>
              setTopicTitle(e.target.value)
            }
            required
          />

        </div>


        <div className="organizer-form-field">

          <label>
            Topic Description & Directives
            <span>Optional</span>
          </label>

          <textarea
            rows={5}
            placeholder="Provide context or guidelines for contestants and the AI judge..."
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />

        </div>


        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{
                opacity: 0,
                y: -5,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -5,
              }}
              className="organizer-success-message"
            >
              <Check size={17} />

              <span>
                {successMsg}
              </span>
            </motion.div>
          )}
        </AnimatePresence>


        <div className="organizer-form-actions">

          <button
            type="submit"
            className="organizer-primary-button"
            disabled={
              isSaving ||
              !topicTitle.trim()
            }
          >
            {isSaving ? (
              <>
                <span className="organizer-button-loader" />
                Updating...
              </>
            ) : (
              <>
                <Check size={16} />
                Publish Active Topic
              </>
            )}
          </button>

        </div>

      </div>

    </form>
  );
}


/* =========================================================
   TOPIC POOL TAB
========================================================= */

function TopicPoolTab({
  topicPool,
  loadingPool,
  onAddTopic,
  onRemoveTopic,
}) {
  const [newTitle, setNewTitle] =
    useState('');

  const [newDesc, setNewDesc] =
    useState('');

  const [isAdding, setIsAdding] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [successMsg, setSuccessMsg] =
    useState(null);


  const handleAdd = async (e) => {
    e.preventDefault();

    if (!newTitle.trim()) return;

    setIsAdding(true);

    try {

      await onAddTopic(
        newTitle.trim(),
        newDesc.trim()
      );

      setNewTitle('');
      setNewDesc('');

      setSuccessMsg(
        'Topic added to pool.'
      );

      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);

    } catch (err) {
      console.error(
        'Failed to add topic:',
        err
      );

    } finally {
      setIsAdding(false);
    }
  };


  const handleRemove = async (id) => {
    setDeletingId(id);

    try {
      await onRemoveTopic(id);
    } catch (err) {
      console.error(err);
    }

    setDeletingId(null);
  };


  return (
    <div className="organizer-pool-layout">

      {/* ADD TOPIC */}

      <form
        onSubmit={handleAdd}
        className="organizer-form-card"
      >

        <div className="organizer-form-header">

          <div className="organizer-form-icon">
            <Plus size={19} />
          </div>

          <div>
            <h3>Add Topic to Pool</h3>

            <p>
              Create a topic that can be
              automatically assigned to contestants.
            </p>
          </div>

        </div>


        <div className="organizer-form-fields">

          <div className="organizer-form-field">

            <label>
              Topic Title
              <span>Required</span>
            </label>

            <input
              type="text"
              placeholder="e.g. AI in Healthcare: Precision Medicine"
              value={newTitle}
              onChange={(e) =>
                setNewTitle(e.target.value)
              }
              required
            />

          </div>


          <div className="organizer-form-field">

            <label>
              Description
              <span>Optional</span>
            </label>

            <input
              type="text"
              placeholder="Brief context for contestants and AI judge..."
              value={newDesc}
              onChange={(e) =>
                setNewDesc(e.target.value)
              }
            />

          </div>


          <AnimatePresence>
            {successMsg && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -5,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -5,
                }}
                className="organizer-success-message"
              >
                <Check size={17} />

                <span>
                  {successMsg}
                </span>
              </motion.div>
            )}
          </AnimatePresence>


          <button
            type="submit"
            className="organizer-secondary-button"
            disabled={
              isAdding ||
              !newTitle.trim()
            }
          >
            <Plus size={16} />

            {isAdding
              ? 'Adding...'
              : 'Add to Pool'}
          </button>

        </div>

      </form>


      {/* POOL */}

      <div className="organizer-list-card">

        <div className="organizer-list-header">

          <div>
            <span>CONFIGURATION</span>

            <h3>
              Configured Pool Topics
            </h3>
          </div>

          <div className="organizer-count-badge">
            <Database size={13} />
            {topicPool.length}
          </div>

        </div>


        {loadingPool ? (

          <div className="organizer-empty-state">
            <div className="organizer-spinner" />

            <span>
              Loading pool topics...
            </span>
          </div>

        ) : topicPool.length === 0 ? (

          <div className="organizer-empty-state dashed">

            <div className="organizer-empty-icon">
              <FileText size={23} />
            </div>

            <strong>
              No topics configured
            </strong>

            <span>
              Add topics above to enable
              multi-topic assignment.
            </span>

          </div>

        ) : (

          <div className="organizer-topic-list">

            {topicPool.map((topic, index) => (

              <motion.div
                key={topic.id}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.04,
                }}
                className="organizer-topic-item"
              >

                <div className="organizer-topic-number">
                  {(index + 1)
                    .toString()
                    .padStart(2, '0')}
                </div>


                <div className="organizer-topic-details">

                  <strong>
                    {topic.topic_title}
                  </strong>

                  {topic.description && (
                    <span>
                      {topic.description}
                    </span>
                  )}

                </div>


                <button
                  type="button"
                  onClick={() =>
                    handleRemove(topic.id)
                  }
                  disabled={
                    deletingId === topic.id
                  }
                  className="organizer-delete-button"
                  title="Remove topic"
                >
                  {deletingId === topic.id ? (
                    <span className="organizer-button-loader" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>

              </motion.div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}


/* =========================================================
   SUBMISSIONS TAB
========================================================= */

function SubmissionsTab({
  adminPassword,
  onViewDetails,
  whitelistedUserIds,
  onToggleUserWhitelist,
}) {

  const [submissions, setSubmissions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [editTarget, setEditTarget] =
    useState(null);

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [isDeleting, setIsDeleting] =
    useState(false);


  const loadAll = async () => {

    setLoading(true);

    try {

      const list =
        await fetchLeaderboard({
          includeHidden: true,
        });

      setSubmissions(list);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadAll();
  }, []);


  const handleToggleVisibility =
    async (id, isHidden) => {

      await toggleSubmissionVisibility(
        id,
        isHidden
      );

      setSubmissions((prev) =>
        prev.map((submission) =>
          submission.id === id
            ? {
                ...submission,
                is_hidden: isHidden,
              }
            : submission
        )
      );
    };


  const handleDelete = async () => {

    if (!deleteTarget) return;

    setIsDeleting(true);

    try {

      await deleteSubmission(
        deleteTarget.id
      );

      setSubmissions((prev) =>
        prev.filter(
          (submission) =>
            submission.id !==
            deleteTarget.id
        )
      );

      setDeleteTarget(null);

    } catch (err) {

      console.error(err);

    } finally {

      setIsDeleting(false);

    }
  };


  const handleReEvaluate =
    async (newTotalScore) => {

      if (!editTarget) {
        throw new Error(
          'No submission selected'
        );
      }

      const result =
        await reEvaluateWithNewScore({
          newTotalScore,
          topic: editTarget.topic,
          contestantName:
            editTarget.contestant_name,
          adminPassword,
        });

      return result.evaluation;
    };


  const handleSaveScores =
    async (newEvaluation) => {

      if (!editTarget) return;

      const previousScores = {
        total_score:
          editTarget.total_score,

        relevance:
          editTarget.relevance_to_topic_score,

        hierarchy:
          editTarget.visual_hierarchy_score,

        typography:
          editTarget.typography_readability_score,

        composition:
          editTarget.composition_layout_score,

        creativity:
          editTarget.creativity_originality_score,

        color:
          editTarget.color_usage_score,

        communication:
          editTarget.overall_communication_score,
      };


      await updateSubmissionScores(
        editTarget.id,
        newEvaluation,
        previousScores
      );

      await loadAll();

      setEditTarget(null);
    };


  if (loading) {

    return (
      <div className="organizer-loading-card">

        <div className="organizer-spinner large" />

        <div>
          <strong>
            Loading submissions
          </strong>

          <span>
            Fetching the latest competition
            submissions...
          </span>
        </div>

      </div>
    );
  }


  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
    >

      <div className="organizer-submission-summary">

        <div className="organizer-summary-item">

          <div className="organizer-summary-icon">
            <ListChecks size={18} />
          </div>

          <div>
            <span>Total Submissions</span>
            <strong>
              {submissions.length}
            </strong>
          </div>

        </div>


        <div className="organizer-summary-item">

          <div className="organizer-summary-icon green">
            <Check size={18} />
          </div>

          <div>
            <span>Visible</span>

            <strong>
              {
                submissions.filter(
                  (s) => !s.is_hidden
                ).length
              }
            </strong>
          </div>

        </div>


        <div className="organizer-summary-item">

          <div className="organizer-summary-icon purple">
            <Trophy size={18} />
          </div>

          <div>
            <span>Evaluated</span>

            <strong>
              {
                submissions.filter(
                  (s) =>
                    s.total_score !==
                    null
                ).length
              }
            </strong>
          </div>

        </div>

      </div>


      <AdminSubmissionTable
        submissions={submissions}
        onEditScores={setEditTarget}
        onToggleVisibility={
          handleToggleVisibility
        }
        onDelete={setDeleteTarget}
        onViewDetails={onViewDetails}
        whitelistedUserIds={
          whitelistedUserIds
        }
        onToggleUserWhitelist={
          onToggleUserWhitelist
        }
      />


      {/* SCORE MODAL */}

      {editTarget && (
        <ScoreEditModal
          submission={editTarget}
          onSave={handleSaveScores}
          onReEvaluate={
            handleReEvaluate
          }
          onClose={() =>
            setEditTarget(null)
          }
        />
      )}


      {/* DELETE MODAL */}

      {deleteTarget && (
        <ConfirmDeleteModal
          submission={deleteTarget}
          onConfirm={handleDelete}
          onClose={() =>
            setDeleteTarget(null)
          }
          isDeleting={isDeleting}
        />
      )}

    </motion.div>
  );
}


/* =========================================================
   MAIN ORGANIZER PAGE
========================================================= */

export function TopicManagement({
  activeTopic,
  onUpdateTopic,

  topicPool,
  loadingPool,
  poolMode,
  onChangePoolMode,

  onAddTopic,
  onRemoveTopic,

  leaderboardVisible,
  topicVisible,

  onToggleLeaderboard,
  onToggleTopic,

  onViewDetails,

  isAdmin,
  setIsAdmin,

  whitelistedUserIds,
  onToggleUserWhitelist,

  roundSettings,
  onSaveRoundSettings,
}) {

  const [unlocked, setUnlocked] =
    useState(
      isAdmin || !ORGANIZER_PASSWORD
    );

  const [activeTab, setActiveTab] =
    useState('topics');

  const [adminPassword, setAdminPassword] =
    useState(
      isAdmin
        ? ORGANIZER_PASSWORD
        : ''
    );


  /* =======================================================
     SYNC ADMIN STATE
  ======================================================= */

  useEffect(() => {

    if (isAdmin) {

      setUnlocked(true);

      setAdminPassword(
        ORGANIZER_PASSWORD
      );

    }

  }, [isAdmin]);


  /* =======================================================
     UNLOCK
  ======================================================= */

  const handleUnlock = () => {

    setUnlocked(true);

    setAdminPassword(
      ORGANIZER_PASSWORD
    );

    if (setIsAdmin) {
      setIsAdmin(true);
    }
  };


  if (!unlocked) {
    return (
      <PasswordGate
        onUnlock={handleUnlock}
      />
    );
  }


  const isPool =
    poolMode === 'pool';


  /* =======================================================
     TABS
  ======================================================= */

  const tabs = [
    {
      id: 'topics',
      label: 'Topics',
      icon: FileText,
    },
    {
      id: 'contestants',
      label: 'Contestants',
      icon: Users,
    },
    {
      id: 'submissions',
      label: 'Submissions',
      icon: ListChecks,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];


  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="organizer-page"
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="organizer-header">

        <div className="organizer-header-left">

          <div className="organizer-brand-icon">
            <LayoutDashboard size={23} />
          </div>


          <div>

            <div className="organizer-eyebrow">
              PROMPT2POSTER · ADMIN
            </div>

            <h1>
              Organizer Dashboard
            </h1>

            <p>
              Manage topics, contestants,
              submissions and competition
              settings.
            </p>

          </div>

        </div>


        <div className="organizer-secure-badge">

          <span className="organizer-status-dot" />

          <Lock size={13} />

          Secure Access

        </div>

      </div>


      {/* =================================================
          MAIN NAVIGATION
      ================================================= */}

      <div className="organizer-tabs">

        {tabs.map((tab) => {

          const Icon = tab.icon;

          const isActive =
            activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              className={cn(
                'organizer-tab',
                isActive &&
                  'active'
              )}
              onClick={() =>
                setActiveTab(tab.id)
              }
            >

              <span className="organizer-tab-icon">
                <Icon size={17} />
              </span>

              <span>
                {tab.label}
              </span>

              {tab.id ===
                'submissions' &&
                activeTab !==
                  'submissions' && (
                  <span className="organizer-tab-dot" />
                )}

            </button>
          );
        })}

      </div>


      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="organizer-content">


        {/* =================================================
            TOPICS
        ================================================= */}

        {activeTab === 'topics' && (

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="organizer-tab-content"
          >

            <div className="organizer-content-heading">

              <div>

                <span>
                  COMPETITION MANAGEMENT
                </span>

                <h2>
                  Topics
                </h2>

                <p>
                  Configure the topic contestants
                  will use for their poster
                  submissions.
                </p>

              </div>


              <div className="organizer-heading-icon">
                <FileText size={20} />
              </div>

            </div>


            {/* Assignment Mode */}

            <div className="organizer-mode-card">

              <div className="organizer-mode-icon">

                {isPool ? (
                  <Shuffle size={20} />
                ) : (
                  <FileText size={20} />
                )}

              </div>


              <div className="organizer-mode-info">

                <span>
                  ASSIGNMENT MODE
                </span>

                <strong>
                  {isPool
                    ? 'Random Topic Pool'
                    : 'Single Active Topic'}
                </strong>

                <p>
                  {isPool
                    ? 'Contestants receive a topic from the configured pool.'
                    : 'All contestants submit against the same active topic.'}
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  onChangePoolMode(
                    isPool
                      ? 'single'
                      : 'pool'
                  )
                }
                className="organizer-mode-toggle"
              >

                {isPool ? (
                  <ToggleRight
                    size={21}
                  />
                ) : (
                  <ToggleLeft
                    size={21}
                  />
                )}

                <span>
                  Switch to{' '}
                  {isPool
                    ? 'Single'
                    : 'Pool'}
                </span>

              </button>

            </div>


            {/* Topic sub-tabs */}

            <div className="organizer-subtabs">

              <button
                type="button"
                className={
                  !isPool
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  onChangePoolMode(
                    'single'
                  )
                }
              >
                Single Topic
              </button>


              <button
                type="button"
                className={
                  isPool
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  onChangePoolMode(
                    'pool'
                  )
                }
              >

                <Shuffle size={15} />

                Topic Pool

                {topicPool.length >
                  0 && (
                  <span>
                    {topicPool.length}
                  </span>
                )}

              </button>

            </div>


            {/* Topic content */}

            <div className="organizer-panel-body">

              {!isPool && (
                <SingleTopicTab
                  activeTopic={
                    activeTopic
                  }
                  onUpdateTopic={
                    onUpdateTopic
                  }
                />
              )}


              {isPool && (
                <TopicPoolTab
                  topicPool={
                    topicPool
                  }
                  loadingPool={
                    loadingPool
                  }
                  onAddTopic={
                    onAddTopic
                  }
                  onRemoveTopic={
                    onRemoveTopic
                  }
                />
              )}

            </div>

          </motion.div>

        )}


        {/* =================================================
            CONTESTANTS
        ================================================= */}

        {activeTab ===
          'contestants' && (

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="organizer-tab-content"
          >

            <div className="organizer-content-heading">

              <div>

                <span>
                  PARTICIPANT MANAGEMENT
                </span>

                <h2>
                  Contestants
                </h2>

                <p>
                  Manage contestant access
                  and whitelist permissions.
                </p>

              </div>


              <div className="organizer-heading-icon">
                <Users size={20} />
              </div>

            </div>


            <ContestantManager
              adminPassword={
                adminPassword
              }
              onToggleUserWhitelist={
                onToggleUserWhitelist
              }
            />

          </motion.div>

        )}


        {/* =================================================
            SUBMISSIONS
        ================================================= */}

        {activeTab ===
          'submissions' && (

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="organizer-tab-content"
          >

            <div className="organizer-content-heading">

              <div>

                <span>
                  JUDGING & REVIEW
                </span>

                <h2>
                  Submissions
                </h2>

                <p>
                  Review, score, hide or
                  delete contestant
                  submissions.
                </p>

              </div>


              <div className="organizer-heading-icon">
                <ListChecks size={20} />
              </div>

            </div>


            <SubmissionsTab
              adminPassword={
                adminPassword
              }
              onViewDetails={
                onViewDetails
              }
              whitelistedUserIds={
                whitelistedUserIds
              }
              onToggleUserWhitelist={
                onToggleUserWhitelist
              }
            />

          </motion.div>

        )}


        {/* =================================================
            SETTINGS
        ================================================= */}

        {activeTab ===
          'settings' && (

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="organizer-tab-content"
          >

            <div className="organizer-content-heading">

              <div>

                <span>
                  SYSTEM CONFIGURATION
                </span>

                <h2>
                  Settings
                </h2>

                <p>
                  Control topic, leaderboard
                  and round visibility.
                </p>

              </div>


              <div className="organizer-heading-icon">
                <Settings size={20} />
              </div>

            </div>


            <VisibilitySettings
              leaderboardVisible={
                leaderboardVisible
              }
              topicVisible={
                topicVisible
              }
              onToggleLeaderboard={
                onToggleLeaderboard
              }
              onToggleTopic={
                onToggleTopic
              }
              roundSettings={
                roundSettings
              }
              onSaveRoundSettings={
                onSaveRoundSettings
              }
            />

          </motion.div>

        )}

      </div>

    </motion.div>
  );
}


/* =========================================================
   PREMIUM ORGANIZER CSS
========================================================= */

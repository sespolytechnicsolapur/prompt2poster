import React, {
  useState,
  useLayoutEffect,
  useRef,
} from 'react';

import {
  Search,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  ChevronRight,
  X,
} from 'lucide-react';

import { formatDate } from '../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';


export function AdminSubmissionTable({
  submissions = [],
  onEditScores,
  onToggleVisibility,
  onDelete,
  onViewDetails,
  whitelistedUserIds,
  onToggleUserWhitelist,
}) {

  /* =========================================================
     STATE
  ========================================================== */

  const [searchTerm, setSearchTerm] = useState('');

  const tableScrollRef = useRef(null);


  /* =========================================================
     FORCE TABLE TO START FROM LEFT
  ========================================================== */

  useLayoutEffect(() => {

    const resetScroll = () => {

      if (tableScrollRef.current) {
        tableScrollRef.current.scrollLeft = 0;
      }

    };

    resetScroll();

    requestAnimationFrame(() => {
      resetScroll();
    });

    const timer = setTimeout(() => {
      resetScroll();
    }, 100);

    return () => {
      clearTimeout(timer);
    };

  }, []);


  /* =========================================================
     SEARCH
  ========================================================== */

  const filtered = submissions.filter((item) => {

    const query = searchTerm
      .toLowerCase()
      .trim();

    return (
      (item.contestant_name || '')
        .toLowerCase()
        .includes(query) ||

      (item.topic || '')
        .toLowerCase()
        .includes(query) ||

      (item.college_name || '')
        .toLowerCase()
        .includes(query)
    );

  });


  /* =========================================================
     EMPTY STATE
  ========================================================== */

  if (submissions.length === 0) {

    return (
      <div className="surface-card p-12 text-center shadow-sketchy">

        <h3 className="text-xl font-bold text-primary font-heading mb-2">
          No Submissions
        </h3>

        <p className="text-secondary font-sans text-sm max-w-sm mx-auto">
          Submissions will appear here as contestants submit
          their poster designs.
        </p>

      </div>
    );

  }


  /* =========================================================
     MAIN
  ========================================================== */

  return (
    <>
      <div className="surface-card submission-table-card shadow-sketchy">


        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="submission-table-header">


          {/* =================================================
              TITLE
          ================================================== */}

          <div className="submission-table-title">

            <h3 className="text-lg font-bold text-primary font-heading m-0">
              All Submissions
            </h3>


            <span className="badge badge-mono shadow-sm">
              {submissions.length} total
            </span>


            {submissions.filter(
              (s) => s.is_hidden
            ).length > 0 && (

              <span className="badge badge-mono bg-warning-subtle text-warning border-warning shadow-sm">

                {
                  submissions.filter(
                    (s) => s.is_hidden
                  ).length
                } hidden

              </span>

            )}

          </div>



          {/* =================================================
              SEARCH
          ================================================== */}

          <div className="submission-search">

            <Search
              size={18}
              strokeWidth={2}
              className="submission-search-icon"
            />


            <input
              type="text"
              placeholder="Search contestant..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="submission-search-input"
              aria-label="Search submissions"
            />


            {searchTerm && (

              <button
                type="button"
                className="submission-search-clear"
                onClick={() =>
                  setSearchTerm('')
                }
                aria-label="Clear search"
                title="Clear search"
              >

                <X size={15} />

              </button>

            )}

          </div>

        </div>



        {/* =====================================================
            TABLE SCROLL CONTAINER
        ====================================================== */}

        <div
          ref={tableScrollRef}
          className="submission-table-scroll"
        >


          <table className="ledger-table submission-table">


            {/* =================================================
                TABLE HEADER
            ================================================== */}

            <thead>

              <tr>

                <th className="submission-col-number">
                  #
                </th>


                <th className="submission-col-contestant">
                  Contestant
                </th>


                <th className="submission-col-college">
                  College
                </th>


                <th className="submission-col-score">
                  Score
                </th>


                <th className="submission-col-status">
                  Status
                </th>


                <th className="submission-col-whitelist">
                  Whitelist
                </th>


                <th className="submission-col-actions">
                  Actions
                </th>

              </tr>

            </thead>



            {/* =================================================
                TABLE BODY
            ================================================== */}

            <tbody>

              <AnimatePresence mode="popLayout">

                {filtered.length > 0 ? (

                  filtered.map((sub, index) => (

                    <motion.tr
                      key={sub.id}

                      initial={{
                        opacity: 0,
                        y: 10,
                      }}

                      animate={{
                        opacity:
                          sub.is_hidden
                            ? 0.5
                            : 1,

                        y: 0,
                      }}

                      exit={{
                        opacity: 0,
                        y: -5,
                      }}

                      transition={{
                        duration: 0.2,
                      }}

                      className="group hover:bg-surface-hover transition-colors"
                    >


                      {/* =================================================
                          NUMBER
                      ================================================== */}

                      <td className="text-center align-middle">

                        <span className="mono-num text-sm text-dim">

                          {String(index + 1).padStart(
                            2,
                            '0'
                          )}

                        </span>

                      </td>



                      {/* =================================================
                          CONTESTANT
                      ================================================== */}

                      <td className="align-middle">

                        <div className="submission-contestant">

                          <div className="font-bold text-primary text-sm font-sans">
                            {sub.contestant_name}
                          </div>

                          <div className="text-xs text-muted font-sans mt-0.5">
                            {formatDate(
                              sub.created_at
                            )}
                          </div>

                        </div>

                      </td>



                      {/* =================================================
                          COLLEGE
                      ================================================== */}

                      <td className="align-middle">

                        <div className="text-sm text-secondary font-sans submission-college-name">

                          {sub.college_name || '—'}

                        </div>

                      </td>



                      {/* =================================================
                          SCORE
                      ================================================== */}

                      <td className="text-right align-middle">

                        <span className="mono-num text-lg font-bold text-primary mr-0.5">

                          {sub.total_score}

                        </span>

                        <span className="mono-num text-xs text-dim">
                          /100
                        </span>


                        {sub.score_edit_log &&
                          sub.score_edit_log.length > 0 && (

                            <span className="submission-edited-label">
                              (edited)
                            </span>

                          )}

                      </td>



                      {/* =================================================
                          STATUS
                      ================================================== */}

                      <td className="text-center align-middle">

                        <span
                          className={cn(

                            'badge badge-mono text-[10px] uppercase tracking-wider py-1',

                            sub.is_hidden
                              ? 'opacity-70'
                              : 'bg-success-subtle text-success border-success'

                          )}
                        >

                          {sub.is_hidden
                            ? 'Hidden'
                            : 'Visible'}

                        </span>

                      </td>



                      {/* =================================================
                          WHITELIST
                      ================================================== */}

                      <td className="text-center align-middle">

                        <button

                          onClick={(e) => {

                            e.stopPropagation();

                            onToggleUserWhitelist(
                              sub.submitted_by_user_id,

                              !whitelistedUserIds?.has(
                                sub.submitted_by_user_id
                              )
                            );

                          }}

                          className={cn(

                            'btn btn-sm text-xs px-2 py-1 font-bold',

                            whitelistedUserIds?.has(
                              sub.submitted_by_user_id
                            )

                              ? 'btn-ghost text-success hover:bg-success-subtle'

                              : 'btn-secondary'

                          )}

                          title={

                            whitelistedUserIds?.has(
                              sub.submitted_by_user_id
                            )

                              ? 'Remove from whitelist'

                              : 'Add to whitelist'

                          }
                        >

                          {
                            whitelistedUserIds?.has(
                              sub.submitted_by_user_id
                            )
                              ? 'ON'
                              : 'OFF'
                          }

                        </button>

                      </td>



                      {/* =================================================
                          ACTIONS
                      ================================================== */}

                      <td className="text-right align-middle">

                        <div className="submission-actions">


                          {/* EDIT */}

                          <button

                            onClick={(e) => {

                              e.stopPropagation();

                              onEditScores(sub);

                            }}

                            className="submission-action-btn"

                            title="Edit scores"
                          >

                            <Edit3 size={16} />

                          </button>



                          {/* HIDE / SHOW */}

                          <button

                            onClick={(e) => {

                              e.stopPropagation();

                              onToggleVisibility(
                                sub.id,
                                !sub.is_hidden
                              );

                            }}

                            className="submission-action-btn"

                            title={
                              sub.is_hidden
                                ? 'Unhide from leaderboard'
                                : 'Hide from leaderboard'
                            }
                          >

                            {sub.is_hidden ? (
                              <Eye size={16} />
                            ) : (
                              <EyeOff size={16} />
                            )}

                          </button>



                          {/* DELETE */}

                          <button

                            onClick={(e) => {

                              e.stopPropagation();

                              onDelete(sub);

                            }}

                            className="submission-action-btn submission-delete-btn"

                            title="Delete submission"
                          >

                            <Trash2 size={16} />

                          </button>



                          {/* DETAILS */}

                          <button

                            onClick={(e) => {

                              e.stopPropagation();

                              onViewDetails(sub.id);

                            }}

                            className="submission-action-btn submission-view-btn"

                            title="View details"
                          >

                            <ChevronRight size={16} />

                          </button>

                        </div>

                      </td>

                    </motion.tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan={7}
                      className="text-center py-12 text-muted font-sans text-sm"
                    >

                      No submissions matching "{searchTerm}"

                    </td>

                  </tr>

                )}

              </AnimatePresence>

            </tbody>

          </table>

        </div>



        {/* =====================================================
            MOBILE SCROLL INDICATOR
        ====================================================== */}

        <div className="submission-scroll-hint">

          <span>
            ←
          </span>

          <span>
            Swipe horizontally to view more
          </span>

          <span>
            →
          </span>

        </div>


      </div>



      {/* =========================================================
          STYLES
      ========================================================== */}

      <style>{`

        /* =====================================================
           CARD
        ====================================================== */

        .submission-table-card {

          width: 100% !important;

          max-width: 100% !important;

          overflow: hidden !important;

          box-sizing: border-box;

        }



        /* =====================================================
           HEADER
        ====================================================== */

        .submission-table-header {

          width: 100%;

          padding: 20px;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 18px;

          border-bottom:
            2px dashed
            var(--border, #e5e7eb);

          background:
            var(
              --surface-subtle,
              #fafafa
            );

          box-sizing: border-box;

        }



        /* =====================================================
           TITLE
        ====================================================== */

        .submission-table-title {

          display: flex;

          align-items: center;

          gap: 12px;

          min-width: 0;

          flex-shrink: 1;

        }



        /* =====================================================
           SEARCH
        ====================================================== */

        .submission-search {

          position: relative;

          width: 100%;

          max-width: 345px;

          height: 48px;

          display: flex;

          align-items: center;

          flex-shrink: 0;

          background: #ffffff;

          border:
            1px solid
            #e5e7eb;

          border-radius: 14px;

          box-sizing: border-box;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;

        }



        .submission-search:hover {

          border-color: #d1d5db;

        }



        .submission-search:focus-within {

          border-color: #111827;

          box-shadow:
            0 0 0 3px
            rgba(
              17,
              24,
              39,
              0.07
            );

        }



        .submission-search-icon {

          position: absolute;

          left: 16px;

          top: 50%;

          transform:
            translateY(-50%);

          color: #9ca3af;

          pointer-events: none;

          z-index: 2;

        }



        .submission-search-input {

          width: 100%;

          height: 100%;

          border: none;

          outline: none;

          background: transparent;

          padding:
            0 44px 0 46px;

          font-family: inherit;

          font-size: 14px;

          font-weight: 500;

          color: #111827;

          box-sizing: border-box;

        }



        .submission-search-input::placeholder {

          color: #9ca3af;

          font-weight: 400;

        }



        .submission-search-clear {

          position: absolute;

          right: 10px;

          top: 50%;

          transform:
            translateY(-50%);

          width: 28px;

          height: 28px;

          display: flex;

          align-items: center;

          justify-content: center;

          border: none;

          border-radius: 8px;

          background: #f3f4f6;

          color: #6b7280;

          cursor: pointer;

        }



        .submission-search-clear:hover {

          background: #e5e7eb;

          color: #111827;

        }



        /* =====================================================
           TABLE SCROLL CONTAINER
        ====================================================== */

        .submission-table-scroll {

          position: relative !important;

          display: block !important;

          width: 100% !important;

          max-width: 100% !important;

          height: auto !important;

          overflow-x: auto !important;

          overflow-y: hidden !important;

          margin: 0 !important;

          padding: 0 !important;

          direction: ltr !important;

          text-align: left !important;

          transform: none !important;

          touch-action: pan-x !important;

          -webkit-overflow-scrolling: touch !important;

          overscroll-behavior-x: contain;

          box-sizing: border-box;

          scrollbar-width: auto;

          scrollbar-color:
            #b8c0cc
            #f5f5f5;

        }



        /* =====================================================
           SCROLLBAR
        ====================================================== */

        .submission-table-scroll::-webkit-scrollbar {

          height: 8px;

        }



        .submission-table-scroll::-webkit-scrollbar-track {

          background: #f5f5f5;

        }



        .submission-table-scroll::-webkit-scrollbar-thumb {

          background: #b8c0cc;

          border-radius: 999px;

        }



        .submission-table-scroll::-webkit-scrollbar-thumb:hover {

          background: #8f99a8;

        }



        /* =====================================================
           TABLE
        ====================================================== */

        .submission-table {

          position: relative !important;

          display: table !important;

          left: 0 !important;

          right: auto !important;

          margin-left: 0 !important;

          margin-right: 0 !important;

          padding-left: 0 !important;

          padding-right: 0 !important;

          transform: none !important;

          direction: ltr !important;

          text-align: left !important;

          width: 900px !important;

          min-width: 900px !important;

          max-width: none !important;

          table-layout: fixed !important;

          border-collapse: collapse;

        }



        /* Override existing ledger table */

        .ledger-table.submission-table {

          position: relative !important;

          left: 0 !important;

          right: auto !important;

          margin-left: 0 !important;

          margin-right: 0 !important;

          transform: none !important;

          width: 900px !important;

          min-width: 900px !important;

          max-width: none !important;

        }



        /* =====================================================
           TABLE CELLS
        ====================================================== */

        .submission-table th,

        .submission-table td {

          white-space: nowrap !important;

        }



        /* =====================================================
           COLUMN WIDTHS
        ====================================================== */

        .submission-col-number {

          width: 55px !important;

          min-width: 55px !important;

          text-align: center !important;

        }



        .submission-col-contestant {

          width: 220px !important;

          min-width: 220px !important;

          text-align: left !important;

        }



        .submission-col-college {

          width: 160px !important;

          min-width: 160px !important;

          text-align: left !important;

        }



        .submission-col-score {

          width: 120px !important;

          min-width: 120px !important;

          text-align: right !important;

        }



        .submission-col-status {

          width: 110px !important;

          min-width: 110px !important;

          text-align: center !important;

        }



        .submission-col-whitelist {

          width: 110px !important;

          min-width: 110px !important;

          text-align: center !important;

        }



        .submission-col-actions {

          width: 150px !important;

          min-width: 150px !important;

          text-align: right !important;

        }



        /* =====================================================
           CONTESTANT
        ====================================================== */

        .submission-contestant {

          min-width: 180px;

        }



        .submission-college-name {

          max-width: 160px;

          overflow: hidden;

          text-overflow: ellipsis;

        }



        /* =====================================================
           EDITED
        ====================================================== */

        .submission-edited-label {

          display: inline-block;

          margin-left: 8px;

          font-size: 10px;

          color: #d97706;

          font-weight: 700;

          text-transform: uppercase;

          letter-spacing: 0.08em;

        }



        /* =====================================================
           ACTIONS
        ====================================================== */

        .submission-actions {

          display: flex;

          align-items: center;

          justify-content: flex-end;

          gap: 4px;

        }



        .submission-action-btn {

          width: 32px;

          height: 32px;

          display: flex;

          align-items: center;

          justify-content: center;

          padding: 0;

          border:
            1px solid
            transparent;

          border-radius: 8px;

          background: transparent;

          color: #6b7280;

          cursor: pointer;

          transition:
            color 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease;

        }



        .submission-action-btn:hover {

          color: #111827;

          background: #f3f4f6;

          border-color: #e5e7eb;

        }



        .submission-delete-btn:hover {

          color: #dc2626;

          background: #fef2f2;

          border-color: #fecaca;

        }



        .submission-view-btn {

          margin-left: 3px;

        }



        /* =====================================================
           MOBILE
        ====================================================== */

        @media (max-width: 768px) {

          .submission-table-header {

            padding: 16px;

            flex-direction: column;

            align-items: stretch;

            gap: 14px;

          }



          .submission-table-title {

            width: 100%;

            overflow-x: auto;

            scrollbar-width: none;

          }



          .submission-table-title::-webkit-scrollbar {

            display: none;

          }



          .submission-search {

            width: 100%;

            max-width: none;

            height: 50px;

            border-radius: 14px;

          }



          .submission-search-icon {

            left: 15px;

          }



          .submission-search-input {

            padding-left: 44px;

            padding-right: 42px;

            font-size: 14px;

          }



          /* =================================================
             FORCE TABLE LEFT
          ================================================== */

          .submission-table-scroll {

            width: 100% !important;

            max-width: 100% !important;

            overflow-x: scroll !important;

            overflow-y: hidden !important;

            margin-left: 0 !important;

            margin-right: 0 !important;

            padding-left: 0 !important;

            padding-right: 0 !important;

            touch-action: pan-x !important;

          }



          .submission-table {

            width: 900px !important;

            min-width: 900px !important;

            margin-left: 0 !important;

            margin-right: 0 !important;

            transform: none !important;

            left: 0 !important;

          }



          .ledger-table.submission-table {

            width: 900px !important;

            min-width: 900px !important;

            margin-left: 0 !important;

            margin-right: 0 !important;

            transform: none !important;

            left: 0 !important;

          }



          .submission-scroll-hint {

            display: flex;

          }

        }



        /* =====================================================
           481px / SMALL MOBILE
        ====================================================== */

        @media (max-width: 500px) {

          .submission-table-card {

            width: 100% !important;

            max-width: 100% !important;

          }



          .submission-table-header {

            padding: 14px;

          }



          .submission-search {

            height: 48px;

            border-radius: 13px;

          }



          .submission-search-input {

            font-size: 13.5px;

            padding-left: 43px;

            padding-right: 40px;

          }



          .submission-table-scroll {

            display: block !important;

            width: 100% !important;

            max-width: 100% !important;

            overflow-x: scroll !important;

            overflow-y: hidden !important;

            margin: 0 !important;

            padding: 0 !important;

            touch-action: pan-x !important;

            -webkit-overflow-scrolling: touch !important;

          }



          .submission-table {

            display: table !important;

            width: 900px !important;

            min-width: 900px !important;

            margin: 0 !important;

            padding: 0 !important;

            transform: none !important;

            left: 0 !important;

          }

        }



        /* =====================================================
           MOBILE SCROLL HINT
        ====================================================== */

        .submission-scroll-hint {

          display: none;

          align-items: center;

          justify-content: center;

          gap: 8px;

          padding: 9px 12px;

          border-top:
            1px solid
            #f1f5f9;

          background: #fafafa;

          color: #94a3b8;

          font-size: 10px;

          font-weight: 600;

          letter-spacing: 0.04em;

          text-transform: uppercase;

        }



        .submission-scroll-hint span {

          color: #64748b;

        }

      `}</style>
    </>
  );
}
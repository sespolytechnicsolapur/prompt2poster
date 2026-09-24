import React, { useState, useEffect } from 'react';
import { useCompetition } from './hooks/useCompetition';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Submit } from './pages/Submit';
import { Leaderboard } from './pages/Leaderboard';
import { SubmissionDetails } from './pages/SubmissionDetails';
import { TopicManagement } from './pages/TopicManagement';
import { Login } from './pages/Login';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [previousPage, setPreviousPage] = useState('home');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [activeSubmissionRecord, setActiveSubmissionRecord] = useState(null);

  // ── Theme State ─────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('prompt2poster_theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('prompt2poster_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  // ── Competition State (hook) ────────────────────────────────────────────
  const {
    activeTopic, loadingTopic, changeTopic,

    topicPool, loadingPool, poolMode,
    changePoolMode, addTopic, removeTopic,

    leaderboard, loadingLeaderboard, refreshLeaderboard,

    contestant, isAdmin, setIsAdmin,
    handleLogin, handleLogout,

    leaderboardVisible, topicVisible,
    toggleLeaderboardVisibility, toggleTopicVisibility,
  } = useCompetition();

  // ── Navigation ──────────────────────────────────────────────────────────
  const handleSelectSubmission = (id, record = null) => {
    setSelectedSubmissionId(id);
    setActiveSubmissionRecord(record);
    setPreviousPage(activePage);
    setActivePage('details');
  };

  const handleSubmissionSuccess = (savedRecord) => {
    refreshLeaderboard();
    setSelectedSubmissionId(savedRecord.id);
    setActiveSubmissionRecord(savedRecord);
    setPreviousPage(activePage);
    setActivePage('details');
  };

  const handleNavigation = (page) => {
    // Guard: Submit page requires login
    if (page === 'submit' && !contestant) {
      setPreviousPage(activePage);
      setActivePage('login');
      return;
    }
    setPreviousPage(activePage);
    setActivePage(page);
    if (page !== 'details') {
      setSelectedSubmissionId(null);
      setActiveSubmissionRecord(null);
    }
  };

  const handleLoginSuccess = (contestantData) => {
    handleLogin(contestantData);
    setActivePage('submit');
  };

  const handleLogoutClick = () => {
    handleLogout();
    setActivePage('home');
  };

  // When admin unlocks the organizer panel, set isAdmin
  const handleOrganizerAccess = () => {
    setIsAdmin(true);
  };

  // ── View a submission from the admin panel ──────────────────────────────
  const handleViewDetails = (id) => {
    setSelectedSubmissionId(id);
    setActiveSubmissionRecord(null);
    setPreviousPage(activePage);
    setActivePage('details');
  };

  // Global Login Wall
  if (!contestant && !isAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-default)' }}>
        <main className="container" style={{ flex: 1, paddingTop: '4rem', paddingBottom: '3.5rem' }}>
          <Login onLoginSuccess={(data) => {
            if (data?.isAdmin) {
              handleOrganizerAccess();
              setActivePage('organizer');
            } else {
              handleLoginSuccess(data);
            }
          }} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* NAVBAR */}
      <Navbar
        activePage={activePage}
        setActivePage={handleNavigation}
        activeTopicTitle={activeTopic?.topic_title}
        theme={theme}
        toggleTheme={toggleTheme}
        contestant={contestant}
        onLogout={handleLogoutClick}
        leaderboardVisible={leaderboardVisible}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
      />

      {/* MAIN CONTENT */}
      <main className="container" style={{ flex: 1, paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>

        {/* HOME */}
        {activePage === 'home' && (
          <Home
            activeTopic={activeTopic}
            leaderboard={leaderboard}
            onNavigate={handleNavigation}
            onSelectSubmission={handleSelectSubmission}
            leaderboardVisible={leaderboardVisible}
            topicVisible={topicVisible}
            isAdmin={isAdmin}
          />
        )}

        {/* SUBMIT */}
        {activePage === 'submit' && (
          <Submit
            activeTopic={activeTopic}
            loadingTopic={loadingTopic}
            topicPool={topicPool}
            poolMode={poolMode}
            onSubmissionSuccess={handleSubmissionSuccess}
            contestant={contestant}
            topicVisible={topicVisible}
            isAdmin={isAdmin}
            leaderboard={leaderboard}
          />
        )}

        {/* LEADERBOARD */}
        {activePage === 'leaderboard' && (
          <Leaderboard
            leaderboard={leaderboard}
            loading={loadingLeaderboard}
            onSelectSubmission={handleSelectSubmission}
            onRefresh={refreshLeaderboard}
            leaderboardVisible={leaderboardVisible}
            isAdmin={isAdmin}
          />
        )}

        {/* SUBMISSION DETAILS */}
        {activePage === 'details' && (
          <SubmissionDetails
            submissionId={selectedSubmissionId}
            initialRecord={activeSubmissionRecord}
            onBack={() => handleNavigation(previousPage === 'details' ? 'home' : (previousPage || 'leaderboard'))}
            isAdmin={isAdmin}
          />
        )}

        {/* ORGANIZER */}
        {activePage === 'organizer' && (
          <TopicManagement
            activeTopic={activeTopic}
            onUpdateTopic={changeTopic}
            topicPool={topicPool}
            loadingPool={loadingPool}
            poolMode={poolMode}
            onChangePoolMode={changePoolMode}
            onAddTopic={addTopic}
            onRemoveTopic={removeTopic}
            leaderboardVisible={leaderboardVisible}
            topicVisible={topicVisible}
            onToggleLeaderboard={(v) => toggleLeaderboardVisibility(v, import.meta.env.VITE_ORGANIZER_PASSWORD)}
            onToggleTopic={(v) => toggleTopicVisibility(v, import.meta.env.VITE_ORGANIZER_PASSWORD)}
            onViewDetails={handleViewDetails}
            isAdmin={isAdmin}
            setIsAdmin={setIsAdmin}
          />
        )}
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
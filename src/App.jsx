import React, { useState, useEffect } from 'react';
import { useCompetition } from './hooks/useCompetition';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Submit } from './pages/Submit';
import { Leaderboard } from './pages/Leaderboard';
import { SubmissionDetails } from './pages/SubmissionDetails';
import { TopicManagement } from './pages/TopicManagement';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [activeSubmissionRecord, setActiveSubmissionRecord] = useState(null);

  // Theme State
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('prompt2poster_theme');

    if (saved) {
      return saved;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('prompt2poster_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const {
    activeTopic,
    leaderboard,
    loadingTopic,
    loadingLeaderboard,
    refreshLeaderboard,
    changeTopic,

    // Topic Pool
    topicPool,
    loadingPool,
    poolMode,
    changePoolMode,
    addTopic,
    removeTopic,
  } = useCompetition();

  // Select a submission
  const handleSelectSubmission = (id, record = null) => {
    setSelectedSubmissionId(id);
    setActiveSubmissionRecord(record);
    setActivePage('details');
  };

  // Submission completed successfully
  const handleSubmissionSuccess = (savedRecord) => {
    refreshLeaderboard();

    setSelectedSubmissionId(savedRecord.id);
    setActiveSubmissionRecord(savedRecord);

    setActivePage('details');
  };

  // Navigation handler
  const handleNavigation = (page) => {
    setActivePage(page);

    if (page !== 'details') {
      setSelectedSubmissionId(null);
      setActiveSubmissionRecord(null);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      {/* NAVBAR */}
      <Navbar
        activePage={activePage}
        setActivePage={handleNavigation}
        activeTopicTitle={activeTopic?.topic_title}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* MAIN CONTENT */}
      <main
        className="container"
        style={{
          flex: 1,
          paddingTop: '2.5rem',
          paddingBottom: '3.5rem',
        }}
      >
        {/* HOME */}
        {activePage === 'home' && (
          <Home
            activeTopic={activeTopic}
            leaderboard={leaderboard}
            onNavigate={setActivePage}
            onSelectSubmission={handleSelectSubmission}
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
          />
        )}

        {/* LEADERBOARD */}
        {activePage === 'leaderboard' && (
          <Leaderboard
            leaderboard={leaderboard}
            loading={loadingLeaderboard}
            onSelectSubmission={handleSelectSubmission}
            onRefresh={refreshLeaderboard}
          />
        )}

        {/* SUBMISSION DETAILS */}
        {activePage === 'details' && (
          <SubmissionDetails
            submissionId={selectedSubmissionId}
            initialRecord={activeSubmissionRecord}
            onBack={() => handleNavigation('leaderboard')}
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
          />
        )}
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
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
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('prompt2poster_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const {
    activeTopic,
    leaderboard,
    loadingTopic,
    loadingLeaderboard,
    refreshLeaderboard,
    changeTopic,
    // Pool
    topicPool,
    loadingPool,
    poolMode,
    changePoolMode,
    addTopic,
    removeTopic,
  } = useCompetition();

  const handleSelectSubmission = (id, record = null) => {
    setSelectedSubmissionId(id);
    setActiveSubmissionRecord(record);
    setActivePage('details');
  };

  const handleSubmissionSuccess = (savedRecord) => {
    refreshLeaderboard();
    setSelectedSubmissionId(savedRecord.id);
    setActiveSubmissionRecord(savedRecord);
    setActivePage('details');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
          if (page !== 'details') setSelectedSubmissionId(null);
        }}
        activeTopicTitle={activeTopic?.topic_title}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main
        className="container"
        style={{
          flex: 1,
          paddingTop: '2.5rem',
          paddingBottom: '3.5rem'
        }}
      >
        {activePage === 'home' && (
          <Home
            activeTopic={activeTopic}
            loadingTopic={loadingTopic}
            leaderboard={leaderboard}
            onNavigate={setActivePage}
            onSelectSubmission={handleSelectSubmission}
          />
        )}

        {activePage === 'submit' && (
          <Submit
            activeTopic={activeTopic}
            loadingTopic={loadingTopic}
            topicPool={topicPool}
            poolMode={poolMode}
            onSubmissionSuccess={handleSubmissionSuccess}
          />
        )}

        {activePage === 'leaderboard' && (
          <Leaderboard
            leaderboard={leaderboard}
            loading={loadingLeaderboard}
            onSelectSubmission={handleSelectSubmission}
            onRefresh={refreshLeaderboard}
          />
        )}

        {activePage === 'details' && (
          <SubmissionDetails
            submissionId={selectedSubmissionId}
            initialRecord={activeSubmissionRecord}
            onBack={() => setActivePage('leaderboard')}
          />
        )}

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

      <Footer />
    </div>
  );
}

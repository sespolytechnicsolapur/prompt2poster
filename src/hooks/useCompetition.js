import { useState, useEffect, useCallback } from 'react';
import { fetchActiveTopic, fetchLeaderboard, updateActiveTopic } from '../services/submissionService';

export function useCompetition() {
  const [activeTopic, setActiveTopic] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingTopic, setLoadingTopic] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [error, setError] = useState(null);

  const loadTopic = useCallback(async () => {
    setLoadingTopic(true);
    try {
      const topic = await fetchActiveTopic();
      setActiveTopic(topic);
    } catch (err) {
      console.error('Failed to load active topic:', err);
      setError('Could not load competition topic');
    } finally {
      setLoadingTopic(false);
    }
  }, []);

  const loadLeaderboard = useCallback(async () => {
    setLoadingLeaderboard(true);
    try {
      const list = await fetchLeaderboard();
      setLeaderboard(list);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoadingLeaderboard(false);
    }
  }, []);

  const changeTopic = async (title, description) => {
    try {
      const updated = await updateActiveTopic(title, description);
      setActiveTopic(updated);
      return updated;
    } catch (err) {
      console.error('Failed to update topic:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadTopic();
    loadLeaderboard();
  }, [loadTopic, loadLeaderboard]);

  return {
    activeTopic,
    leaderboard,
    loadingTopic,
    loadingLeaderboard,
    error,
    refreshTopic: loadTopic,
    refreshLeaderboard: loadLeaderboard,
    changeTopic
  };
}

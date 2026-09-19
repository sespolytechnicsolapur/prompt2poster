import { useState, useEffect, useCallback } from 'react';
import {
  fetchActiveTopic,
  fetchLeaderboard,
  updateActiveTopic,
  fetchTopicPool,
  addTopicToPool,
  removeTopicFromPool,
  getPoolMode,
  setPoolMode,
} from '../services/submissionService';

export function useCompetition() {
  const [activeTopic, setActiveTopic]           = useState(null);
  const [leaderboard, setLeaderboard]           = useState([]);
  const [topicPool, setTopicPool]               = useState([]);
  const [poolMode, setPoolModeState]            = useState(() => getPoolMode()); // 'single' | 'pool'
  const [loadingTopic, setLoadingTopic]         = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [loadingPool, setLoadingPool]           = useState(true);
  const [error, setError]                       = useState(null);

  // ── Loaders ────────────────────────────────────────────────────────────────
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

  const loadPool = useCallback(async () => {
    setLoadingPool(true);
    try {
      const pool = await fetchTopicPool();
      setTopicPool(pool);
    } catch (err) {
      console.error('Failed to load topic pool:', err);
    } finally {
      setLoadingPool(false);
    }
  }, []);

  useEffect(() => {
    loadTopic();
    loadLeaderboard();
    loadPool();
  }, [loadTopic, loadLeaderboard, loadPool]);

  // ── Mutators ───────────────────────────────────────────────────────────────
  const changeTopic = async (title, description) => {
    const updated = await updateActiveTopic(title, description);
    setActiveTopic(updated);
    return updated;
  };

  const addTopic = async (title, description) => {
    const entry = await addTopicToPool(title, description);
    setTopicPool(prev => [...prev, entry]);
    return entry;
  };

  const removeTopic = async (id) => {
    await removeTopicFromPool(id);
    setTopicPool(prev => prev.filter(t => t.id !== id));
  };

  const changePoolMode = (mode) => {
    setPoolMode(mode);
    setPoolModeState(mode);
  };

  return {
    // Single topic
    activeTopic,
    loadingTopic,
    changeTopic,
    refreshTopic: loadTopic,

    // Topic pool
    topicPool,
    loadingPool,
    poolMode,
    changePoolMode,
    addTopic,
    removeTopic,
    refreshPool: loadPool,

    // Leaderboard
    leaderboard,
    loadingLeaderboard,
    refreshLeaderboard: loadLeaderboard,

    error,
  };
}

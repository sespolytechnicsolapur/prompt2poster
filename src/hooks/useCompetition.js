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
  fetchLeaderboardVisibility,
  setLeaderboardVisibility,
  fetchTopicVisibility,
  setTopicVisibility,
  fetchWhitelistEnabled,
  setWhitelistEnabled,
  toggleContestantWhitelistByUserId,
  fetchWhitelistedContestants,
  fetchRoundSettings,
  updateRoundSettings
} from '../services/submissionService';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { getLoggedInContestant, logoutContestant } from '../services/authService';

/**
 * Central hook managing all competition state:
 * topics, leaderboard, pool, auth, and visibility controls.
 */
export function useCompetition() {
  // ── Topic State ───────────────────────────────────────────────────────────
  const [activeTopic, setActiveTopic]           = useState(null);
  const [loadingTopic, setLoadingTopic]         = useState(true);

  // ── Leaderboard State ─────────────────────────────────────────────────────
  const [leaderboard, setLeaderboard]           = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  // ── Topic Pool State ──────────────────────────────────────────────────────
  const [topicPool, setTopicPool]               = useState([]);
  const [poolMode, setPoolModeState]            = useState(() => getPoolMode());
  const [loadingPool, setLoadingPool]           = useState(true);

  // ── Auth State ────────────────────────────────────────────────────────────
  const [contestant, setContestant]             = useState(() => getLoggedInContestant());
  const [isAdmin, setIsAdminState]              = useState(() => sessionStorage.getItem('prompt2poster_admin') === 'true');

  const setIsAdmin = (value) => {
    if (value) {
      sessionStorage.setItem('prompt2poster_admin', 'true');
    } else {
      sessionStorage.removeItem('prompt2poster_admin');
    }
    setIsAdminState(value);
  };

  // ── Visibility State ──────────────────────────────────────────────────────
  const [leaderboardVisible, setLeaderboardVisibleState] = useState(true);
  const [topicVisible, setTopicVisibleState]             = useState(true);
  const [whitelistEnabled, setWhitelistEnabledState]     = useState(false);
  const [whitelistedUserIds, setWhitelistedUserIds]      = useState(new Set());
  
  // ── Round Settings State ──────────────────────────────────────────────────
  const [roundSettings, setRoundSettingsState] = useState({
    current_round: 1,
    qualification_cutoff: 60,
    show_qualification: false,
    show_round_2: false
  });

  const [error, setError] = useState(null);

  // ── Loaders ─────────────────────────────────────────────────────────────
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
      const list = await fetchLeaderboard({ includeHidden: isAdmin });
      setLeaderboard(list);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoadingLeaderboard(false);
    }
  }, [isAdmin]);

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

  const loadVisibility = useCallback(async () => {
    try {
      const [lbVisible, tVisible, wEnabled, rSettings] = await Promise.all([
        fetchLeaderboardVisibility(),
        fetchTopicVisibility(),
        fetchWhitelistEnabled(),
        fetchRoundSettings()
      ]);
      setLeaderboardVisibleState(lbVisible);
      setTopicVisibleState(tVisible);
      setWhitelistEnabledState(wEnabled);
      setRoundSettingsState(rSettings);
      
      if (isAdmin && import.meta.env.VITE_ORGANIZER_PASSWORD) {
        const whitelisted = await fetchWhitelistedContestants(import.meta.env.VITE_ORGANIZER_PASSWORD);
        setWhitelistedUserIds(new Set(whitelisted.map(c => c.user_id)));
      }
    } catch (err) {
      console.error('Failed to load visibility settings:', err);
    }
  }, [isAdmin]);

  // ── Initial Load ────────────────────────────────────────────────────────
  useEffect(() => {
    loadTopic();
    loadLeaderboard();
    loadPool();
    loadVisibility();
  }, [loadTopic, loadLeaderboard, loadPool, loadVisibility]);

  // ── Supabase Realtime Subscriptions ─────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const channel = supabase.channel('public:realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'submissions' },
        () => {
          console.log('[Realtime] Submissions table changed, reloading leaderboard...');
          loadLeaderboard();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'topics' },
        () => {
          console.log('[Realtime] Topics table changed, reloading topic & visibility...');
          loadTopic();
          loadVisibility();
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadLeaderboard, loadTopic, loadVisibility]);

  // ── Topic Mutators ──────────────────────────────────────────────────────
  const changeTopic = async (title, description) => {
    const updated = await updateActiveTopic(title, description);
    setActiveTopic(updated);
    return updated;
  };

  // ── Pool Mutators ───────────────────────────────────────────────────────
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

  // ── Auth Mutators ───────────────────────────────────────────────────────
  const handleLogin = (contestantData) => {
    setContestant(contestantData);
  };

  const handleLogout = () => {
    logoutContestant();
    setContestant(null);
  };

  // ── Visibility Mutators ─────────────────────────────────────────────────
  const toggleLeaderboardVisibility = async (visible, adminPassword) => {
    try {
      const result = await setLeaderboardVisibility(visible, adminPassword);
      setLeaderboardVisibleState(result);
    } catch (err) {
      console.error('Failed to toggle leaderboard visibility:', err);
    }
  };

  const toggleTopicVisibility = async (visible, adminPassword) => {
    try {
      const result = await setTopicVisibility(visible, adminPassword);
      setTopicVisibleState(result);
    } catch (err) {
      console.error('Failed to toggle topic visibility:', err);
    }
  };

  const toggleWhitelistEnabled = async (enabled, adminPassword) => {
    try {
      const result = await setWhitelistEnabled(enabled, adminPassword);
      setWhitelistEnabledState(result);
    } catch (err) {
      console.error('Failed to toggle whitelist:', err);
    }
  };

  const toggleUserWhitelist = async (userId, isWhitelisted, adminPassword) => {
    try {
      await toggleContestantWhitelistByUserId(userId, isWhitelisted, adminPassword);
      setWhitelistedUserIds(prev => {
        const next = new Set(prev);
        if (isWhitelisted) next.add(userId);
        else next.delete(userId);
        return next;
      });
    } catch (err) {
      console.error('Failed to toggle contestant whitelist:', err);
      throw err;
    }
  };

  const saveRoundSettings = async (settings, adminPassword) => {
    try {
      const result = await updateRoundSettings(settings, adminPassword);
      setRoundSettingsState(result);
    } catch (err) {
      console.error('Failed to update round settings:', err);
      throw err;
    }
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

    // Auth
    contestant,
    isAdmin,
    setIsAdmin,
    handleLogin,
    handleLogout,

    // Visibility & Whitelist
    leaderboardVisible,
    topicVisible,
    whitelistEnabled,
    whitelistedUserIds,
    toggleLeaderboardVisibility,
    toggleTopicVisibility,
    toggleWhitelistEnabled,
    toggleUserWhitelist,
    refreshVisibility: loadVisibility,
    
    // Rounds
    roundSettings,
    saveRoundSettings,

    error,
  };
}

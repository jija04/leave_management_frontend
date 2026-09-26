import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('lm_theme') || 'light');
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [policy, setPolicy] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Selected date prefill when clicking from interactive calendar
  const [prefilledLeave, setPrefilledLeave] = useState(null);

  useEffect(() => {
    localStorage.setItem('lm_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  const refreshHolidays = useCallback(async () => {
    try {
      const res = await api.getHolidays({ year: 2026 });
      setHolidays(res.data || []);
    } catch (err) {
      console.error('Failed to load holidays:', err);
    }
  }, []);

  const refreshLeaveRequests = useCallback(async () => {
    try {
      const res = await api.getLeaveRequests();
      setLeaveRequests(res.data || []);
    } catch (err) {
      console.error('Failed to load leave requests:', err);
    }
  }, []);

  const refreshLeaveTypes = useCallback(async () => {
    try {
      const res = await api.getLeaveTypes();
      setLeaveTypes(res.data || []);
    } catch (err) {
      console.error('Failed to load leave types:', err);
    }
  }, []);

  const refreshEmployees = useCallback(async () => {
    try {
      const res = await api.getEmployees();
      setEmployees(res.data || []);
    } catch (err) {
      console.error('Failed to load employees:', err);
    }
  }, []);

  const refreshPolicy = useCallback(async () => {
    try {
      const res = await api.getPolicy();
      setPolicy(res.data || {});
    } catch (err) {
      console.error('Failed to load policy:', err);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const res = await api.getDashboardStats();
      setStats(res.stats || null);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      refreshHolidays(),
      refreshLeaveTypes(),
      refreshEmployees(),
      refreshLeaveRequests(),
      refreshPolicy(),
      refreshStats()
    ]);
    setLoading(false);
  }, [refreshHolidays, refreshLeaveTypes, refreshEmployees, refreshLeaveRequests, refreshPolicy, refreshStats]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const navigateToApply = (prefillData = null) => {
    if (prefillData) {
      setPrefilledLeave(prefillData);
    }
    setActiveTab('apply');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        navigateToApply,
        prefilledLeave,
        setPrefilledLeave,
        employees,
        leaveTypes,
        holidays,
        leaveRequests,
        policy,
        stats,
        loading,
        toast,
        showToast,
        theme,
        toggleTheme,
        refreshAll,
        refreshHolidays,
        refreshLeaveRequests,
        refreshLeaveTypes,
        refreshEmployees,
        refreshPolicy,
        refreshStats
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

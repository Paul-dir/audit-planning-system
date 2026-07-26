import { useState, useEffect, useCallback } from 'react';
import { loadData, saveData } from '../utils/data';

/**
 * Reactive hook for app data stored in localStorage.
 * Re-loads when storage changes (cross-tab) or after explicit refresh.
 */
export function useAppData() {
  const [data, setData] = useState(() => loadData());

  const refresh = useCallback(() => {
    setData(loadData());
  }, []);

  const persist = useCallback((nextData) => {
    saveData(nextData);
    setData(nextData);
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'audit_planning_system_v2' || e.key === null) {
        refresh();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  return { data, refresh, persist };
}

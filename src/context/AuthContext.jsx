import { createContext, useContext, useState, useEffect } from 'react';
import { storage, STORE_KEYS } from '../services/storage.js';
import { SEED_USERS } from '../data/seed.js';

const AuthContext = createContext({ user: null, login: () => false, logout: () => {}, loading: true });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session
    const saved = storage.get('session');
    if (saved) {
      const users = storage.get(STORE_KEYS.USERS, SEED_USERS);
      const found = users.find(u => u.id === saved.id);
      if (found) setUser(found);
    }
    setLoading(false);
  }, []);

  const login = (userId) => {
    const users = storage.get(STORE_KEYS.USERS, SEED_USERS);
    const found = users.find(u => u.id === userId);
    if (found) {
      setUser(found);
      storage.set('session', { id: found.id });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    storage.remove('session');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

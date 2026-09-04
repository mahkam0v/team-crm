import { createContext, useContext, useEffect, useState } from 'react';
import { api, getRefreshToken, setTokens, clearTokens } from '../api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // If the refresh token becomes invalid / expires mid-session, api.js
  // broadcasts 'auth:expired' and we drop the user back to the login screen.
  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      setLoading(false);
    };
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const refresh = async () => {
    if (!getRefreshToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      // api.me() transparently refreshes the access token when it has expired
      const { user } = await api.me();
      setUser(user);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const login = async (credentials) => {
    const result = await api.login(credentials);
    setTokens(result);
    setUser(result.user);
  };

  const register = async (payload) => {
    const result = await api.register(payload);
    setTokens(result);
    setUser(result.user);
  };

  const logout = async () => {
    try {
      // best-effort server-side revocation of the refresh token
      await api.logout();
    } catch {
      // ignore — tokens are cleared locally regardless
    }
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

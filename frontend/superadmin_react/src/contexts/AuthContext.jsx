import { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../api/superAdminApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('sa_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('sa_token'));
  const [loading, setLoading] = useState(false);

  const isAuthenticated = Boolean(token && user);

  const loginUser = async (credentials) => {
    setLoading(true);
    try {
      const res = await api.login(credentials);
      const { token: newToken, user: newUser } = res.data.data;
      localStorage.setItem('sa_token', newToken);
      localStorage.setItem('sa_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('sa_token');
    localStorage.removeItem('sa_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated) => {
    const newUser = { ...user, ...updated };
    setUser(newUser);
    localStorage.setItem('sa_user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, loginUser, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

import { createContext, useContext, useState } from 'react';
import * as api from '../api/tenantApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('tenant_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [tenant, setTenant] = useState(() => {
    const stored = localStorage.getItem('tenant_data');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('tenant_token'));
  const [loading, setLoading] = useState(false);

  const isAuthenticated = Boolean(token && user);

  const loginUser = async (credentials) => {
    setLoading(true);
    try {
      const res = await api.login(credentials);
      const { token: newToken, user: newUser, tenant: newTenant } = res.data.data;
      localStorage.setItem('tenant_token', newToken);
      localStorage.setItem('tenant_user', JSON.stringify(newUser));
      localStorage.setItem('tenant_data', JSON.stringify(newTenant));
      setToken(newToken);
      setUser(newUser);
      setTenant(newTenant);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('tenant_token');
    localStorage.removeItem('tenant_user');
    localStorage.removeItem('tenant_data');
    setToken(null);
    setUser(null);
    setTenant(null);
  };

  const updateUser = (updated) => {
    const newUser = { ...user, ...updated };
    setUser(newUser);
    localStorage.setItem('tenant_user', JSON.stringify(newUser));
  };

  const updateTenant = (updated) => {
    const newTenant = { ...tenant, ...updated };
    setTenant(newTenant);
    localStorage.setItem('tenant_data', JSON.stringify(newTenant));
  };

  return (
    <AuthContext.Provider value={{ user, tenant, token, isAuthenticated, loading, loginUser, logout, updateUser, updateTenant }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

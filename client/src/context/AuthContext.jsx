import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const Ctx = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!localStorage.getItem('token')) { setLoading(false); return; }
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const handleAuthResponse = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return handleAuthResponse(res.data);
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    return handleAuthResponse(res.data);
  };

  const googleLogin = async (credential) => {
    const res = await api.post('/auth/google', { credential });
    return handleAuthResponse(res.data);
  };

  const githubLogin = async (code) => {
    const res = await api.post('/auth/github', { code });
    return handleAuthResponse(res.data);
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.clear();
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, login, register, googleLogin, githubLogin, logout, setUser, refetch: fetchUser }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

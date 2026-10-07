import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('studytrack_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('studytrack_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('studytrack_user');
    const savedToken = localStorage.getItem('studytrack_token');

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const userData = response.data.data.user;
    const authToken = response.data.data.token;

    localStorage.setItem('studytrack_user', JSON.stringify(userData));
    localStorage.setItem('studytrack_token', authToken);
    setUser(userData);
    setToken(authToken);

    return response;
  };

  const register = async (formData) => {
    const response = await api.post('/auth/register', formData);
    const userData = response.data.data.user;
    const authToken = response.data.data.token;

    localStorage.setItem('studytrack_user', JSON.stringify(userData));
    localStorage.setItem('studytrack_token', authToken);
    setUser(userData);
    setToken(authToken);

    return response;
  };

  const logout = () => {
    localStorage.removeItem('studytrack_user');
    localStorage.removeItem('studytrack_token');
    setUser(null);
    setToken('');
  };

  const value = useMemo(
    () => ({ user, token, login, register, logout, loading }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

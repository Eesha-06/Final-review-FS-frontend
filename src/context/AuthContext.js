// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('lms_user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res  = await apiLogin({ email, password });
    const data = res.data.data;
    localStorage.setItem('lms_token', data.token);
    localStorage.setItem('lms_user',  JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (payload) => {
    const res  = await apiRegister(payload);
    const data = res.data.data;
    localStorage.setItem('lms_token', data.token);
    localStorage.setItem('lms_user',  JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

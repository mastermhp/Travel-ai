"use client"

import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  checkAuth: () => {},
});

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = () => {
    const token = Cookies.get('token');
    setIsAuthenticated(!!token);
    return !!token;
  };

  const login = (token) => {
    Cookies.set('token', token, { 
      expires: 7,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });
    setIsAuthenticated(true);
  };

  const logout = () => {
    Cookies.remove('token');
    setIsAuthenticated(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
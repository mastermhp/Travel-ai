// context/AuthContext.jsx
"use client"

import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import apiService from '@/services/api';

// Create the context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const router = useRouter();
  
  // Check if the user is logged in when the app loads
  useEffect(() => {
    const checkUser = async () => {
      try {
        // Check if we're in a browser environment
        if (typeof window !== "undefined") {
          // Check local storage first
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
          
          // Validate token with the backend
          if (localStorage.getItem('authToken')) {
            try {
              const { success, user } = await apiService.getCurrentUser();
              if (success && user) {
                setUser(user);
              }
            } catch (tokenError) {
              // Token might be invalid, clear it
              console.warn("Auth token validation failed:", tokenError);
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);
  
  // Login function
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const response = await apiService.login({ email, password });
      setUser(response.user);
      return response;
    } catch (error) {
      setAuthError(error.message || "Login failed");
      throw error;
    }
  };
  
  // Registration function
  const register = async (userData) => {
    setAuthError(null);
    try {
      const response = await apiService.register(userData);
      return response;
    } catch (error) {
      setAuthError(error.message || "Registration failed");
      throw error;
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Even if the API call fails, clear local state
      if (typeof window !== "undefined") {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
      setUser(null);
      router.push('/login');
    }
  };
  
  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };
  
  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await apiService.updateProfile(userData);
      // Update local user data
      if (response.success && user) {
        const updatedUser = {
          ...user,
          profile: {
            ...user.profile,
            ...userData
          }
        };
        setUser(updatedUser);
        if (typeof window !== "undefined") {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
      return response;
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  };

  // Create a value object with all the context data and functions
  const value = {
    user,
    loading,
    authError,
    login,
    register,
    logout,
    isAuthenticated,
    updateProfile
  };
  
  // Provide the context value to children components
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
import { useState, useEffect } from 'react';
import { User } from '../types';
import { getCurrentUser, setCurrentUser, logout as authLogout } from '../services/auth';
import { LocalStorage } from '../services/storage';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize default data
    LocalStorage.initializeDefaultData();
    
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setCurrentUser(userData);
  };

  const logout = () => {
    setUser(null);
    authLogout();
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };
};
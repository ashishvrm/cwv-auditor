import { useContext } from 'react';
import type { AuthContextType } from '../types/auth';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

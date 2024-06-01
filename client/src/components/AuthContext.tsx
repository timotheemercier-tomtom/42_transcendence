// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface AuthContextType {
  isLoggedIn: boolean;
  user: any;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
    children,
  })  => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get('/auth/status').then(response => {
      if (response.data.isLoggedIn) {
        setIsLoggedIn(true);
        setUser(response.data.user);
      }
    });
  }, []);
  
  const login = async () => {
    const response = await axios.get('/auth/42');
    if (response.data.isLoggedIn) {
      setIsLoggedIn(true);
      setUser(response.data.user);
    }
  };

  const logout = () => {
    axios.post('/auth/logout').then(() => {
      setIsLoggedIn(false);
      setUser(null);
    });
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

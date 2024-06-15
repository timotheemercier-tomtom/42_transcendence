// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  user: any;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/auth/status')
      .then((response) => response.json())
      .then((data) => {
        if (data.isLoggedIn) {
          setIsLoggedIn(true);
          setUser(data.user);
        }
      });
  }, []);

  const login = async () => {
    const response = await fetch('/auth/42');
    const data = await response.json();
    if (data.isLoggedIn) {
      setIsLoggedIn(true);
      setUser(data.user);
    }
  };

  const logout = () => {
    fetch('/auth/logout', { method: 'POST' }).then(() => {
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

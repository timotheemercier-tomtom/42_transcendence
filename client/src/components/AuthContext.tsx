// AuthContext.tsx

import React, {
  useState,
  useContext,
  createContext,
  ReactNode,
  useEffect,
} from 'react';
import { API, getLogin } from '../util';

interface AuthContextType {
  isLoggedIn: boolean;
  user: any;
  login: () => void;
  logout: () => void;
  setUser: (user: any) => void;
  updateUserImage: (login: string, base64Image: string) => Promise<any>;
  updateUser: (login: string, data: { displayName: string }) => Promise<any>;
  enableTwoFA: (
    login: string,
  ) => Promise<{ secret: string; otpauthUrl: string }>;
  disableTwoFA: (login: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getLogin());
}, []);


  const login = () => {
    window.location.href = `${API}/auth/42`;
  };

  function deleteCookie(name: any) {
    // Set the cookie with a past expiration date
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  }
    
  const logout = () => {
      setUser(null);
      deleteCookie('accessToken');
      location.reload();
  };

  const updateUserImage = async (login: string, base64Image: string) => {
    const response = await fetch(`${API}/user/${login}/image`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ picture: base64Image }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to update user image');
    }

    const updatedUser = await response.json();
    setUser(updatedUser);
    return updatedUser;
  };

  const updateUser = async (login: string, data: { displayName: string }) => {
    const response = await fetch(`${API}/user/${login}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to update user');
    }

    const updatedUser = await response.json();
    setUser(updatedUser);
    return updatedUser;
  };

  const enableTwoFA = async (login: string) => {
    const response = await fetch(`${API}/user/${login}/2fa/enable`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to enable 2FA');
    }

    return response.json();
  };

  const disableTwoFA = async (login: string) => {
    const response = await fetch(`${API}/user/${login}/2fa/disable`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to disable 2FA');
    }

    return response.json();
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        login,
        logout,
        setUser,
        updateUserImage,
        updateUser,
        enableTwoFA,
        disableTwoFA,
      }}
    >
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

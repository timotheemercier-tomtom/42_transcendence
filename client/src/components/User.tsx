import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  Button,
  Card,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { User as UserData } from 'common';
import { API, getLogin } from '../util';
import Picture from './Picture';
import EnableTwoFA from './EnableTwoFA';

type UserContextType = {
  user: UserData | null;
  setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserContextType['user']>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

function User() {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  let { login } = useParams();
  if (!login) login = getLogin();

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch(`${API}/user/${login}`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Network response error');
        const data = await response.json();
        setUser(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, [login, setUser]);

  async function updateUserImage(
    login: string,
    base64Image: string,
  ): Promise<UserData> {
    const response = await fetch(`${API}/user/${login}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ picture: base64Image }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to update user image');
    }

    return response.json();
  }

  const handleUpdatePicture = async (newPictureUrl: any) => {
    try {
      if (user) {
        const updatedUser = await updateUserImage(user.login, newPictureUrl);
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error updating user image:', error);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!user) return null;

  return (
    <Card>
      <Picture
        username={user.username}
        picture={user.picture}
        onUpdate={handleUpdatePicture}
      />
      <Typography variant="h5">Account Details</Typography>
      <Typography variant="h5">Intra Login: {user.username}</Typography>
      <EnableTwoFA user={user} />
    </Card>
  );
}

export default User;

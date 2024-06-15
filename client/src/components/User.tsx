import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Avatar, Card, CircularProgress } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import Picture from './Picture';
import FormWithValidation from './Form';
import Typography from '@material-ui/core/Typography';
import SignUp from './SignUp';

type UserContextType = {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
};

const UserContext = createContext<UserContextType | null>(null);

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

export const useUser = () => useContext(UserContext);

export type UserData = {
  login: string;
  username: string;
  picture: string;
  twoFA: string;
};

export async function updateUserImage(
  login: string,
  base64Image: string,
): Promise<UserData> {
  const response = await fetch(
    `http://${location.hostname}:3000/user/${login}/image`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ picture: base64Image }),
      credentials: 'include',
    },
  );

  if (!response.ok) {
    throw new Error('Failed to update user image');
  }

  return response.json();
}

function User() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { login = '' } = useParams();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `http://${location.hostname}:3000/user/` + login,
          {
            method: 'GET',
            credentials: 'include',
          },
        );
        if (!response.ok) throw new Error('Network response error');
        const data = (await response.json()) as UserData;
        setUserData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [login]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  if (!userData) return null;

  const updateUserData = (newPicture: string) => {
    if (userData) {
      setUserData({ ...userData, picture: newPicture });
    }
  };

  return (
    <Card>
      <Picture
        username={userData.username}
        picture={userData.picture}
        onUpdate={async (newPictureUrl: string) => {
          try {
            const updatedUser = await updateUserImage(
              userData.login,
              newPictureUrl,
            );
            setUserData(updatedUser);
          } catch (error) {
            console.error('Error updating user image:', error);
          }
        }}
      />
      <SignUp />
      <Typography variant="h5">Account Details</Typography>
      <Typography variant="h5">Intra Login: {userData.username}</Typography>
      <Link to={'/u/asaijers'}>Alfa Profile</Link>
      <br />
      <Link to={'/u/tmercier'}>Tim Profile</Link>

      <FormWithValidation
        initialFormData={userData}
        onImageUpdate={updateUserData} // Ajout de la prop onImageUpdate
      />
    </Card>
  );
}
export default User;

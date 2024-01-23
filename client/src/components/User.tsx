import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
// import { useParams } from 'react-router-dom';
import { Avatar, Card, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import Typography from './Typography';

// type UserContextType = {
//   user: UserData | null;
//   setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
// };

// Define the type for the context value
type UserContextType = {
  user: any; // Replace 'any' with a more specific type as per your user object
  setUser: React.Dispatch<React.SetStateAction<UserData | null>>; // Same here for the specific type
};

// Create context with a default value of type UserContextType
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

type UserData = {
  login: string;
  username: string;
  picture: string;
};

function User() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { login = '' } = useParams();
  //   const { login } = useParams<{ login: string }>();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('http://localhost:3000/user/' + login, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Network response error');
      const data = (await response.json()) as UserData;
      setUserData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  if (!userData) return null;
  return (
    <Card>
      <Typography variant="h5">Account Details</Typography>
      {/* <Typography> URL {userData.picture.link} </Typography>; */}

      {/* <Typography variant="h6">Name: {userData.name}</Typography> */}
      <Typography>Name: {userData.username}</Typography>
      {/* <img
        src={userData.picture.link}
        alt={userData.username}
      /> */}
      <Avatar src={userData.picture} alt="Profile Picture" />
      {/* Add more user details as needed */}
    </Card>
  );
}
export default User;

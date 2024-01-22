import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  ReactNode,
} from 'react';
// import { useParams } from 'react-router-dom';
import { CircularProgress, Card, Avatar } from '@mui/material';
import Typography from './Typography';
import { useParams } from 'react-router-dom';

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
  id: number;
  login: string;
  username: string;
  //   email: string;
  picture: {
    link: string;
  };
};

function User() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  //   const {username = ''} = useParams()
  const { username } = useParams<{ username: string }>();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('http://localhost:3000/user/' + username, {
        method: 'GET',
        credentials: 'include',
        // headers: {
        //   Authorization: `Bearer ${localStorage.getItem('token')}`,
        // },
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
      {/* <Avatar src={userData.picture.link} alt="Profile Picture" /> */}
      {/* Add more user details as needed */}
    </Card>
  );
}
export default User;

// // Utiliser cette fonction pour récupérer et afficher les données de l'utilisateur
// fetchUserProfile('nomUtilisateur').then((user) => {
//   if (user) {
//     console.log('User Profile:', user);
//     // Mettre à jour l'UI avec les données de l'utilisateur
//   }
//   return (
//     <div>
//       <Typography variant="h6">Username: {user.username}</Typography>
//       {/* <Typography variant="h6">Email: {userData.email}</Typography> */}
//       <Typography variant="h6">name: {user.name}</Typography>
//       <div>
//         <Typography variant="h6">Profile Picture:</Typography>
//         <Avatar src={user.picture} alt="Profile Picture" />
//       </div>
//     </div>
//   );
// });

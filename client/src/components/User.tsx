import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  ReactNode,
} from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Avatar } from '@material-ui/core';

// Define the type for the user data
type UserData = {
  name: string;
  username: string;
//   email: string;
  picture: string;
//   image: {
//     link: string;
//   };
};

// Define the type for the context value
type UserContextType = {
  user: UserData | null;
  setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
};

// Create context with a default value of type UserContextType
export const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserData | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

const User = () => {
  const { username } = useParams<{ username: string }>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:3000/users/{username}', {
          method: 'GET',
          credentials: 'include',
        });
        // if (!response.ok) {
        //   throw new Error('Error: ${response.statusText}');
        // }
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [username]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error: {error}</Typography>;
  if (!userData) return <Typography>No user data available.</Typography>;
  
  return (
    <div>
      <Typography variant="h6">Username: {userData.username}</Typography>
      {/* <Typography variant="h6">Email: {userData.email}</Typography> */}
      <Typography variant="h6">name: {userData.name}</Typography>
      <div>
        <Typography variant="h6">Profile Picture:</Typography>
        <Avatar src={userData.picture} alt="Profile Picture" />
      </div>
    </div>
  );
};

export default User;

// const User = () => {
//   const { id } = useParams<{ id: string }>();
//   const [userData, setUserData] = useState<UserType>({
//     username: '',
//     email: '',
//     picture: '',
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     setLoading(true);
//     const apiUrl = `http://localhost:3000/user/${id}`;

//     fetch(apiUrl, {
//       method: 'GET',
//       credentials: 'include', // Include cookies in the request
//     })
//     .then((response) => response.json())
//     .then((data) => {
//       setUserData({
//         username: data.username,
//         email: data.email,
//         picture: data.picture,
//       });
//       setLoading(false);
//     })
//     .catch((error) => {
//       console.error('Error fetching user data:', error);
//       setError(error.message);
//       setLoading(false);
//     });
//   }, [id]);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <div>
//       <Typography variant="h6">Username: {userData.username}</Typography>
//       <Typography variant="h6">Email: {userData.email}</Typography>
//       <div>
//         <Typography variant="h6">Profile Picture:</Typography>
//         <Avatar src={userData.picture} alt="Profile Picture" />
//       </div>
//     </div>
//   );
// };

// export default User;

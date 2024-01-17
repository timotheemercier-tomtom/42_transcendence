import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  ReactNode,
} from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Avatar } from '@material-ui/core';

type UserData = {
  name: string;
  username: string;
  //   email: string;
  picture: string;
  //   image: {
  //     link: string;
  //   };
};

type UserContextType = {
  user: UserData | null;
  setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
};

// userContext -> To stock data
export const UserContext = createContext<UserContextType | null>(null);

// useEffect -> to get user data and store them into the context
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  let username = sessionStorage.getItem('user');
  
  useEffect(() => {
      const fetchUserData = async () => {
          setLoading(true);
          try {
            //   console.log('USER', username);
        const response = await fetch(`http://localhost:3000/user/${username}`, {
          method: 'GET',
          credentials: 'include',
        });
        // console.log('Response status:', response.status); // Log pour débogage
        // console.log('Response headers:', response.headers.get('body')); // Vérifier le type de contenu

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }
    
          const text = await response.text(); // Récupérer le texte brut de la réponse
          console.log('Response body:', text); // Log du corps de la réponse
    
          try {
            const data = JSON.parse(text); // Essayer de parser le texte en JSON
            setUser(data);
          } catch (e) {
            console.error('Error parsing JSON:', e);
            setError('Failed to parse user data');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError('Failed to fetch user data');
        } 
        finally {
          setLoading(false);
        }    
    };

    fetchUserData();
  }, [username]); 
  
//   if (loading) return <Typography>Loading...</Typography>;
//   if (error) return <Typography>Error: {error}</Typography>;
//   if (!user) return <Typography>No user data available.</Typography>;

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

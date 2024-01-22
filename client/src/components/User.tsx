import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  ReactNode,
} from 'react';
import { useParams } from 'react-router-dom';
import { CircularProgress, Card, Avatar } from '@mui/material';
import Typography from './Typography';

// type UserData = {
//   name: string;
//   username: string;
//   //   email: string;
//   picture: string;
//   //   image: {
//   //     link: string;
//   //   };
// };

type UserContextType = {
  user: UserData | null;
  setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
};

interface UserData {
    name: string;
    username: string;
    //   email: string;
    picture: string;
    //   image: {
    //     link: string;
    //   };
}


function AccountPage() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await fetch('/api/user/username', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json() as UserData;
            setUserData(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    if (!userData)
        return null;
    return (
        <Card>
            <Typography variant="h5">Account Details</Typography>
            {/* <Typography variant="h6">Name: {userData.name}</Typography> */}
            <Typography>Name: {userData.name}</Typography>
            <Avatar src={userData.picture} alt="Profile Picture" />
            {/* Add more user details as needed */}
        </Card>
    );
}

export default AccountPage;



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

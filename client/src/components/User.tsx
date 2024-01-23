import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Avatar,
  Card,
  CircularProgress,
  TextField,
  Button,
} from '@mui/material';
import Typography from './Typography';
import { getCookie } from '../utils';

type UserData = {
  login: string;
  username: string;
  picture: string;
};

const user = sessionStorage.getItem('user') ?? '';

function User() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [newPicture, setNewPicture] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { login = '' } = useParams();

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
      setNewUsername(data.username); // Initialize with current username
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewUsername(event.target.value);
  };

  const handlePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setNewPicture(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    const tokenJWT = getCookie('accessToken');
    if (!tokenJWT) {
      console.error('Error:JWT token not found');
      return;
    }

    const formData = new FormData();
    if (newPicture) {
      formData.append('picture', newPicture);
    }
    formData.append('username', newUsername);

    try {
      const response = await fetch(`http://localhost:3000/user/${login}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${tokenJWT}`, // Remplacer avec votre token JWT
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du profil');
      }

      const updatedUser = await response.json();
      setUserData(updatedUser);
      alert('Profil mis à jour avec succès');
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!userData) return null;

  return (
    <Card>
      <Typography variant="h5">Account Details</Typography>
      <Avatar src={userData.picture} alt="Profile Picture" />
      <TextField
        label="Nom d'utilisateur"
        value={newUsername}
        onChange={handleUsernameChange}
      />
      <input type="file" onChange={handlePictureChange} />
      <Button onClick={handleSubmit}>Mettre à jour</Button>
    </Card>
  );
}

export default User;

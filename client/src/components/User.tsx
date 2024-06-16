// User.tsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Avatar,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useAuth } from './AuthContext';
import qrcode from 'qrcode';

const User: React.FC = () => {
  const { login } = useParams<{ login: string }>();
  const { user, updateUserImage, updateUser, enableTwoFA, disableTwoFA } =
    useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPicture, setNewPicture] = useState<File | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `http://${location.hostname}:3000/user/${login}`,
          {
            method: 'GET',
            credentials: 'include',
          },
        );

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data);
        setTwoFAEnabled(data.isTwoFAEnabled);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [login]);

  const handleImageChange = async () => {
    if (!newPicture) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result as string;
      try {
        const updatedUser = await updateUserImage(userData.login, base64Image);
        setUserData(updatedUser);
      } catch (error) {
        setError('Failed to update image');
      }
    };
    reader.readAsDataURL(newPicture);
  };

  const handleUsernameChange = async () => {
    if (!newUsername) return;
    try {
      const updatedUser = await updateUser(userData.login, {
        displayName: newUsername,
      });
      setUserData(updatedUser);
    } catch (error) {
      setError('Failed to update username');
    }
  };

  const handleTwoFAToggle = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setTwoFAEnabled(event.target.checked);
    if (event.target.checked) {
      // Enable 2FA
      const response = await enableTwoFA(userData.login);
      const qrCodeUrl = await qrcode.toDataURL(response.otpauthUrl);
      setQrCode(qrCodeUrl);
    } else {
      // Disable 2FA
      await disableTwoFA(userData.login);
      setQrCode(null);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Card style={{ padding: '2rem', maxWidth: '400px', margin: '2rem auto' }}>
      <Typography variant="h5">Profile</Typography>
      <Typography variant="h6">Username: {userData.displayName}</Typography>
      <Typography variant="h6">Login: {userData.login}</Typography>
      <Avatar
        src={userData.picture}
        alt="Profile"
        style={{ width: '100px', height: '100px' }}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setNewPicture(e.target.files ? e.target.files[0] : null)
        }
        style={{ marginTop: '1rem' }}
      />
      <Button
        onClick={handleImageChange}
        disabled={!newPicture}
        style={{ marginTop: '1rem' }}
      >
        Update Picture
      </Button>
      <TextField
        label="New Username"
        value={newUsername}
        onChange={(e) => setNewUsername(e.target.value)}
        style={{ marginTop: '1rem' }}
      />
      <Button
        onClick={handleUsernameChange}
        disabled={!newUsername}
        style={{ marginTop: '1rem' }}
      >
        Update Username
      </Button>
      <FormControlLabel
        control={
          <Switch
            checked={twoFAEnabled}
            onChange={handleTwoFAToggle}
            name="twoFAEnabled"
            color="primary"
          />
        }
        label="Enable 2FA"
      />
      {qrCode && (
        <div style={{ marginTop: '1rem' }}>
          <Typography variant="h6">
            Scan this QR code with your authenticator app:
          </Typography>
          <img
            src={qrCode}
            alt="2FA QR Code"
            style={{ width: '200px', height: '200px' }}
          />
        </div>
      )}
    </Card>
  );
};

export default User;

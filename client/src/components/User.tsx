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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useAuth } from './AuthContext';
import qrcode from 'qrcode';
import { API } from '../util';
import axios from 'axios';

const User: React.FC = () => {
  const { login } = useParams<{ login: string }>();
  const { user, updateUserImage, updateUser, enableTwoFA, disableTwoFA } =
    useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPicture, setNewPicture] = useState<File | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [is2FAEnabled, setTwoFAEnabled] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetchUserData();
  }, [login]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API}/user/${login}`, {
        method: 'GET',
        credentials: 'include',
      });

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

  const handleToggleChange = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleRedirect = async () => {
    try {
      const url = is2FAEnabled ? '2fa/disable' : '2fa/enable';
      await axios.post(url, { password });
      setTwoFAEnabled(!is2FAEnabled);

      const redirectUrl = is2FAEnabled
        ? `${API}/otp_settings/deactivate`
        : `${API}/otp_settings/new`;
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Failed to update 2FA status', error);
    } finally {
      setOpen(false);
    }
  };

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
      <div>
        <FormControlLabel
          control={
            <Switch
              checked={is2FAEnabled}
              onChange={handleToggleChange}
              color="primary"
            />
          }
          label={is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
        />
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Two-Factor Authentication</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {is2FAEnabled
                ? 'You are about to disable two-factor authentication. Please enter your password to continue.'
                : 'You are about to enable two-factor authentication. Please enter your password to continue.'}
            </DialogContentText>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={handleRedirect} color="primary" autoFocus>
              Continue
            </Button>
          </DialogActions>
        </Dialog>
      </div>

      {/* {qrCode && (
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
      )} */}
    </Card>
  );
};

export default User;

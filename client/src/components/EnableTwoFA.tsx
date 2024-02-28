import React, { useState } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const EnableTwoFA = ({ onTokenVerified }: any) => {
  const [token, setToken] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setAlertMessage] = useState('');
  const [snackbarSeverity, setAlertLevel] = useState<any>('info');

  const handleCloseSnackbar = (event: any, reason: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const verifyToken = async () => {
    try {
      const response = await axios.post('/user/verify-2fa', { token });
      if (response.data.verified) {
        // Token verified successfully
        setAlertMessage('2FA token verified successfully.');
        setAlertLevel('success');
        onTokenVerified && onTokenVerified(true); // Trigger any additional actions on successful verification
      } else {
        // Token verification failed
        setAlertMessage('Failed to verify 2FA token. Please try again.');
        setAlertLevel('error');
        onTokenVerified && onTokenVerified(false);
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      setAlertMessage(
        'An error occurred during verification. Please try again.',
      );
      setAlertLevel('error');
    }
    setOpenSnackbar(true);
  };

  return (
    <div>
      <TextField
        sx={{
          width: 500,
          maxWidth: '100%',
        }}
        id="2FA Verification Code"
        onChange={(e) => setToken(e.target.value)}
        margin="normal"
      /><br/>
      <Button
        variant="contained"
        color="primary"
        onClick={verifyToken}
        sx={{ mt: 2 }}
      >
        Submit
      </Button>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default EnableTwoFA;

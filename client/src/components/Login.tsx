import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Typography, CircularProgress } from '@mui/material';
import { useAuth } from './AuthContext';

const Login: React.FC = () => {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/profile'); // Redirect to the profile page after successful login
    }
  }, [isLoggedIn, navigate]);

  if (isLoggedIn) {
    return <Typography variant="h6">You are already logged in.</Typography>;
  }

  return (
    <Card style={{ padding: '2rem', maxWidth: '400px', margin: '2rem auto' }}>
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={() => {
          setLoading(true);
          login();
        }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Login with 42 Intra'}
      </Button>
    </Card>
  );
};

export default Login;

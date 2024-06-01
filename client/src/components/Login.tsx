// src/components/ButtonLogin.tsx
import React from 'react';
import { Button } from '@mui/material';
import { useAuth } from './AuthContext';

const Login: React.FC<{ text: string }> = ({ text }) => {
  const { login } = useAuth();

  return <Button onClick={login}>{text}</Button>;
};

export default Login;
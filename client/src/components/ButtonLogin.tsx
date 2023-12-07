// ButtonLogin.tsx
import React from 'react';
import Button from '@mui/material/Button';

interface ButtonLoginProps {
  onClick: () => void;
  text: string;
}

const ButtonLogin: React.FC<ButtonLoginProps> = ({ onClick, text }) => {
  return (
    <Button variant="contained" color="primary" onClick={onClick}>
      {text}
    </Button>
  );
};

export default ButtonLogin;

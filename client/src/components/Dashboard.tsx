// src/components/Dashboard.tsx
import React from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import { useAuth } from './Login.tsx';

export default function Dashboard() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { isLoggedIn, logout } = useAuth();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        Dashboard
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={handleClose}>Play Pong</MenuItem>
        {isLoggedIn ? (
          <MenuItem onClick={handleClose}>My Account</MenuItem>
        ) : (
          <MenuItem onClick={handleClose}>Login</MenuItem>
        )}
        {isLoggedIn && <MenuItem onClick={() => { logout(); handleClose(); }}>Logout</MenuItem>}
      </Menu>
    </div>
  );
}

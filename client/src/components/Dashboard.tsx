// src/components/Dashboard.tsx
import React from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { isLoggedIn, logout } = useAuth();
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    handleClose();
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
        <MenuItem onClick={() => handleMenuItemClick('/play')}>
          Play Pong
        </MenuItem>
        {isLoggedIn ? (
          <MenuItem onClick={() => handleMenuItemClick('/profile')}>
            My Account
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleMenuItemClick('/login')}>
            Login
          </MenuItem>
        )}
        {isLoggedIn && (
          <MenuItem
            onClick={() => {
              logout();
              handleClose();
            }}
          >
            Logout
          </MenuItem>
        )}
      </Menu>
    </div>
  );
}

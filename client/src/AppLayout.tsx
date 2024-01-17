// AppLayout.tsx
// import { Container } from '@mui/material';
import { Container, Button } from '@material-ui/core';
import React, { ReactNode, useState } from 'react';
import Col from './components/Col';
import LoginModule from './components/Login';
import { useNavigate } from 'react-router-dom';
import { useUser } from './components/User';

interface AppLayoutProps {
  children?: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const { user } = useUser(); // Access the user context
  const navigate = useNavigate();

  const handleLoginDialogOpen = () => setIsLoginDialogOpen(true);
  const handleLoginDialogClose = () => setIsLoginDialogOpen(false);

  const handleAccountClick = () => {
    // let username = sessionStorage.getItem('login');
    if (user) {
        navigate(`/u/${user.name}`); // Navigate using the user's login
    } else {
      // Handle scenario when no user is logged in
      console.log('No user is logged in.');
    }
  };

  return (
    
    <Container className="root">
      <Col className="app">
        <header>
          <Button onClick={handleLoginDialogOpen}>Log In</Button>
          {/* Account Button */}
          <Button onClick={handleAccountClick}>Account</Button>
          <LoginModule
            open={isLoginDialogOpen}
            handleClose={handleLoginDialogClose}
          />
        </header>
        <Col flexGrow={1} className="page">
          {children}
        </Col>
        <footer>i love feet</footer>
      </Col>
    </Container>
  );
};

export default AppLayout;

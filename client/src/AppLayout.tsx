// AppLayout.tsx
import { Container } from '@mui/material';
import React, { ReactNode, useState } from 'react';
import Col from './components/Col';
import ButtonLogin from './components/ButtonLogin';
import LoginModule from './components/Login';

interface AppLayoutProps {
  children?: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  const handleLoginDialogOpen = () => setIsLoginDialogOpen(true);
  const handleLoginDialogClose = () => setIsLoginDialogOpen(false);

  return (
    <Container className="root">
      <Col className="app">
        <header>
          <ButtonLogin onClick={handleLoginDialogOpen} text="Log In" />
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

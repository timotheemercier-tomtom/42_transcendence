import { Container } from '@mui/material';
import React, { useEffect,useState } from 'react';
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import ButtonLogin from './components/ButtonLogin';
import Col from './components/Col';
import Row from './components/Row';
import Status from './components/Status';
import { API, getLogin } from './util';
import InviteReceiver from './components/InviteReceiver';
import { useAuth } from './components/AuthContext';

const App: React.FC = () => {
    const navigate = useNavigate();
    const [query] = useSearchParams();
    const { setUser, user } = useAuth();
  

  const handle42Login = () => {
    window.location.href = API + '/auth/42';
  };

  const anonlogin = () => {
    location.href = API + `/auth/anon`;
  };

  const handleLogout = () => {
    document.cookie = 'accessToken=; Max-Age=0';
    setUser(null);
    location.reload();
  };

  useEffect(() => {
    const token = query.get('token');
    if (token) {
      document.cookie = 'accessToken=' + token;
      location.search = '';
    }
  }, [navigate, query, setUser]);

  return (
    <Container className="root">
      <InviteReceiver />
      <Col className="app">
        <header>
        <Row>
            {getLogin() ? (
              <ButtonLogin onClick={handleLogout} text="Log Out" />
            ) : (
              <>
                <ButtonLogin onClick={handle42Login} text="Log In" />
                <ButtonLogin onClick={anonlogin} text="anon Log In" />
              </>
            )}
            <Status />
          </Row>
        </header>
        <Col flexGrow={1} className="page">
          <Outlet />
        </Col>
      </Col>
    </Container>
  );
};

export default App;

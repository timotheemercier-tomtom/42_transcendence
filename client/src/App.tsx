import { Container } from '@mui/material';
import React, { useEffect } from 'react';
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import ButtonLogin from './components/ButtonLogin';
import Col from './components/Col';
import Row from './components/Row';
import Status from './components/Status';
import { API } from './util';
import InviteReceiver from './components/InviteReceiver';
import { useAuth } from './components/AuthContext';

const App: React.FC = () => {
  const handle42Login = () => {
    window.location.href = API + '/auth/42';
  };

  const anonlogin = () => {
    location.href = API + `/auth/anon`;
  };

  const navigate = useNavigate();
  const [query] = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = query.get('token');
    if (token) {
      document.cookie = 'accessToken=' + token;
      location.search = '';
    }
  }, [navigate, query, setUser]);

  return (
    <Container className="root" sx={{maxWidth: '1600px!important'}}>
      <InviteReceiver />
      <Col className="app">
        <header>
          <Row>
            <ButtonLogin onClick={handle42Login} text="Log In" />
            <ButtonLogin onClick={anonlogin} text="anon Log In" />
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

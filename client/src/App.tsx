import { Container } from '@mui/material';
import React from 'react';
import { Outlet } from 'react-router-dom';
import ButtonLogin from './components/ButtonLogin';
import Col from './components/Col';
import Row from './components/Row';
import Status from './components/Status';
import { API } from './util';

const App: React.FC = () => {
  const handle42Login = () => {
    window.location.href = API + '/auth/42';
  };

  const anonlogin = () => {
    location.href = API + `/auth/anon`;
  };

  return (
    <Container className="root">
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

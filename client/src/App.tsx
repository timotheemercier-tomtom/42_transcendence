import { Container, Switch } from '@mui/material';
import React from 'react';
import { Outlet, Route, Router } from 'react-router-dom';
import Col from './components/Col';
import Row from './components/Row';
import Status from './components/Status';
import { API } from './util';
import GameMaker from './components/GameMaker';
import { Dashboard } from '@mui/icons-material';
import Login from './components/Login';
import { AuthProvider } from './components/AuthContext';

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
          <meta name="viewport" content="initial-scale=1, width=device-width" />
          <Row>
            <Dashboard />
            {/* <Login onClick={handle42Login} text="Log In" /> */}
            {/* <Login onClick={anonlogin} text="anon Log In" /> */}
            <Status />
            <GameMaker />
            {/* <Button onClick={handle42Login}>Log In</Button> */}

            {/* <Button onClick={handleAccountClick}>Account</Button>{' '} */}
            {/* <Link to="/u/@self">Account</Link> */}
            {/* Updated this button */}
          </Row>
        </header>
        <Col flexGrow={1} className="page">
          <Outlet />
        </Col>
        <footer>
          <a href="https://stallman.org/photos/rms-working/dsc00367.jpg">
            average gnome user
          </a>
        </footer>
      </Col>
    </Container>
  );
};
export default App;

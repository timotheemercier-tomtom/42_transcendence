import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
// import User, { UserProvider } from './components/User';
import { Container } from '@mui/material';
import ButtonLogin from './components/ButtonLogin';
import Col from './components/Col';
import Error404 from './pages/Error404';
import Home from './pages/Home';
import LoginResult from './pages/LoginResult';
import Profile from './pages/Profile';
import Room from './pages/Room';
import Status from './components/Status';
import Row from './components/Row';
import { API } from './util';

// import LoginModule from './components/Login';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <Error404 />,
  },
  {
    path: '/r/:id',
    element: <Room />,
  },
  {
    element: <LoginResult />,
    path: '/login',
  },
  {
    element: <Profile />,
    path: '/u/:login',
  },
]);

// const App: React.FC = () => {
//   const navigate = useNavigate();
//   const userContext = useContext(UserContext); // Utiliser useContext pour accéder au UserContext
//   const user = userContext ? userContext.user : null; // Accéder à l'utilisateur

const App: React.FC = () => {
  const handle42Login = () => {
    window.location.href = API + '/auth/42';
  };

  const anonlogin = () => {
    location.href = API + `/auth/anon`;
  };

  //   const handleAccountClick = () => {};

  return (
    // <UserProvider>
    <Container className="root">
      <Col className="app">
        <header>
          <Row>
            <ButtonLogin onClick={handle42Login} text="Log In" />
            <ButtonLogin onClick={anonlogin} text="anon Log In" />
            <Status />

            {/* <Button onClick={handle42Login}>Log In</Button> */}

            {/* <Button onClick={handleAccountClick}>Account</Button>{' '} */}
            {/* <Link to="/u/@self">Account</Link> */}
            {/* Updated this button */}
          </Row>
        </header>
        <Col flexGrow={1} className="page">
          <RouterProvider router={router} />
        </Col>
        <footer>
          <a href="https://stallman.org/photos/rms-working/dsc00367.jpg">
            average gnome user
          </a>
        </footer>
      </Col>
    </Container>
    // </UserProvider>
  );
};
export default App;

import React, { ReactNode, useContext, useState } from 'react';
import { createBrowserRouter, Link, RouterProvider } from 'react-router-dom';
// import User, { UserProvider } from './components/User';
import Home from './pages/Home';
import Room from './pages/Room';
import LoginResult from './pages/LoginResult';
import Error404 from './pages/Error404';
import { Container, Button } from '@mui/material';
import Col from './components/Col';
import User from './components/User';
import Profile from './pages/Profile';
import ButtonLogin from './components/ButtonLogin';

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
    element: <User />,
    path: '/u/:username',
  },
]);

// const App: React.FC = () => {
//   const navigate = useNavigate();
//   const userContext = useContext(UserContext); // Utiliser useContext pour accéder au UserContext
//   const user = userContext ? userContext.user : null; // Accéder à l'utilisateur

const App: React.FC = () => {
  const handle42Login = () => {
    window.location.href = 'http://localhost:3000/auth/42';
  };

//   const handleAccountClick = () => {};

  return (
    // <UserProvider>
    <Container className="root">
      <Col className="app">
        <header>
          {/* <Button onClick={handle42Login}>Log In</Button> */}
          <ButtonLogin onClick={handle42Login} text="Log In" />

          {/* <Button onClick={handleAccountClick}>Account</Button>{' '} */}
          {/* <Link to="/u/@self">Account</Link> */}
          {/* Updated this button */}
        </header>
        <Col flexGrow={1} className="page">
          <RouterProvider router={router} />
        </Col>
        <footer>i love feet because i'm a weirdo</footer>
      </Col>
    </Container>
    // </UserProvider>
  );
};
export default App;

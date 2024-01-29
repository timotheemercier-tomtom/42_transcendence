import React, { ReactNode, useContext } from 'react';
import { createBrowserRouter, Link, RouterProvider } from 'react-router-dom';
// import User, { UserProvider } from './components/User';
import Home from './pages/Home';
import Room from './pages/Room';
import LoginResult from './pages/LoginResult';
import Error404 from './pages/Error404';
import { Container } from '@mui/material';
import Col from './components/Col';
import User from './components/User';
import ButtonLogin from './components/ButtonLogin';
import MenuAppBar from './components/AppBar';

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
    path: '/u/:login',
  },
]);

const App: React.FC = () => {
  const handle42Login = () => {
    window.location.href = 'http://localhost:3000/auth/42';
  };

  return (
    <Container className="root">
      <Col className="app">
        <header>
          {/* <MenuAppBar onLogin={handle42Login} />  */}
          <br />
          <ButtonLogin onClick={handle42Login} text="Log In" />
        </header>
        <Col flexGrow={1} className="page">
          <RouterProvider router={router} />
        </Col>
        <footer>i love feet because i'm a weirdo</footer>
      </Col>
    </Container>
  );
};
export default App;

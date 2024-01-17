import React, { ReactNode, useContext, useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { UserContext, UserProvider } from './components/User';
import Home from './pages/Home';
import Room from './pages/Room';
import LoginResult from './pages/LoginResult';
import { Profile } from './pages/Profile';
import Error404 from './pages/Error404';
import { Container, Button } from '@mui/material';
import Col from './components/Col';
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
    path: '/u/:id',
  },
]);


const App: React.FC = () => {
  //   const navigate = useNavigate();
  //   const userContext = useContext(UserContext); // Utiliser useContext pour accéder au UserContext
  //   const user = userContext ? userContext.user : null; // Accéder à l'utilisateur

  const handle42Login = () => {
    window.location.href = 'http://localhost:3000/auth/42';
  };

    const handleAccount = () => {
  //     // let username = sessionStorage.getItem('login');
//       if (user) {
//   //         navigate(`/u/${user.username}`);
//   //     } else {
//   //         handleLoginDialogOpen();
//       }
    };
  return (
    <UserProvider>
      <Container className="root">
        <Col className="app">
          <header>
            <Button onClick={handle42Login}>Log In</Button>
            <Button onClick={handle42Login}>Account</Button>

          </header>
          <Col flexGrow={1} className="page">
            <RouterProvider router={router} />
          </Col>
          <footer>i love feet because i'm a weirdo</footer>
        </Col>
      </Container>
    </UserProvider>
  );
};
export default App;

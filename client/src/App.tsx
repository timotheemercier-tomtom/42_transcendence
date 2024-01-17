import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { UserProvider } from './components/User';
import AppLayout from './AppLayout';
import Home from './pages/Home';
import Room from './pages/Room';
import LoginResult from './pages/LoginResult';
import User from './components/User';
import Error404 from './pages/Error404';
import theme from './theme';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AppLayout>
        <Home />
      </AppLayout>
    ),
    errorElement: <Error404 />,
  },
  {
    path: '/r/:id',
    element: (
      <AppLayout>
        <Room />
      </AppLayout>
    ),
  },
  {
    element: (
      <AppLayout>
        <LoginResult />
      </AppLayout>
    ),

    path: '/login',
  },
  {
    element: (
      <AppLayout>
        <User />
      </AppLayout>
    ),
    path: '/u/:id',
  },
]);

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;

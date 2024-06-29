import { CssBaseline } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.tsx';
import './css/index.css';
import Error404 from './pages/Error404.tsx';
import LoginResult from './pages/LoginResult.tsx';
import Room from './pages/Room.tsx';
import Home from './pages/Home.tsx';
import User from './components/User.tsx';
import Dashboard from './components/Dashboard.tsx';
import MatchHistoryPage from './pages/MatchHistoryPage.tsx';
import Profile from './pages/Profile.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <Error404 />,
    children: [
      {
        path: '',
        element: <Home />,
      },
      {
        path: 'r/:id',
        element: <Room />,
      },
      {
        path: 'login',
        element: <LoginResult />,
      },
      {
        path: 'u/:login',
        element: <Profile />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'play',
        element: <div>Play Pong - Component Placeholder</div>, // Replace with actual component
      },
      {
        path: 'matchhistory',
        element: <MatchHistoryPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CssBaseline />
    <RouterProvider router={router} />
  </React.StrictMode>,
);

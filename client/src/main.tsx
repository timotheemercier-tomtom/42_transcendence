import { CssBaseline } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.tsx';
import './css/index.css';
import Error404 from './pages/Error404.tsx';
import Room from './pages/Room.tsx';
import Home from './pages/Home.tsx';
import MatchHistoryPage from './pages/MatchHistoryPage.tsx';
import RankingPage from './pages/RankingPage.tsx';
import Profile from './pages/Profile.tsx';
import TwoFAVerify from './pages/TwoFAVerify.tsx';
import { AuthProvider } from './components/AuthContext.tsx';

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
      {
        path: 'ranking',
        element: <RankingPage />,
      },
      {
        path: '2fa-verify/:login',
        element: <TwoFAVerify />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CssBaseline />
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);

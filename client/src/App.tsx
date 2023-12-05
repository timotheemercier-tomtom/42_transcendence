import { Container } from '@mui/material';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import ButtonLogin from './components/ButtonLogin';
import Col from './components/Col';
import Error404 from './pages/Error404';
import Home from './pages/Home';
import Room from './pages/Room';
import LoginResult from './pages/LoginResult';
import UserProfile from './components/UserProfile';

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
    element: <UserProfile />,
    path: '/p/:id',
  },
]);

export default function App() {
  return (
    <Container className="root">
      <Col className="app">
        <header>
          <ButtonLogin />
          <UserProfile />
        </header>
        <Col flexGrow={1} className="page">
          <RouterProvider router={router} />
        </Col>
        <footer>i love feet</footer>
      </Col>
    </Container>
  );
}

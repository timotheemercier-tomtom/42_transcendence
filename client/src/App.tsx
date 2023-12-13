import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Error404 from './pages/Error404';
import Home from './pages/Home';
import Room from './pages/Room';
import LoginResult from './pages/LoginResult';
import UserProfile from './components/Profile';
import AppLayout from './AppLayout';
import ButtonLogin from './components/ButtonLogin';
import { UserProvider } from './pages/User';

import { Container } from '@mui/material';
import Col from './components/Col';

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

const App: React.FC = () => {
  return (
    <AppLayout>
      <RouterProvider router={router} />
    </AppLayout>
  );
};

export default App;
// export default function App() {
//   return (
//     <Container className="root">
//       <Col className="app">
//         <header>
//           <ButtonLogin />
//         </header>
//         <Col flexGrow={1} className="page">
//           <UserProfile />
//           <RouterProvider router={router} />
//         </Col>
//         <footer>i love feet</footer>
//       </Col>
//     </Container>
//   );
// }

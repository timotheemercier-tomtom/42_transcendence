import { Link, RouterProvider, createBrowserRouter } from 'react-router-dom';
import './css/App.css';
import Error404 from './pages/Error404';
import Home from './pages/Home';
import Room from './pages/Room';
import ButtonLogin from './components/ButtonLogin';
import LoginResult from './pages/LoginResult';


const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    element: <Error404 />,
  },
  {
    path: '/r/:id',
    element: <Room />,
  },
  {
    element: <LoginResult />,
    path: '/login'
  },
]);

export default function App() {
  return (
    <div>
      <header>
        <nav></nav>
        <ButtonLogin />
      </header>
      <main>
        <RouterProvider router={router} />
      </main>
      <footer>footer</footer>
    </div>
  );
}

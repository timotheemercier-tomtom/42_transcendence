import { Link, RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.css";
import Error404 from "./page/Error404";
import Home from "./page/Home";
import Room from "./page/Room";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    element: <Error404 />,
  },
  {
    path: "/r/:id",
    element: <Room />,
  },
]);

function App() {
  return (
    <div>
      <header>
        header
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <main>
        <RouterProvider router={router} />
      </main>
      <footer>footer</footer>
    </div>
  );
}

export default App;

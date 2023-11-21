import "./App.css";
import { BrowserRouter as Router, Link, Route, Routes } from "react-router-dom";
import Error404 from "./page/Error404";
import Home from "./page/Home";

function App() {
  return (
    <>
      <Router>
        <div>
          <header>
            header
            <nav>
              <Link to="/">Home</Link>
              <Link to="/about">About</Link>
            </nav>
          </header>
          <main>
            <Routes>
              <Route path="/" Component={Home} />
              <Route path="*" Component={Error404} />
            </Routes>
          </main>
          <footer>footer</footer>
        </div>
      </Router>
    </>
  );
}

export default App;

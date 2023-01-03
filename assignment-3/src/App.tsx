import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import { Link, Route, Routes, useLocation } from "react-router-dom";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Game from "./components/Game";
import Home from "./components/Home";
import Leaderboard from "./components/Leaderboard";
import Login from "./components/Login";
import Profile from "./components/Profile";
import SignUp from "./components/SignUp";
import { clearMessage } from "./actions/message";
import { logout } from "./actions/auth";

const App = () => {
  const { isLoggedIn } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();

  let location = useLocation();

  useEffect(() => {
    dispatch(clearMessage());
  }, [dispatch, location])

  const logOut = useCallback(() => {
    dispatch((logout() as any));
  }, [dispatch]);

  return (
    <div className="h-100">
      <nav className="navbar navbar-expand navbar-dark bg-dark">
        {isLoggedIn ? (
          <div className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link to={"/profile"} className="nav-link">
                Profile
              </Link>
            </li>
            <li className="nav-item">
                <Link to={"/game"} className="nav-link">
                  Play
                </Link>
            </li>
            <li className="nav-item">
              <Link to={"/leaderboard"} className="nav-link">
                Leaderboard
              </Link>
            </li>
            <li className="nav-item">
              <Link to={"/login"} className="nav-link" onClick={logOut}>
                Logout
              </Link>
            </li>
          </div>
        ) : (
          <div className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link to={"/login"} className="nav-link">
                Login
              </Link>
            </li>

            <li className="nav-item">
              <Link to={"/signup"} className="nav-link">
                Create account
              </Link>
            </li>
          </div>
        )}
      </nav>

      <div className="container mt-3">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/game" element={<Game />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </div>

    </div>
  );
};

export default App;
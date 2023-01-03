import { useDispatch, useSelector } from "react-redux";

import { MESSAGE_WAS_A_SUCCESS } from '../actions/types';
import { Navigate } from 'react-router-dom';
import { emptyMessage } from "../actions/message";
import { login } from "../actions/auth";
import { useState } from "react";

const Login = () => {
  const dispatch = useDispatch();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { isLoggedIn } = useSelector((state: any) => state.auth);
  const { message, type } = useSelector((state: any) => state.message);
  
  const [invalidPassword, setInvalidPassword] = useState(true);
  const [invalidUsername, setInvalidUsername] = useState(true);

  
  if (isLoggedIn) {
    return <Navigate to="/game" />;
  }

  const onChangeUsername = (e: any) => {
    validateUsername(e);
    const username = e.target.value;
    setUsername(username);
  };

  const onChangePassword = (e: any) => {
    validatePassword(e);
    const password = e.target.value;
    setPassword(password);
  };

  const validateUsername = (e: any) => {
    if(e.target.value.length < 3 || e.target.value.length > 12) {
      setInvalidUsername(true);
      return;
    }
    setInvalidUsername(false);
}

const validatePassword = (e: any) => {
  if(e.target.value.length < 3 || e.target.value.length > 12) {
    setInvalidPassword(true);
    return;
  }
  setInvalidPassword(false);
}
const handleLogin = () => {
  dispatch((emptyMessage()));
  dispatch((login(username, password)) as any)
};


  return (
      <div className="main">
        {(
    
            <div className="containerr">
                  <h4>Login</h4>
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={username}
                    onChange={onChangeUsername}
                  />
             
        
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={onChangePassword}
                  />
              

                {invalidPassword && username.length > 0 && (
                  <div className="text-danger">Password should be between 3 - 12 letters</div>
                )}
  
                <div className="containerr">
                  <button type="submit" onClick={handleLogin} className="btn btn-primary">Login</button>
                </div>
              </div>
            )}

            {message && (
              
                <div className={type === MESSAGE_WAS_A_SUCCESS ? 'alert alert-success' : 'alert alert-danger'} role="alert">
                  <div>{message}</div>
                </div>
             
            )}
        </div>
    );
};
export default Login;


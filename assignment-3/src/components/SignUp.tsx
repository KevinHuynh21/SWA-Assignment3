import { useDispatch, useSelector } from "react-redux";

import { MESSAGE_WAS_A_SUCCESS } from "../actions/types";
import { Navigate } from "react-router-dom";
import { createAccount } from "../actions/auth";
import { useState } from "react";

const SignUp = () => {
    const dispatch = useDispatch();

    const { isLoggedIn } = useSelector((state: any) => state.auth);
    const { message, type } = useSelector((state: any) => state.message);

    const [username, setUsername] = useState(``);
    const [password, setPassword] = useState(``);

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
        validatePassword(e)
        const password = e.target.value;
        setPassword(password);
    };

    /* ---------------------------- SIMPLE VALIDATION --------------------------- */

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

    const handlecreateAccount = () => {
      dispatch((createAccount(username, password)) as any)
    };


     return (
        <div className="col-md-4 mx-auto h-100">
        <div className="card card-container p-4 my-auto">
          <img
            src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
            alt="profile-img"
            width="100"
            height="100"
            className="profile-img-card rounded mx-auto mb-4 mt-4"
          />
  
            {(
              <div>
                <div className="form-group mt-2">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    name="username"
                    value={username}
                    onChange={onChangeUsername}
                  />
                </div>

                {invalidUsername && username.length > 0 && (
                  <div className="text-danger">Username should be between 3 - 12</div>
                )}
  
                <div className="form-group mt-2">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={password}
                    onChange={onChangePassword}
                  />
                </div>

                {invalidPassword && password.length > 0 && (
                  <div className="text-danger">Password should be between 3 - 12</div>
                )}
  
                <div className="form-group mt-4">
                  <button disabled={invalidPassword || invalidUsername} onClick={handlecreateAccount} className="btn btn-primary btn-block w-100">Sign Up</button>
                </div>
              </div>
            )}

            {message && (
              <div className="form-group mt-4">
                <div className={type === MESSAGE_WAS_A_SUCCESS ? 'alert alert-success' : 'alert alert-danger'} role="alert">
                  <div>{message}</div>
                </div>
              </div>
            )}
        </div>
      </div>
    );
};
  
export default SignUp;
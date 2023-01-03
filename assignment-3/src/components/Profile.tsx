import {getUser, updateUserData} from "../actions/auth";
import {useDispatch, useSelector} from "react-redux";
import {useCallback, useEffect, useState} from "react";

import { MESSAGE_WAS_A_SUCCESS } from "../actions/types";
import { Link, Navigate } from "react-router-dom";
import { emptyMessage } from "../actions/message";
import { logout } from "../actions/auth";

const Profile = () => {
  const dispatch = useDispatch();

  const { message, type } = useSelector((state: any) => state.message);
  const { user, isLoggedIn } = useSelector((state: any) => state.auth);

  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [invalidPassword, setInvalidPassword] = useState(false);

  useEffect(() => {
    dispatch((getUser(user.userId)) as any)
  }, [dispatch])

  useEffect(() => {
    setUsername(user.username);
  }, [dispatch, user])

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  const Logout = ()=>{
    dispatch((logout() as any));
  }

  const onChangeNewPassword = (e: any) => {
    setInvalidPassword(false);
    const password = e.target.value;
    setNewPassword(password || ``);
  };

  const onChangeOldPassword = (e: any) => {
    setInvalidPassword(false);
    const password = e.target.value;
    setOldPassword(password || ``);
  };

  const handleSave = () => {
    setInvalidPassword(false);
    dispatch((emptyMessage()));

    // More save to have this kind of validation on serverside instead of having user password in state
    if (oldPassword !== user.password) {
      setInvalidPassword(true);
      return;
    }

    dispatch(updateUserData(user.userId, {
      username,
      password: newPassword,
    }) as any);
  }

  return (

        <div>
          {(
              <div >
                <div className="containerr">
                  <label htmlFor="username">Username</label>
                  <input
                      disabled
                      type="text"
                      name="username"
                      value={username || ``}
                  />
                </div>

                <div className="containerr">
                  <label htmlFor="password">Old password</label>
                  <input
                      type="password"
                      name="password"
                      value={oldPassword || ``}
                      onChange={onChangeOldPassword}
                  />
                </div>

                <div className="containerr">
                  <label htmlFor="password">New password</label>
                  <input
                      type="password"
                      name="password"
                      value={newPassword || ``}
                      onChange={onChangeNewPassword}
                  />
                </div>

                <div className="containerr">
                  <button onClick={handleSave} className="btn btn-primary">Save changes</button>
                </div>

                <div className="containerr">
                  <button onClick={Logout} className="btn btn-primary">
                  <Link to={"/login"} className="nav-link" onClick={Logout}>
                    Logout
                  </Link></button>
                </div>


                {invalidPassword && (
                  <div className="alert alert-danger" role="alert">Old password is incorrect!</div>
                )}
              </div>
          )}

          {message && (
              <div className="containerr">
                <div className={type === MESSAGE_WAS_A_SUCCESS ? 'alert alert-success' : 'alert alert-danger'} role="alert">
                  <div>{message}</div>
                </div>
              </div>
          )}
        </div>
  );
};

export default Profile;
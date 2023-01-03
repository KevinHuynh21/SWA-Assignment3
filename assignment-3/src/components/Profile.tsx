import {getUser, updateUserData} from "../actions/auth";
import {useDispatch, useSelector} from "react-redux";
import {useEffect, useState} from "react";

import { MESSAGE_WAS_A_SUCCESS } from "../actions/types";
import { Navigate } from "react-router-dom";
import { clearMessage } from "../actions/message";

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
    dispatch((clearMessage()));

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
                      disabled
                      type="text"
                      className="form-control"
                      name="username"
                      value={username || ``}
                  />
                </div>

                <div className="form-group mt-2">
                  <label htmlFor="password">Old password</label>
                  <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={oldPassword || ``}
                      onChange={onChangeOldPassword}
                  />
                </div>

                <div className="form-group mt-2">
                  <label htmlFor="password">New password</label>
                  <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={newPassword || ``}
                      onChange={onChangeNewPassword}
                  />
                </div>

                <div className="form-group mt-4">
                  <button onClick={handleSave} className="btn btn-primary btn-block w-100">Save</button>
                </div>

                {invalidPassword && (
                  <div className="alert alert-danger mt-4" role="alert">Old password is incorrect!</div>
                )}
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

export default Profile;
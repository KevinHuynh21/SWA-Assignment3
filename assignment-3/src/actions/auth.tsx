import {
  CREATED_USER_FAIL,
  CREATED_USER_SUCCESS,
  UPDATE_MESSAGE,
  UPDATE_USER,
  EMPTY_CURRENT,
  LOGIN_FAIL,
  LOGIN_SUCCESS,
  LOGOUT,
  MESSAGE_FAIL_ERROR,
  MESSAGE_WAS_A_SUCCESS,
} from "./types";

import AuthService from "../services/auth.service";


export const login = (username: string, password: string) => (dispatch: any) => {
    return AuthService.login(username, password).then(
      (data) => {
        dispatch({
          type: LOGIN_SUCCESS,
          payload: { user: data },
        });
        return Promise.resolve();
    },
    (error) => {
      let message;
      if (error.message.includes(`403`)) {
        message = `Invalid login or password`;
      }

      if (!error.message.includes(`403`)) {
        message =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
      }

      dispatch({
        type: LOGIN_FAIL,
      });

      dispatch({
        type: UPDATE_MESSAGE,
        payload: {
          message,
          type: MESSAGE_FAIL_ERROR,
        },
      });

      return Promise.reject();
    }
  );
};

export const logout = () => (dispatch: any) => {
  AuthService.logout();

  dispatch({
    type: EMPTY_CURRENT,
  });

  dispatch({
    type: LOGOUT,
  });
};

export const createAccount = (username: string, password: string) => (dispatch: any) => {
  AuthService.createAccount(username, password).then(
    (response) => {
      dispatch({
          type: CREATED_USER_SUCCESS,
      });

      dispatch({
        type: UPDATE_MESSAGE,
        payload: {
         message: `Account created successfully`,
         type: MESSAGE_WAS_A_SUCCESS,
        },
      });

      return Promise.resolve();
    },
    (error) => {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
      error.message ||
      error.toString();

    dispatch({
      type: CREATED_USER_FAIL,
    });

    dispatch({
      type: UPDATE_MESSAGE,
      payload: {
        message,
        type: MESSAGE_FAIL_ERROR,
      },
    });
    return Promise.reject();
  }
);
};

export const getUser = (userId: number) => (dispatch: any)  => {
  return AuthService.getUser(userId).then(
    (response) => {
        dispatch({
            type: UPDATE_USER,
            payload: {
              username: response.username,
              password: response.password,
            }
        });

        return Promise.resolve();
    },
    (error) => {
        const message =
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
            error.message ||
            error.toString();
        dispatch({
            type: UPDATE_MESSAGE,
            payload: {
              message,
              type: MESSAGE_FAIL_ERROR,
            },
        });
        return Promise.reject();
    }
);

}

export const updateUserData = (accountId: number, body: any) => (dispatch: any) => {
    return AuthService.updateUser(accountId, body).then(
        (response) => {

            dispatch({
                type: UPDATE_MESSAGE,
                payload: {
                  message: `Account was updated`,
                  type: MESSAGE_WAS_A_SUCCESS,
                },
            });

            return Promise.resolve();
        },
        (error) => {
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();

            dispatch({
                type: UPDATE_MESSAGE,
                payload: {
                  message,
                  type: MESSAGE_FAIL_ERROR,
                },
            });
            return Promise.reject();
        }
    );
}

  
/* eslint-disable import/no-anonymous-default-export */

import {
  LOGIN_FAIL,
  LOGIN_SUCCESS,
  LOGOUT,
  CREATED_USER_FAIL,
  CREATED_USER_SUCCESS,
  UPDATE_USER,
} from "../actions/types";

const user = JSON.parse(localStorage.getItem("user") as string);
  
  const initialState = user
    ? { isLoggedIn: true, user }
    : { isLoggedIn: false, user: null };
  
  export default function (state = initialState, action: any) {
    const { type, payload } = action;
  
    switch (type) {
      case CREATED_USER_SUCCESS:
        return {
          ...state,
          isLoggedIn: false,
        };
      case CREATED_USER_FAIL:
        return {
          ...state,
          isLoggedIn: false,
        };
      case LOGIN_SUCCESS:
        return {
          ...state,
          isLoggedIn: true,
          user: payload.user,
        };
      case LOGIN_FAIL:
        return {
          ...state,
          isLoggedIn: false,
          user: null,
        };
      case LOGOUT:
        return {
          ...state,
          isLoggedIn: false,
          user: null,
        };
      case UPDATE_USER: {
        return {
          ...state,
          user: {
            ...state.user,
            username: payload.username,
            password: payload.password,
          }
        }
      }
      default:
        return state;
    }

    
  }


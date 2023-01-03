/* eslint-disable import/no-anonymous-default-export */
import { EMPTY_MESSAGE, UPDATE_MESSAGE } from "../actions/types";

const initialState = {};

export default function (state = initialState, action: any) {
  const { type, payload } = action;

  switch (type) {
    case UPDATE_MESSAGE:
      return { 
        message: payload.message,
        type: payload.type, 
      };

    case EMPTY_MESSAGE:
      return { 
        message: null,
        type: null, 
      };

    default:
      return state;
  }
}
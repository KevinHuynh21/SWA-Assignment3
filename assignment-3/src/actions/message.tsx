import { EMPTY_MESSAGE, UPDATE_MESSAGE } from "./types";

export const setMessage = (msg: any) => ({
  type: UPDATE_MESSAGE,
  payload: msg,
});

export const clearMessage = () => ({
  type: EMPTY_MESSAGE,
});
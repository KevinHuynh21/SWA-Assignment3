import { EMPTY_MESSAGE, UPDATE_MESSAGE } from "./types";

export const updateMessage = (msg: any) => ({
  type: UPDATE_MESSAGE,
  payload: msg,
});

export const emptyMessage = () => ({
  type: EMPTY_MESSAGE,
});
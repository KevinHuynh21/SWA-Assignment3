import auth from "./auth";
import { combineReducers } from "redux";
import game from "./game";
import message from "./message";

export default combineReducers({
  auth,
  message,
  game
});
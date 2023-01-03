/* eslint-disable import/no-anonymous-default-export */

import { ADD_SCORE, BOARD_WAS_CREATED, EMPTY_CURRENT, EMPTY_CHOSEN, END_GAME, ORIGINAL_ITEM_CHOSEN, NEW_ITEM_CHOSEN, UPDATE_GAMES } from "../actions/types";

const gameId = JSON.parse(localStorage.getItem("currentGameId") as string);

interface Action {
    type: string;
    payload: any;
}

const initialState = {
    points: 0,
    currentMove: 0,
    maxMoves: 10,
    completed: false,
    gameId,
};

export default function (state = initialState, action: Action) {
  const { type, payload } = action;

  switch (type) {
    case BOARD_WAS_CREATED: 
        return {
            ...state,
            board: payload.board,
            gameId: payload.id,
            colourGenerator: payload.colourGenerator,
            originalItem: payload.originalItem,
            currentMove: payload.currentMove || 0,
            points: payload.score,
            completed: payload.completed || false,
        }
        case ORIGINAL_ITEM_CHOSEN: 
        return {
            ...state,
            originalItem: payload.originalItem,
        }
        case NEW_ITEM_CHOSEN: 
        return {
            ...state,
            board: payload.board,
            currentMove: state.currentMove += 1,
            originalItem: null,
        }
        case END_GAME:
            return {
                ...state,
                completed: true,
            }
        case UPDATE_GAMES:
            return {
                ...state,
                games: payload.games,
            }
        case EMPTY_CHOSEN:
            return {
                ...state,
                originalItem: null,
            }
        case EMPTY_CURRENT:
            return {
                ...state,
                board: null,
                gameId: null,
                colourGenerator: null,
                originalItem: null,
                points: 0,
                currentMove: 0,
                completed: false,
            }
        case ADD_SCORE:
            return {
                ...state,
                points: state.points += payload.point
            }
    default:
      return state;
  }
}
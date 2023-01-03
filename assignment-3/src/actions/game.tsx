import { ADD_SCORE, BOARD_WAS_CREATED, EMPTY_CURRENT, EMPTY_MESSAGE, EMPTY_CHOSEN, END_GAME, ORIGINAL_ITEM_CHOSEN, MESSAGE_FAIL_ERROR, NEW_ITEM_CHOSEN, UPDATE_GAMES, UPDATE_MESSAGE } from './types'
import { canMove, emptyCurrent, create, createGame, getGame, getGames, firstCheck, move, updateGame } from '../services/game.service'

import { RandomColorGenerator } from '../utils/random-color-generator';

export const createBoard = (userId: number, gameId: any) => (dispatch: any) => {
    const colourGenerator = new RandomColorGenerator();

    // Clears all matches before save in state
    const newBoard = create(colourGenerator, 4, 4);
    const { board } = firstCheck(colourGenerator, newBoard);

    createGame(userId).then((data) => {
        updateGame(data.id, {
            board,
        });
    
        dispatch({
            type: BOARD_WAS_CREATED,
            payload: {
                board,
                colourGenerator,
                score: 0,
                id: data.id
            }
        })

        dispatch({
            type: EMPTY_MESSAGE,
        })
    }).catch((err) => {
        dispatch({
            type: UPDATE_MESSAGE,
            payload: {
                message: err.message,
                type: MESSAGE_FAIL_ERROR,
            },
        })
    });
}

export const getAllGames = () => (dispatch: any) => {
    getGames().then((result) => {
        dispatch({
            type: UPDATE_GAMES,
            payload: {
                games: result.data,
            }
        })
    }).catch((err) => {
        dispatch({
            type: UPDATE_MESSAGE,
            payload: {
                message: err.message,
                type: MESSAGE_FAIL_ERROR,
            },
        })
    });
}

export const getCurrentlySavedGame = (gameId: number) => (dispatch: any) => {
    getGame(gameId).then((game) => {
        const colourGenerator = new RandomColorGenerator();
        dispatch({
            type: BOARD_WAS_CREATED,
            payload: {
                board: game.board,
                colourGenerator,
                score: game.score,
                id: gameId,
                currentMove: game.currentMove,
                originalItem: game.originalItemChosen,
                completed: false, 
            }
        })
    }).catch((err) => {
        dispatch({
            type: UPDATE_MESSAGE,
            payload: {
                message: err.message,
                type: MESSAGE_FAIL_ERROR,
            },
        })
    });
}

export const endGame = (gameId: number) => (dispach: any) => {
    updateGame(gameId, {
        completed: true,
    });

    dispach({
        type: END_GAME,
    })
}

export const emptyCurrentGame = (gameId: number) => (dispach: any) => {
    emptyCurrent();
    dispach({
        type: EMPTY_CURRENT,
    })
}

export const chooseOriginalItem = (item: any, gameId: number) => (dispach: any) => {
    updateGame(gameId, {
        originalItemChosen: item,
    });
    dispach({
        type: ORIGINAL_ITEM_CHOSEN,
        payload: {
            originalItem: item,
        }
    })
}

export const emptyChosen = (gameId: number) => (dispatch: any) => {
    updateGame(gameId, {
        originalItemChosen: null,
    });

    dispatch({
        type: EMPTY_CHOSEN,
    });
}

export const chooseNewItem = (board: any, colourGenerator: any, originalItem: any, newItem: any, gameId: number, points: number, currentMove: number) => (dispach: any) => {
    // Check move possiblity before save in state
    if (!canMove(board, originalItem.position, newItem.position)) {
        return;
    }
    const result = move(colourGenerator, board, originalItem.position, newItem.position);

    const matches = result.effects.filter((effect) => {
        return effect.kind === `Match`;
    });

    let score = 0;
    matches.forEach(() => {
        return score += 10;
    })

    updateGame(gameId, {
        score: points + score,
        board: result.board,
        originalItemChosen: null,
        currentMove: currentMove + 1,
    });


    dispach({
        type: ADD_SCORE,
        payload: {
            point: score
        }
    });

    dispach({
        type: NEW_ITEM_CHOSEN,
        payload: {
            board: result.board
        }
    })
}
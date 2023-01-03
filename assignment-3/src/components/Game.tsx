import { emptyCurrentGame, emptyChosen, createBoard, endGame, getCurrentlySavedGame, chooseOriginalItem, chooseNewItem } from '../actions/game'
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import { Navigate } from 'react-router-dom';
import { useEffect } from 'react'

const Game = () => {
    const dispatch = useDispatch();

    const { board, originalItem, colourGenerator, points, gameId, currentMove, maxMoves, completed } = useSelector((state: any) => { return state.game}, shallowEqual);
    const { isLoggedIn, user } = useSelector((state: any) => state.auth);
    const { message } = useSelector((state: any) => state.message);
    
    useEffect(() => {
        if (currentMove >= maxMoves) {
            dispatch((endGame(gameId)) as any);
        }
    }, [dispatch, currentMove, board])

    useEffect(() => {
        if (gameId && !board) {
            dispatch((getCurrentlySavedGame(gameId)) as any);
        }
    }, [dispatch])

    if (!isLoggedIn) {
      return <Navigate to="/login" />;
    }

    const doCreateBoard = () => {
        dispatch((createBoard(user.userId, gameId)) as any)
    };

    const doEmptyBoard = () => {
        dispatch(emptyCurrentGame(gameId) as any)
    }

    const doEmptyChosen = () => {
        dispatch((emptyChosen(gameId)) as any)
    }


    const doChosenItem = (item: any) => {
        if(completed) {
            return;
        }

        if (!originalItem) {
            dispatch((chooseOriginalItem(item, gameId)) as any)
            return;
        }

        dispatch((chooseNewItem(board, colourGenerator, originalItem, item, gameId, points, currentMove)) as any)
    }

    const createRow = (items: any[]) => {
        const rowToDisaply = [];

        for(let i = 0 ; i < items.length; i++) {
            let selectedStyle = ``;
            const style = {
                backgroundColor: items[i].value,
            };

            if (isSelectedElement(items[i])) {
                selectedStyle = `tilePiece-selected`;
            }

            rowToDisaply.push(<td onClick={() => doChosenItem({ ...items[i]})} key={i} className={"tilePiece" + selectedStyle} style={style}></td>)
        }
        return rowToDisaply;
    }

    const isSelectedElement = (item: any) => {
        if (originalItem?.position.col === item.position.col && originalItem?.position.row === item.position.row) {
            return true;
        }
    }
    

    const makeBoard = () => {
        if(!board) {
            return;
        }
        const rows = [];
        const madeBoard = [];

        for (let i = 0; i < board.tilePieces.length; i +=  board.width) {
            rows.push(board.tilePieces.slice(i, i +  board.width));
        }

        for(let i = 0; i < rows.length; i++) {
            madeBoard.push(<tr key={"row" + i}>
                {createRow(rows[i])}
            </tr>);
        }
        return madeBoard;
    }

    return (
        <div>
            <div className='text-center'>
            <h4>Game</h4>
            {!board && (
            <div className='text-center'>
                <button className='btn btn-primary' onClick={() => doCreateBoard()}>Generate game</button>
            </div>
            )}
            {board && (<div>Score: {points}</div>)}
            {board && (<div>Remaining moves: {maxMoves - currentMove}</div>)}
            <button className='btn btn-primary' onClick={() => doCreateBoard()}>Reset game</button>
            <div className='mt-3 w-100'>
                    <table className='mx-auto position-relative'>
                        <tbody>
                            {makeBoard()}
                        </tbody>

                    {completed && (
                        <div className="endgame">
                            <div>Oops! You ran out of moves. Score: {points}</div>
                            <div>
                            <button onClick={() => {doEmptyBoard(); doCreateBoard()}} className='btn btn-primary'>Try again</button>    
                            </div>
                        </div>
                    )}
                    </table>
            </div>
            <div className='text-center'>
            {originalItem && (<button className='btn btn-secondary' onClick={doEmptyChosen}>Reset move</button>)}
            </div>
            {message && (<div>
                {message}
            </div>)}
            </div>
        </div>
    );
}

export default Game;

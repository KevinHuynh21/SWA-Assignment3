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

    const doEmptyChosen = () => {
        dispatch((emptyChosen(gameId)) as any)
    }

    const doEmptyBoard = () => {
        dispatch(emptyCurrentGame(gameId) as any)
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

    const isSelectedElement = (item: any) => {
        if (originalItem?.position.col === item.position.col && originalItem?.position.row === item.position.row) {
            return true;
        }
    }
    const createRow = (items: any[]) => {
        const rowToDisaply = [];

        for(let i = 0 ; i < items.length; i++) {
            let selectedStyle = ``;
            const style = {
                backgroundColor: items[i].value,
            };

            if (isSelectedElement(items[i])) {
                selectedStyle = `board-item-selected`;
            }

            rowToDisaply.push(<td onClick={() => doChosenItem({ ...items[i]})} key={i} className={"board-item " + selectedStyle} style={style}></td>)
        }
        return rowToDisaply;
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
            {!board && (
            <div className='w-100 text-center mt-4 pt-4'>
                <button className='btn btn-primary m-2' onClick={() => doCreateBoard()}>Generate board</button>
            </div>
            )}
            {board && (<div className='title mt-3'>Points {points}</div>)}
            {board && (<div className='title mt-3'>Moves left: {maxMoves - currentMove}</div>)}
            <div className='mt-3 w-100'>
                    <table className='mx-auto position-relative'>
                        <tbody>
                            {makeBoard()}
                        </tbody>

                    {completed && (
                        <div className='overlay'>
                            <div>GAME FINISHED. YOUR SCORE: {points}</div>
                            <div>
                            <button onClick={() => {doEmptyBoard(); doCreateBoard()}} className='w-100 mt-2 text-center mx-auto btn btn-primary'>Again</button>    
                            </div>
                        </div>
                    )}
                    </table>
            </div>
            <div className='w-100 text-center'>
            {originalItem && (<button className='btn btn-primary m-2' onClick={doEmptyChosen}>Clear selection</button>)}
            </div>
            {message && (<div>
                {message}
            </div>)}
            </div>
    );
}

export default Game;

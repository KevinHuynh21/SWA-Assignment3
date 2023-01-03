import { useDispatch, useSelector } from "react-redux";

import { Navigate } from "react-router-dom";
import { getAllGames } from "../actions/game";
import { useEffect } from 'react';

const Leaderboard = () => {
    const dispatch = useDispatch();
    const { isLoggedIn, user } = useSelector((state: any) => state.auth);
    const { games } = useSelector((state: any) => state.game);
  
    useEffect(() => {
        dispatch(getAllGames() as any);
    });

    if (!isLoggedIn) {
      return <Navigate to="/login" />;
    }

    const showScoresFromUsers = () => {
        if(!games?.length) {
            return;
        }

        const filteredGames = games.filter((game: any) => {
            return game.completed && game.user === user.userId;
        }).sort((a: any, b: any) => {
            return b.score - a.score;
        }).slice(0, 3);


        const gamesToDisaply = [];
            for(let i = 0 ; i <filteredGames.length; i++) {
                gamesToDisaply.push(
                    <div className="score-card"  key={"global-score" + i}>
                        <div>Game ID: {filteredGames[i].id}</div>
                        <div>SCORE: {filteredGames[i].score}</div>
                        <div>USER: {filteredGames[i].user}</div>
                    </div>)
            }
            if (!gamesToDisaply.length) {
                gamesToDisaply.push(
                    <div key={'noDataUser'}>No data</div>
                )
            }

            return gamesToDisaply;
    }

    const showGlobalTopUsers = () => {
            if(!games?.length) {
                return;
            }
            const filteredGames = games.filter((game: any) => {
                return game.completed;
            }).sort((a: any, b: any) => {
                return b.score - a.score;
            }).slice(0, 10);

            const gamesToDisaply = [];
            for(let i = 0 ; i <filteredGames.length; i++) {
                gamesToDisaply.push(
                    <div className="score-card"  key={"global-score" + i}>
                        <div>Game ID: {filteredGames[i].id}</div>
                        <div>SCORE: {filteredGames[i].score}</div>
                        <div>USER: {filteredGames[i].user}</div>
                    </div>)
            }

            if (!gamesToDisaply.length) {
                gamesToDisaply.push(
                    <div key={'noDataGlobal'}>No data</div>
                )
            }

            return gamesToDisaply;
    }
  
    return (
        <div className="leaderboard">
            <div className="leaderboard-column">
                <div className="title">Your best scores</div>
                {showScoresFromUsers()}
            </div>
            
            <div className="leaderboard-column">
                <div className="title">Best scores in total</div>
                {showGlobalTopUsers()}
            </div>
        </div>
    )
}

export default Leaderboard;
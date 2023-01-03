import React, { useEffect, useState } from "react";

import { getGames } from "../services/game.service";
import { useDispatch } from "react-redux";

const Home = () => {
  const dispatch = useDispatch();
  const [content, setContent] = useState("");

  useEffect(() => {
    getGames().then(
      (response: any) => {
        setContent(response.data);
      },
      (error: any) => {
        const _content =
          (error.response && error.response.data) ||
          error.message ||
          error.toString();

        setContent(_content);
      }
    );
  }, [dispatch]);

  return (
    <div className="container">
      <header className="jumbotron">
        <h3>{content}</h3>
      </header>
    </div>
  );
 };

export default Home;
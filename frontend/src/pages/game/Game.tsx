import { Card, Hidden, Typography } from "@mui/material";
import React, { FC, useContext, useEffect } from "react";
import { GameContext } from "../../contexts/GameContext";
import useGameboard from "./GameEngine";
import { Box } from "@mui/system";
import GameEndScreen from "./GameEndScreen";

type PaddleCorrectionMessage = {
  playerIndex: number;
  position: Matter.Vector;
};

export const Game = () => {
  const { id, gameInfo, playerIndex } = useContext(GameContext);

  return (
    <>
      <Box>
        {(gameInfo?.status == "IN_PROGRESS" ||
          gameInfo?.status == "WAITING") && (
          <>
            <GameInfo></GameInfo>
            <Box
              sx={{
                display: "flex",
                width: "100%",
                height: "100%",
                justifyContent: "center",
              }}
            >
              {id && id != undefined && <GameBoard id={id} />}
            </Box>
          </>
        )}
        {gameInfo?.status == "FINISH" && (
          <>
            <GameEndScreen></GameEndScreen>
          </>
        )}
      </Box>
    </>
  );
};

type GameBoardProps = {
  id: string;
};
const GameBoard: FC<GameBoardProps> = (props) => {
  const { gameInfo, playerIndex } = useContext(GameContext);
  const [board] = useGameboard(
    playerIndex == -1 ? false : true,
    playerIndex ? playerIndex : -1,
    props.id ? props.id : "-1",
    gameInfo?.hardcore ? true : false
  );

  return <>{board}</>;
};

const GameInfo = () => {
  const { id, gameInfo, playerIndex } = useContext(GameContext);
  return (
    <Card sx={{ display: "flex", flexDirection:'column', p: 1, alignItem:'center', textAlign:'center', justifyContent: "center" }}>
        <Typography variant='h3'>
          {gameInfo?.players.map((el, index) => !index ? " " + el.username : " VS " + el.username)}
        </Typography>
        <Typography>game id: {id} | player index: {playerIndex} | hardcore: {gameInfo?.hardcore ? "yes" : "no"} | status: {gameInfo?.status}</Typography>
    </Card>
  );
};

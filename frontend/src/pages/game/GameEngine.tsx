import React, { useContext, useEffect, useRef, useState } from "react";
import Matter, { Bodies, Engine, Render, World } from "matter-js";
import useKeypress from "react-use-keypress";
import { Circle, Layer, Rect, Stage } from "react-konva";
import { useFetcher } from "react-router-dom";
import { useAuthenticatedSocket } from "../../hook/SocketHook";
import { useSocket, useSocketEvent } from "socket.io-react-hook";
import Konva from "konva";
import { Container, Typography } from "@mui/material";
import { Box } from "@mui/system";
import GameEndScreen from "./GameEndScreen";
import {
  MutationObserverLoadingResult,
  QueryClientProvider,
  useQueryClient,
} from "react-query";
import AuthToken from "../../services/auth/AuthToken";
import { relativeTimeRounding } from "moment";
import useWindowSize from "../../hook/useWindowSize";
import { Socket } from "socket.io-client";
import { GameContext } from "../../contexts/GameContext";

const GAME_HEIGHT = 200;
const GAME_WIDTH = 400;
const PADDLE_HEIGHT = 40;
const PADDLE_WIDTH = 5;
const BALL_RADIUS = 10;

type coords = {
  x: number;
  y: number;
};
type coordsPlayer = coords & {
  id: number;
  score: number;
};
type gameStateMessage = {
  gameroom_id: string;
  ball: coords;
  paddle: coordsPlayer[];
};
type gameStartMessage = {
  gameroom_id: string;
};
type endGameMessage = {
  gameroom_id: string;
  paddle: coordsPlayer[];
};

const useGameboard = (
  isPlayer: boolean,
  playerIndex: number,
  gameId: string,
  hardcore: boolean
) => {
  const { id, gameStartMessage, gameStateMessage, endGameMessage, socket } =
    useContext(GameContext);
  const [score, setScore] = useState<coordsPlayer[]>();
  const container = React.useRef<any>();
  const stage = React.useRef<Konva.Stage>();
  const paddle1 = React.useRef<Konva.Shape>();
  const paddle2 = React.useRef<Konva.Shape>();
  const ball = React.useRef<Konva.Shape>();
  const size = useWindowSize();

  const queryClient = useQueryClient();

  const duration_ball = 1 / 20;
  const duration_paddle = 0;
  let pressed: boolean = false;

  const keyUp = ({ key }: any) => {
    socket.emit("playerInput", { up: null, gameroom_id: gameId });
    pressed = false;
  };

  const keyDown = ({ key }: any) => {
    if (pressed == false) {
      if (key == "ArrowUp") {
        socket.emit("playerInput", { up: true, gameroom_id: gameId });
        pressed = true;
      }
      if (key == "ArrowDown") {
        socket.emit("playerInput", { up: false, gameroom_id: gameId });
        pressed = true;
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keyup", keyUp);
    window.addEventListener("keydown", keyDown);
    return () => {
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("keydown", keyDown);
    };
  });

  useEffect(() => {
    if (endGameMessage != undefined && endGameMessage.gameroom_id == id) {
      socket.disconnect();

      queryClient.refetchQueries("getGame");
    }
  }, [endGameMessage]);

  useEffect(() => {
    if (gameStartMessage != undefined && gameStartMessage.gameroom_id == id) {
      queryClient.refetchQueries("getGame");
    }
  }, [gameStartMessage]);

  useEffect(() => {
    if (gameStateMessage != undefined && gameStateMessage.gameroom_id == id) {
      if (gameStateMessage != undefined) {
        if (paddle1.current != undefined) {
          if (paddle1.current.getPosition().y != gameStateMessage.paddle[0].y)
            paddle1.current.to({
              y: gameStateMessage.paddle[0].y,
              duration: duration_paddle,
            });
        }
        if (paddle2.current != undefined)
          if (paddle2.current.getPosition().y != gameStateMessage.paddle[1].y) {
            paddle2.current.to({
              y: gameStateMessage.paddle[1].y,
              duration: duration_paddle,
            });
          }
        if (ball.current != undefined)
          ball.current.to({
            x: gameStateMessage.ball.x,
            y: gameStateMessage.ball.y,
            duration: duration_ball,
          });
        setScore(gameStateMessage.paddle);
      }
    }
  }, [gameStateMessage]);

  useEffect(() => {
    //responsive

    if (container.current != undefined) {
      var containerWidth = container.current.offsetWidth / 1.5;

      // but we also make the full scene visible
      // so we need to scale all objects on canvas
      var scale = containerWidth / GAME_WIDTH;

      if (stage.current != undefined) {
        stage.current.width(GAME_WIDTH * scale);
        stage.current.height(GAME_HEIGHT * scale);
        stage.current.scale({ x: scale, y: scale });
      }
    }
    // now we need to fit stage into parent containe
  }, [container, size]);

  return [
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {gameStateMessage == undefined && (
          <Typography variant="h3">WAITING FOR PLAYER</Typography>
        )}
        {score && (
          <Typography variant="h4" sx={{ textAlign: "center" }}>
            1: {score[0].score} | 2: {score[1].score}
          </Typography>
        )}
        <Box
          sx={{
            display: "flex",
            width: "100%",
            height: "100%",
            justifyContent: "center",
          }}
          ref={container}
        >
          <Stage
            ref={stage}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            style={{
              borderWidth: "1px",
              borderColor: "black",
              borderStyle: "solid",
            }}
          >
            <Layer>
              <Rect
                x={0}
                y={0}
                width={PADDLE_WIDTH}
                height={PADDLE_HEIGHT}
                fill={hardcore ? "red" : "black"}
                ref={paddle1}
              />

              <Rect
                x={GAME_WIDTH - PADDLE_WIDTH}
                y={0}
                width={PADDLE_WIDTH}
                height={PADDLE_HEIGHT}
                fill={hardcore ? "red" : "black"}
                ref={paddle2}
              />

              <Circle
                x={GAME_WIDTH / 2}
                y={GAME_HEIGHT / 2}
                width={BALL_RADIUS}
                height={BALL_RADIUS}
                fill={hardcore ? "red" : "black"}
                ref={ball}
              />
            </Layer>
          </Stage>
        </Box>
      </Box>
    </>,
  ];
};

export default useGameboard;
export type {
  coords,
  coordsPlayer,
  endGameMessage,
  gameStartMessage,
  gameStateMessage,
};

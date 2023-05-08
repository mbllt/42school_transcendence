import { Typography } from "@mui/material";
import React, {
  createContext,
  FC,
  useContext,
  useEffect,
  useState,
} from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { Socket } from "socket.io-client";
import { useSocket, useSocketEvent } from "socket.io-react-hook";
import { useAuthenticatedSocket } from "../hook/SocketHook";
import {
  endGameMessage,
  gameStartMessage,
  gameStateMessage,
} from "../pages/game/GameEngine";
import AuthToken from "../services/auth/AuthToken";
import { Game, getGame } from "../services/game/GameService";
import { AuthContext } from "./AuthContext";
type GameContextProps = {
  id: string | undefined;
  isPlayer: boolean;
  gameInfo: Game | undefined;
  playerIndex: number | undefined;
  socket: Socket;
  gameStateMessage: gameStateMessage;
  gameStartMessage: gameStartMessage;
  endGameMessage: endGameMessage;
};

type GameProviderProps = {
  children: any;
};

const GameContext = createContext<GameContextProps>({} as GameContextProps);

const GameContextProvider: FC<GameProviderProps> = (props) => {
  let { id } = useParams();
  const { user } = useContext(AuthContext);
  const [urlID, setUrlID] = useState<string>();
  const [gameExist, setGameExist] = useState<boolean>(false);
  const [isPlayer, setIsPlayer] = useState<boolean>(false);
  const [playerIndex, setPlayerIndex] = useState<number>(-1);
  const [gameInfo, setGameInfo] = useState<Game>();
  const { socket, connected, error } = useSocket(
    "ws://" + import.meta.env.VITE_BACKEND_IP + "/game",
    {
      enabled: true,
      auth: {
        authorization: new AuthToken().getToken(),
      },
    }
  );

  const { lastMessage: gameStateMessage } = useSocketEvent<gameStateMessage>(
    socket,
    "gameStateMessage"
  );

  const { lastMessage: gameStartMessage } = useSocketEvent<gameStartMessage>(
    socket,
    "gameStartMessage"
  );

  const { lastMessage: endGameMessage } = useSocketEvent<endGameMessage>(
    socket,
    "endGameMessage"
  );

  useEffect(() => {
    /* SET READY */
    socket.emit("playerInput", { up: null, gameroom_id: id });
  }, [id, connected]);

  useEffect(() => {
    setUrlID(id);
  }, [id]);

  const fetchGetGame = () => {
    if (id != null) return getGame(id);
    else setGameExist(false);
  };

  useQuery(["getGame", id], fetchGetGame, {
    onSuccess: (data: Game) => {
      setGameInfo(data);

      if (user?.username) {
        const ip = data.players.some((el) => el.username == user.username);
        if (ip) {
          if (data.players[0].username == user.username) {
            setPlayerIndex(0);
          } else {
            setPlayerIndex(1);
          }
        }
        setIsPlayer(ip);
      }
      setGameExist(true);
    },
  });

  return (
    <GameContext.Provider
      value={{
        id: urlID,
        gameInfo: gameInfo,
        isPlayer: isPlayer,
        playerIndex: playerIndex,
        socket: socket,
        endGameMessage: endGameMessage,
        gameStartMessage: gameStartMessage,
        gameStateMessage: gameStateMessage,
      }}
    >
      {gameExist == true ? (
        props.children
      ) : (
        <Typography>This game doesn't exist</Typography>
      )}
    </GameContext.Provider>
  );
};

export { GameContext, GameContextProvider };

import axios from "axios";
import AuthToken from "../auth/AuthToken";

type GameStatus =
  | "WAITING"
  | "IN_PROGRESS"
  | "FINISH"
  | "FAILED_UNACCEPTED_GAME"
  | "FAILED_USER_A_QUIT"
  | "FAILED_USER_B_QUIT";

type Game = {
  id: string;
  status: GameStatus;
  is_player_a_winner: boolean | null;
  hardcore: boolean;
  created_at: Date;
  updated_at: Date;
  game_data: {
    score: number[];
  };
  players: {
    username: string;
  }[];
};

const getGame = (id: string): Promise<Game> => {
  return axios
    .get(import.meta.env.VITE_BACKEND_HOST + "/gameroom?id=" + id, {
      headers: {
        Authorization: "Bearer " + new AuthToken().getToken(),
      },
    })
    .then((rep) => rep.data);
};

const getGameInProgress = (): Promise<Game> => {
  return axios
    .get(import.meta.env.VITE_BACKEND_HOST + "/gameroom/inprogress", {
      headers: {
        Authorization: "Bearer " + new AuthToken().getToken(),
      },
    })
    .then((rep) => rep.data);
};

const joinQueue = (hardcore: boolean): Promise<Game> => {
  return axios
    .post(
      import.meta.env.VITE_BACKEND_HOST + "/gameroom/joinQueue",
      { hardcore: hardcore },
      {
        headers: {
          Authorization: "Bearer " + new AuthToken().getToken(),
        },
      }
    )
    .then((rep) => rep.data);
};

export { getGame, getGameInProgress, joinQueue };
export type { Game };

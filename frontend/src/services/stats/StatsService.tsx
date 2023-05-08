import axios from "axios";
import AuthToken from "../auth/AuthToken";
import { User } from "../user/UserService";

type Stats = {
  numberParty: number;
  numberWin: number;
  numberLoose: number;
  winRatio: number;
  numberPartyHardcore: number;
  numberPartyHardcoreWon: number;
  hardcoreWinRatio: number;
};

type Match = {
  id: string;
  hardcore: boolean;
  created_at: Date;
  players: Pick<User, "username">[];
  is_player_a_winner: boolean;
};

const getStats = (pseudo: string): Promise<any> => {
  // //console.log("Stats pseudo : ", pseudo);
  return axios
    .get(import.meta.env.VITE_BACKEND_HOST + "/user/stats/" + pseudo, {
      headers: {
        Authorization: "Bearer " + new AuthToken().getToken(),
      },
    })
    .then((rep) => {
      return rep.data;
    });
};

const getMatchHistory = (pseudo: string): Promise<any> => {
  // //console.log("Match history pseudo : ", pseudo);
  return axios
    .get(import.meta.env.VITE_BACKEND_HOST + "/user/matchHistory/", {
      params: {
        pseudo: pseudo,
      },
      headers: {
        Authorization: "Bearer " + new AuthToken().getToken(),
      },
    })
    .then((rep) => {
      return rep.data;
    });
};

export { getMatchHistory, getStats };
export type { Match, Stats };

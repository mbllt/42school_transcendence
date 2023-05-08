import { PestControlRodentSharp } from "@mui/icons-material";
import { Button, Dialog, DialogTitle, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { FC, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { GameContext } from "../../contexts/GameContext";
import { coords, coordsPlayer, endGameMessage } from "./GameEngine";

const GameEndScreen = () => {
  const { user } = useContext(AuthContext);
  const { id, gameInfo, playerIndex } = useContext(GameContext);
  const [isWinner, setIsWinner] = useState<boolean>();
  const [winner, setWinner] = useState<String>();

  useEffect(() => {
    let is_p_a_winner = gameInfo?.is_player_a_winner;
    let winner_username = gameInfo?.players[is_p_a_winner ? 0 : 1].username;
    setIsWinner(winner_username == user?.username);
    setWinner(winner_username);
  }, []);

  return (
    <Dialog open={true}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          p: 5,
        }}
      >
        <Typography variant="h4" fontWeight={"bold"}>
          The winner is ... {winner} !
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Typography variant="h2">{gameInfo?.game_data.score[0]}</Typography>
          <Typography variant="h2">-</Typography>
          <Typography variant="h2">{gameInfo?.game_data.score[1]}</Typography>
        </Box>
        <Box>
          <Link to="/">
            <Button variant="contained">BACK TO HOME</Button>
          </Link>
        </Box>
      </Box>
    </Dialog>
  );
};

export default GameEndScreen;

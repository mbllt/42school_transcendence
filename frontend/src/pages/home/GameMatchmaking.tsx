import { Button, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useNavigate } from "react-router-dom";
import { Game, joinQueue } from "../../services/game/GameService";

const GameMatchmaking = () => {
  const navigate = useNavigate();

  const fetchJoinQueue = async (hardcore: boolean) => {
    return joinQueue(hardcore).then((el: Game) => {
      navigate("/game/" + el.id);
      //window.location.reload();
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 5
      }}
    >
      <Typography variant="h3">Matchmaking</Typography>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button variant="contained" fullWidth onClick={() => fetchJoinQueue(false)}>
          Join normal game
        </Button>
        <Button variant="contained" fullWidth onClick={() => fetchJoinQueue(true)}>
          Join hardcore game
        </Button>
      </Box>
    </Box>
  );
};

export default GameMatchmaking;

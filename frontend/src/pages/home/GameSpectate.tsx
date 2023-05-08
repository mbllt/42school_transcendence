import {
  Card,
  CardActionArea,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { Link, useNavigate } from "react-router-dom";
import { Game, getGameInProgress } from "../../services/game/GameService";
import RefreshIcon from "@mui/icons-material/Refresh";

const GameSpectate = () => {
  const [game, setGame] = useState<Game[]>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const fetchInProgressGame = () => {
    return getGameInProgress();
  };
  const { isFetching } = useQuery(["getInProgressGame"], fetchInProgressGame, {
    onSuccess: (data: Game[]) => {
      //console.log(data);
      setGame(data);
    },
  });


  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        p: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="h3">In progress</Typography>
        <IconButton
          disabled={isFetching}
          onClick={() => {
            queryClient.refetchQueries("getInProgressGame");
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>
      <Grid
        container
        gap={1}
        spacing={1}
        sx={{
          paddingBottom: 1,
          paddingTop: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
        {game &&
          game.map((el: Game, key: number) => {
            return (
              <Grid key={key} item>
                <Card sx={{ padding: 1, minHeight:80, textAlign: 'center', justifyContent:'center' }}>
                  <CardActionArea
                    onClick={() => {
                      navigate("/game/" + el.id);
                      //window.location.reload();
                    }}
                  >
                    <Typography variant='h6'>
                      {el.players[0].username} VS {el.players[1].username}
                    </Typography>
                    <Typography>game id: {el.id}</Typography>
                    <Typography>
                      hardcore: {el.hardcore ? "yes" : "no"}
                    </Typography>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
      </Grid>
    </Box>
  );
};

export default GameSpectate;

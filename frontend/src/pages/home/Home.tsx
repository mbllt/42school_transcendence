import { Container, Typography } from "@mui/material";
import { Box } from "@mui/system";
import GameMatchmaking from "./GameMatchmaking";
import GameSpectate from "./GameSpectate";

const Home = () => {
  return (
    <>
      <Container
        sx={{
          width: '100%',
          height: '80vh',
          display: "flex",
          flexDirection: "column",
          justifyContent: 'center',
          gap: 5,
          pt: 2,
        }}
      >
        <GameMatchmaking></GameMatchmaking>
        <GameSpectate></GameSpectate>
      </Container>
    </>
  );
};

export default Home;

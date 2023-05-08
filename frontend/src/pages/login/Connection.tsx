import { Card, Typography } from "@mui/material";
import { Box, Container } from "@mui/system";
import ConnectionRegular from './ConnectionRegular';
import Connection42 from './Connection42';

export const Login = () => {

  return (
    <>
    <Box sx={{ height: "100vh" }}>
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
        >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "50%",
            gap: 5,
            textAlign: "center",
          }}
        >
          <Typography variant="h2" align='center'>Transcendence</Typography>
          <Typography variant="subtitle1">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quaerat
            eveniet eligendi doloribus cumque dolor, quia distinctio. Odio quas
            reiciendis maxime repellat neque, fugit voluptate esse commodi.
            Illum amet a natus.
          </Typography>
          <Card sx={{
            p:4,
            display: "flex",
            flexDirection: "row",
            textAlign: "center",
          }}>
              <ConnectionRegular/>
              <Connection42/>
          </Card>
        </Box>
      </Container>
    </Box>
    </>
  );
};
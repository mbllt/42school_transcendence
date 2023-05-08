import React, { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import AuthToken from "../../services/auth/AuthToken";
import { authLogin, authRegister } from "../../services/auth/AuthService";
import useAsk2fa from "./useAsk2fa";

import {
  Box,
  Button,
  FormControl,
  Input,
  InputLabel,
  Typography,
} from "@mui/material";

const ConnectionRegular = () => {
  const { setConnected } = useContext(AuthContext);
  const [signup, setSignup] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("");
  const [psw, setPsw] = useState<string>("");
  const [pop2fa, handleOpen, handleClose] = useAsk2fa((code2fa: string) =>
    fetchAuthLogin(code2fa)
  );

  const fetchAuthLogin = (twofa?: string) => {
    return authLogin(username, psw, twofa)
      .catch((e) => {
        if (e.response?.status == 403) handleOpen();
      })
      .then((rep) => {
        if (rep?.message) {
          new AuthToken().setToken(rep.message);
          setConnected(true);
        }
      });
  };

  const handleConnection = async (type: string) => {
    if (type === "register")
      await authRegister(username, psw).catch(() => {});
    else await fetchAuthLogin();
  };

  return (
    <>
      {pop2fa}
      {signup ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            width: "50%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography>Please Register</Typography>
            <FormControl>
              <InputLabel htmlFor="username">username</InputLabel>
              <Input
                required
                id="username"
                onChange={(e) => setUsername(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <InputLabel htmlFor="password">password</InputLabel>
              <Input
                required
                type="password"
                id="password"
                onChange={(e) => setPsw(e.target.value)}
                onKeyDown={(e) => {if (e.key == 'Enter') handleConnection("register");}}
                />
            </FormControl>
            <Button
              variant="contained"
              onClick={() => handleConnection("register")}
              >
              Submit
            </Button>
            <Typography
              sx={[{ "&:hover": { color: "blue", cursor: "pointer" } }]}
              onClick={() => setSignup(false)}
              >
              Already have an account ?
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          width: "50%",
          }}
          >
          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography>Please Log In</Typography>
            <FormControl>
              <InputLabel htmlFor="username">username</InputLabel>
              <Input
                required
                id="username"
                onChange={(e) => setUsername(e.target.value)}
                />
            </FormControl>
            <FormControl>
              <InputLabel htmlFor="password">password</InputLabel>
              <Input
                required
                type="password"
                id="password"
                onChange={(e) => setPsw(e.target.value)}
                onKeyDown={(e) => {if (e.key == 'Enter') handleConnection("login");}}
              />
            </FormControl>
            <Button
              variant="contained"
              onClick={() => handleConnection("login")}
              >
              Submit
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
};

export default ConnectionRegular;

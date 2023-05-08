import { Box, Button, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext, useQueryParams } from "../../contexts/AuthContext";
import { SuccessConnection, auth42 } from "../../services/auth/AuthService";
import useAsk2fa from "./useAsk2fa";
import AuthToken from "../../services/auth/AuthToken";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

const Connection42 = () => {
  const { connected, setConnected } = useContext(AuthContext);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [pop2fa, handleOpen, handleClose] = useAsk2fa((code2fa: string) =>
    handleConnection(params.get("code"), code2fa)
  );

  let params = useQueryParams();

  const handleConnection = (code: string, twofa: string) => {
    //console.log(twofa);
    return auth42(code, twofa)
      .catch((e) => {
        if (e.response?.status == 400) {
          navigate("/");
          if (e.response?.data?.message) {
            enqueueSnackbar(e.response?.data?.message, { variant: "error" });
          }
        }
        if (e.response?.status == 403) handleOpen();
      })
      .then((rep) => {
        if (rep?.message) {
          new AuthToken().setToken(rep.message);
          setConnected(true);
        }
      });
  };

  useEffect(() => {
    if (!connected) {
      let url_code = params.get("code");
      if (url_code != null) {
        handleConnection(url_code, "");
      }
    }
  }, []);

  const handleClick = () => {
    window.location
      .replace(import.meta.env.VITE_42_REDIRECT_URI);
  };

  return (
    <>
      {pop2fa}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "50%",
        }}
      >
        <Typography>Connect with 42's API</Typography>
        <Button variant="contained" onClick={handleClick}>
          Connect
        </Button>
      </Box>
    </>
  );
};

export default Connection42;

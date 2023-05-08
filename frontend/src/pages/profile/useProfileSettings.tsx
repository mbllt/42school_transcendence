import { useContext, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  User,
  postAvatar,
  changeUsername,
} from "../../services/user/UserService";
import {
  activate2fa,
  disactivate2fa,
  generateQRCode,
} from "../../services/auth/AuthService";
import { Button, Dialog, DialogTitle, Switch, TextField } from "@mui/material";
import { Box } from "@mui/system";

const useProfileSettings = () => {
  const [open, setOpen] = useState<boolean>(false);
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState<string>("");
  const [img, setImg] = useState<File>();
  const [qrcode, setQrcode] = useState<string>("");
  const [twofa, setTwofa] = useState<boolean | undefined>(user?.enable2fa);
  const [openCode, setOpenCode] = useState<boolean>(false);
  const [code2fa, setCode2fa] = useState<string>("");

  const handleClose = (): void => {
    navigate("../../profile/" + user?.username);
    setQrcode("");
    setTwofa(user?.enable2fa);
    setOpen(false);
  };

  const handleOpen = (): void => {
    setOpen(true);
  };

  const fetchChangeUsername = async () => {
    if (username) return await changeUsername(username);
    // else //console.log("pas d'username");
  };

  const { refetch: handleChangeUsername, isFetching: changeUsernameFetching } =
    useQuery(["changeUsername"], fetchChangeUsername, {
      enabled: false,
      onSuccess: () => {
        queryClient.refetchQueries("getMe");
        queryClient.refetchQueries("getUsers");
      },
      onError: (err) => {
        // //console.log(err);
      },
    });

  const fetchPostAvatar = async () => {
    if (img) return await postAvatar(img);
  };

  const { refetch: handlePostAvatar, isFetching: postAvatarFetching } =
    useQuery(["postAvatar"], fetchPostAvatar, {
      enabled: false,
      onSuccess: () => {
        queryClient.refetchQueries("getMe");
        queryClient.refetchQueries("getAvatar");
      },
      onError: (err) => {
        // //console.log(err);
      },
    });

  const fetchQRCode = async () => {
    return await generateQRCode();
  };

  const { refetch: handleFetchQRCode, isFetching: fetchingQRCode } = useQuery(
    ["generateQRCode"],
    fetchQRCode,
    {
      enabled: false,
      onSuccess: (data) => {
        setQrcode(data);
      },
      onError: () => {},
    }
  );

  const fetchActivate2fa = () => {
    if (code2fa) return activate2fa(code2fa);
  };

  const { refetch: handleActivate2fa, isFetching: activate2faFetching } =
    useQuery(["activate2fa"], fetchActivate2fa, {
      enabled: false,
      onSuccess: () => {
        //console.log("sending code");
        //console.log("2fa verifyd");
        setTwofa(true);
        setOpenCode(false);
        setQrcode("");
        queryClient.refetchQueries("getMe");
      },
      onError: () => {
        setTwofa(false);
        //console.log("error activating 2fa");
      },
    });

  const fetchDisactivate2fa = () => {
    if (code2fa) return disactivate2fa(code2fa);
  };

  const { refetch: handleDisactivate2fa, isFetching: disactivate2faFetching } =
    useQuery(["disactivate2fa"], fetchDisactivate2fa, {
      enabled: false,
      onSuccess: () => {
        //console.log("2fa disactivated");
        queryClient.refetchQueries("getMe");
        setOpenCode(false);
        setTwofa(false);
      },
      onError: () => {
        //console.log("error disactivating 2fa");
      },
    });

  useEffect(() => {
    if (!qrcode)
      setOpenCode(false);
    setTwofa(user?.enable2fa);
  }, [user?.enable2fa, qrcode]);

  return [
    <>
      <Dialog onClose={handleClose} open={open} fullWidth={true}>
        <DialogTitle
          sx={{ display: "flex", justifyContent: "center", fontWeight: "bold" }}
        >
          Settings
        </DialogTitle>
        <Box
          sx={{
            display: "flex",
            p: 3,
            alignItems: "center",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <TextField
            id="outlined-basic"
            label={user?.username}
            variant="outlined"
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => {if (e.key == 'Enter') handleChangeUsername();}}
            disabled={changeUsernameFetching}
            sx={{ minWidth: 250 }}
          />
          <Button
            variant="contained"
            onClick={() => handleChangeUsername()}
            disabled={username?.length < 1 || changeUsernameFetching}
          >
            {" "}
            Change Username
          </Button>
        </Box>
        <Box
          sx={{
            display: "flex",
            p: 2,
            alignItems: "center",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <input
            id="outlined-basic"
            accept="image/png"
            type="file"
            onChange={(e) => setImg(e.target.files?.[0])}
          />
          <Button
            variant="contained"
            component="label"
            onClick={() => handlePostAvatar()}
            disabled={postAvatarFetching}
          >
            Upload File
          </Button>
        </Box>
        <Box
          sx={{
            display: "flex",
            p: 3,
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <>
            {!openCode ? (
              <>
                <Box sx={{ fontFamily: "Arial" }}>2fa</Box>
                <Switch
                  checked={twofa}
                  onChange={!twofa ? () => {handleFetchQRCode();setOpenCode(true)} : () => setOpenCode(true)}
                  disabled={!twofa ? fetchingQRCode : false}
                />
              </>
            ) : (
              <>
                {!twofa ? (<img
                  style={{ height: "150px" }}
                  src={qrcode ? qrcode : ""}
                  alt="image of qrcode"
                ></img>) : (<></>)}
                <TextField
                  id="outlined-basic"
                  variant="outlined"
                  label="2FA Code"
                  onChange={(e) => setCode2fa(e.target.value)}
                  onKeyDown={(e) => {if (e.key == 'Enter') !twofa ? handleActivate2fa() : handleDisactivate2fa();}}
                  sx={{ minWidth: 100 }}
                />
                <Button
                  variant="contained"
                  component="label"
                  onClick={!twofa ? () => handleActivate2fa() : () => handleDisactivate2fa()}
                  disabled={!twofa ? activate2faFetching : disactivate2faFetching}
                >
                  Send Code
                </Button>
              </>
            )}
          </>
        </Box>
      </Dialog>
    </>,
    handleOpen,
    handleClose,
  ];
};

export default useProfileSettings;
